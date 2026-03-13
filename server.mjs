import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAbsoluteUrl,
  buildStructuredData,
  getRouteInfo,
  getSitemapEntries,
  normalizeSiteUrl,
} from './src/content/siteContent.js';
import { generateJdFitReport } from './src/server/recruiterReport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

loadEnvFiles(
  [
    path.join(__dirname, '.env'),
    path.join(__dirname, '.env.production'),
    path.join(__dirname, '.env.local'),
    path.join(__dirname, '.env.production.local'),
  ],
  new Set(Object.keys(process.env)),
);

const host = process.env.HOST || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);
const proxyBasePath = (process.env.VITE_OPENAI_API_BASE || '/api/openai').trim().replace(/\/+$/, '');
const upstreamBaseUrl = (process.env.OPENAI_COMPAT_BASE_URL || '').trim().replace(/\/+$/, '');
const upstreamApiKey = (process.env.OPENAI_COMPAT_API_KEY || '').trim();
const defaultModel = (process.env.VITE_OPENAI_MODEL || 'qwen3.5-plus').trim();

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

let appHtmlTemplate = null;

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    if (requestUrl.pathname === '/health') {
      return sendJson(response, 200, {
        status: 'ok',
        port,
        proxyBasePath,
      });
    }

    if (requestUrl.pathname === '/robots.txt') {
      return sendText(response, 200, renderRobotsTxt(resolveSiteUrl(request)), 'text/plain; charset=utf-8');
    }

    if (requestUrl.pathname === '/sitemap.xml') {
      return sendText(response, 200, renderSitemapXml(resolveSiteUrl(request)), 'application/xml; charset=utf-8');
    }

    if (requestUrl.pathname === '/api/recruiter/jd-fit' && request.method === 'POST') {
      return handleRecruiterJdFit(request, response);
    }

    if (requestUrl.pathname === proxyBasePath || requestUrl.pathname.startsWith(`${proxyBasePath}/`)) {
      return proxyRequest(request, response, requestUrl);
    }

    if (hasFileExtension(requestUrl.pathname)) {
      return serveStaticAsset(response, requestUrl.pathname);
    }

    return serveAppDocument(request, response, requestUrl.pathname);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return sendJson(response, 500, { error: message });
  }
});

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});

async function proxyRequest(request, response, requestUrl) {
  if (!upstreamBaseUrl || !upstreamApiKey) {
    return sendJson(response, 500, {
      error: 'OPENAI_COMPAT_BASE_URL or OPENAI_COMPAT_API_KEY is not configured.',
    });
  }

  const upstreamPath = requestUrl.pathname.slice(proxyBasePath.length) || '/';
  const upstreamUrl = new URL(`/v1${upstreamPath}${requestUrl.search}`, `${upstreamBaseUrl}/`);
  const abortController = new AbortController();
  const abortUpstreamRequest = () => {
    if (!abortController.signal.aborted) {
      abortController.abort();
    }
  };

  request.once('aborted', abortUpstreamRequest);
  response.once('close', abortUpstreamRequest);

  try {
    const body = await readRequestBody(request);
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: buildProxyHeaders(request.headers, upstreamApiKey),
      body: shouldSendBody(request.method) ? body : undefined,
      signal: abortController.signal,
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    const contentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');

    if (contentType.includes('text/event-stream')) {
      responseHeaders.set('cache-control', 'no-cache');
      responseHeaders.set('x-accel-buffering', 'no');
    }

    response.writeHead(upstreamResponse.status, Object.fromEntries(responseHeaders.entries()));
    response.flushHeaders?.();

    if (!upstreamResponse.body) {
      response.end();
      return;
    }

    await pipeResponseBody(upstreamResponse.body, response, abortController);
  } catch (error) {
    if (abortController.signal.aborted || response.destroyed) {
      return;
    }

    const message = error instanceof Error ? error.message : 'Unexpected proxy error';

    if (!response.headersSent) {
      return sendJson(response, 502, { error: message });
    }

    response.destroy(error instanceof Error ? error : new Error(String(error)));
  } finally {
    request.off('aborted', abortUpstreamRequest);
    response.off('close', abortUpstreamRequest);
  }
}

