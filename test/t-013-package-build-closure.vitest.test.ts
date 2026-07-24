import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  name: string;
  private: boolean;
  packageManager: string;
  scripts: Record<string, string>;
};

test('PT-013 configured Vitest runner reaches the private package closure', () => {
  expect(pkg.name).toBe('uni-spec-cli');
  expect(pkg.private).toBe(true);
  expect(pkg.packageManager).toBe('pnpm@9.15.9');
  expect(pkg.scripts.build).toBe('node build.js');
  expect(pkg.scripts.test).toContain('node --test test/*.test.mjs');
});
