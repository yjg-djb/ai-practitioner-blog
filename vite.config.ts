import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const proxyTarget = (env.OPENAI_COMPAT_BASE_URL || '').trim().replace(/\/+$/, '');
  const proxyHeaders = env.OPENAI_COMPAT_API_KEY
    ? {
        Authorization: `Bearer ${env.OPENAI_COMPAT_API_KEY}`,
      }
    : undefined;

  return {
    plugins: [react(), tailwindcss()],
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
