import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'chatllm-computer-f902bb962-vnc.default.svc.cluster.local.',
      'chatllm-computer-f902bb962-vnc.default.svc.cluster.local',
      '.preview.abacusai.app',
      '.na112.preview.abacusai.app',
    ],
  },
});
