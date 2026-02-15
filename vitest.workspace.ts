import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineWorkspace([
  {
    plugins: [react()],
    test: {
      name: 'browser',
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
      },
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: [
        'src/test/components/**/*.test.{ts,tsx}',
        'src/test/styles/**/*.test.ts',
        'src/test/blog-posts.test.ts',
        'src/test/jsfxr-esm.test.ts',
      ],
    },
  },
  {
    test: {
      name: 'node',
      environment: 'node',
      globals: true,
      include: ['src/test/e18e-analyzer/**/*.test.ts'],
    },
  },
]);
