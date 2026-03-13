import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { generateJdFitReport } from './src/server/recruiterReport.js';

function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    request.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('请求体不是有效 JSON。'));
      }
    });

    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const proxyTarget = (env.OPENAI_COMPAT_BASE_URL || '').trim().replace(/\/+$/, '');
  const proxyHeaders = env.OPENAI_COMPAT_API_KEY
    ? {
        Authorization: `Bearer ${env.OPENAI_COMPAT_API_KEY}`,
      }
    : undefined;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'recruiter-jd-fit-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/recruiter/jd-fit', async (request, response, next) => {
            if (request.method !== 'POST') {
              next();
              return;
            }

            try {
              const payload = await readJsonBody(request);
              const report = await generateJdFitReport({
                upstreamBaseUrl: (env.OPENAI_COMPAT_BASE_URL || '').trim().replace(/\/+$/, ''),
                upstreamApiKey: (env.OPENAI_COMPAT_API_KEY || '').trim(),
                model:
                  typeof payload.model === 'string' && payload.model.trim()
                    ? payload.model.trim()
                    : (env.VITE_OPENAI_MODEL || 'qwen3.5-plus').trim(),
                jobText: typeof payload.jobText === 'string' ? payload.jobText : undefined,
                jobUrl: typeof payload.jobUrl === 'string' ? payload.jobUrl : undefined,
              });

              sendJson(response, 200, report);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'JD 匹配报告生成失败。';
              const statusCode =
                /请至少提供岗位链接或 JD 文本|岗位链接|请求体不是有效 JSON/.test(message) ? 400 : 500;

              sendJson(response, statusCode, { error: message });
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: proxyTarget
        ? {
            '/api/openai': {
              target: proxyTarget,
              changeOrigin: true,
              headers: proxyHeaders,
              rewrite: (requestPath) => requestPath.replace(/^\/api\/openai/, '/v1'),
            },
          }
        : undefined,
    },
  };
});
