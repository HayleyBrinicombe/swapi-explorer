import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist/client' },
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
  test: {
    environment: 'node',
    clearMocks: true,
    include: ['src/**/*.test.tsx', 'server/**/*.test.ts'],
  },
});