async function handleRecruiterJdFit(request, response) {
  try {
    const payload = await readJsonRequest(request);
    const report = await generateJdFitReport({
      upstreamBaseUrl,
      upstreamApiKey,
      model: typeof payload.model === 'string' && payload.model.trim() ? payload.model.trim() : defaultModel,
      jobText: payload.jobText,
      jobUrl: payload.jobUrl,
    });

    return sendJson(response, 200, report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JD 匹配报告生成失败。';
    const statusCode =
      /请至少提供岗位链接或 JD 文本|岗位链接|请求体不是有效 JSON/.test(message) ? 400 : 500;

    return sendJson(response, statusCode, { error: message });
  }
}

async function serveStaticAsset(response, pathname) {
  const normalizedPath = sanitizeAssetPath(pathname);
  const filePath = path.join(distDir, normalizedPath);

  if (!(await isFile(filePath))) {
    return sendJson(response, 404, { error: 'Asset not found.' });
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes.get(extension) || 'application/octet-stream';
  const content = await readFile(filePath);

  response.writeHead(200, {
    'Cache-Control': filePath.includes(`${path.sep}assets${path.sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
    'Content-Type': contentType,
  });
  response.end(content);
}

async function serveAppDocument(request, response, pathname) {
  const indexPath = path.join(distDir, 'index.html');

  if (!(await isFile(indexPath))) {
    return sendJson(response, 500, {
      error: 'dist directory is missing. Run npm run build before starting the server.',
    });
  }

  if (!appHtmlTemplate) {
    appHtmlTemplate = await readFile(indexPath, 'utf8');
  }

  const route = getRouteInfo(pathname);
  const siteUrl = resolveSiteUrl(request);
  const canonical = buildAbsoluteUrl(route.seo.path, siteUrl);
  const image = buildAbsoluteUrl(route.seo.image, siteUrl);
  const structuredData = JSON.stringify(buildStructuredData(route, siteUrl)).replace(/</g, '\\u003c');
  const html = appHtmlTemplate
    .replaceAll('__SEO_TITLE__', escapeHtml(route.seo.title))
    .replaceAll('__SEO_DESCRIPTION__', escapeHtml(route.seo.description))
    .replaceAll('__SEO_CANONICAL__', escapeHtml(canonical))
    .replaceAll('__SEO_OG_IMAGE__', escapeHtml(image))
    .replaceAll('__SEO_OG_TYPE__', escapeHtml(route.seo.type))
    .replaceAll('__SEO_JSON_LD__', structuredData);

  response.writeHead(route.kind === 'notFound' ? 404 : 200, {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8',
  });
  response.end(html);
}

function buildProxyHeaders(headers, apiKey) {
  const nextHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (!value) {
      continue;
    }

    if (name.toLowerCase() === 'host' || name.toLowerCase() === 'authorization') {
      continue;
    }

    if (Array.isArray(value)) {
      nextHeaders.set(name, value.join(', '));
      continue;
    }

    nextHeaders.set(name, value);
  }

  nextHeaders.set('authorization', `Bearer ${apiKey}`);
  return nextHeaders;
}

function loadEnvFiles(filePaths, inheritedEnvKeys) {
  for (const filePath of filePaths) {
    try {
      const content = readEnvFile(filePath);

      for (const [key, value] of Object.entries(content)) {
        if (inheritedEnvKeys.has(key)) {
          continue;
        }

        process.env[key] = value;
      }
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

function readEnvFile(filePath) {
  const content = requireTextFile(filePath);
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function requireTextFile(filePath) {
  return readFileSync(filePath, 'utf8');
}

async function isFile(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function readJsonRequest(request) {
  const rawBody = await readRequestBody(request);

  if (rawBody.length === 0) {
    return {};
  }

  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    throw new Error('请求体不是有效 JSON。');
  }
}

async function pipeResponseBody(body, response, abortController) {
  const reader = body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (abortController.signal.aborted || response.destroyed) {
        return;
      }

      if (!value || value.length === 0) {
        continue;
      }

      if (!response.write(Buffer.from(value))) {
        await once(response, 'drain');
      }
    }

    response.end();
  } finally {
    reader.releaseLock();
  }
}

function shouldSendBody(method) {
  return method !== 'GET' && method !== 'HEAD';
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-cache',
    'Content-Type': contentType,
  });
  response.end(body);
}

function hasFileExtension(pathname) {
  return path.extname(pathname) !== '';
}

function sanitizeAssetPath(pathname) {
  return path
    .normalize(decodeURIComponent(pathname))
    .replace(/^(\.\.(\/|\\|$))+/, '')
    .replace(/^([/\\])+/, '');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveSiteUrl(request) {
  const configured = (process.env.APP_URL || process.env.SITE_URL || '').trim();

  if (configured) {
    const withProtocol = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    return normalizeSiteUrl(withProtocol);
  }

  const forwardedProto = getFirstHeaderValue(request.headers['x-forwarded-proto']) || 'http';
  const forwardedHost = getFirstHeaderValue(request.headers['x-forwarded-host']);
  const hostHeader = forwardedHost || request.headers.host || `localhost:${port}`;
  return normalizeSiteUrl(`${forwardedProto}://${hostHeader}`);
}

function getFirstHeaderValue(value) {
  if (!value) {
    return '';
  }

  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value.split(',')[0].trim();
}

function renderRobotsTxt(siteUrl) {
  return `User-agent: *\nAllow: /\nSitemap: ${buildAbsoluteUrl('/sitemap.xml', siteUrl)}\n`;
}

function renderSitemapXml(siteUrl) {
  const urls = getSitemapEntries()
    .map(
      (entry) =>
        `<url><loc>${escapeXml(buildAbsoluteUrl(entry.path, siteUrl))}</loc><lastmod>${entry.lastModified}</lastmod></url>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
