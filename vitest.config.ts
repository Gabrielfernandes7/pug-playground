import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Meta do MODERNIZE.md: cobertura de pelo menos 80% no núcleo de domínio
      include: ['src/core/**/*.ts', 'src/app/logic.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
