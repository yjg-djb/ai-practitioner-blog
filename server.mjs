import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
]);

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

    if (requestUrl.pathname === proxyBasePath || requestUrl.pathname.startsWith(`${proxyBasePath}/`)) {
      return proxyRequest(request, response, requestUrl);
    }

    return serveStaticAsset(response, requestUrl.pathname);
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

async function serveStaticAsset(response, pathname) {
  let relativePath = decodeURIComponent(pathname);

  if (relativePath === '/') {
    relativePath = '/index.html';
  }

  const normalizedPath = path
    .normalize(relativePath)
    .replace(/^(\.\.(\/|\\|$))+/, '')
    .replace(/^([/\\])+/, '');
  let filePath = path.join(distDir, normalizedPath);

  if (!(await isFile(filePath))) {
    if (path.extname(normalizedPath)) {
      return sendJson(response, 404, { error: 'Asset not found.' });
    }

    filePath = path.join(distDir, 'index.html');
  }

  if (!(await isFile(filePath))) {
    return sendJson(response, 500, {
      error: 'dist directory is missing. Run npm run build before starting the server.',
    });
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
