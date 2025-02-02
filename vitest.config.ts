// import { defineConfig } from 'vitest/config';

// export default defineConfig({
//   test: {
//     coverage: {
//       provider: 'v8',
//       reporter: ['text', 'json', 'html'],
//     },
//     environment: 'node',
//     include: ['**/*.test.ts'],
//   },
// });

import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  appType: 'custom',
  test: {
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
    },
    typecheck: {
      tsconfig: './tsconfig.json',
    },
    pool: 'threads',
    exclude: ['**/node_modules/**', '**/dist/**'],

    workspace: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['{src,test}/**/*.{test,spec}.ts'],
          exclude: ['{src,test}/**/*.e2e-spec.ts', '**/node_modules/**', '**/dist/**'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['{src,test}/**/*.e2e-spec.ts', '**/node_modules/**', '**/dist/**'],
        },
      },
    ],
  },
  plugins: [
    swc.vite({
      configFile: '.swcrc',
    }),
  ],
});
