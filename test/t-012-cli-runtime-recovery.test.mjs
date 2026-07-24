import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** PT-012: the selectively recovered CLI entrypoint must execute read-only help. */
test('PT-012_cli_runtime_smoke', () => {
  const output = execFileSync(process.execPath, ['bin/openspec.js', '--help'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });

  assert.match(output, /Usage: openspec/);
  assert.match(output, /AI-native system for spec-driven development/);
  assert.equal(existsSync(path.join(root, 'website')), false, 'website purge must remain intact');
  assert.equal(existsSync(path.join(root, 'openspec')), false, 'openspec purge must remain intact');
});
