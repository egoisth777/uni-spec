/**
 * PT-029: the frozen root heritage holds no uni-spec applier work.
 *
 * `US-26` freezes the inherited OpenSpec surface: it stays present until `cli/`
 * fully replaces it, but it gains no new command, source, schema, test, or
 * completion definition. The violation this guard exists for is the one that
 * actually happened - applier work landing at the root instead of in `cli/`.
 *
 * The detection is one function over an arbitrary root, so the same code that
 * clears the real tree is the code proven to fail on a planted violation.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Applier-owned paths, which belong under `cli/` and nowhere else. */
const applierOnlyPaths = ['src/core/issue', 'src/commands/issue.ts', 'schemas/uni-spec'];

/** Every `.ts`/`.mjs`/`.js` file under a directory of `root`, recursively. */
function sourceFiles(root, relativeDirectory) {
  const absolute = path.join(root, relativeDirectory);
  if (!existsSync(absolute)) return [];

  const found = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(child);
        continue;
      }
      if (/\.(ts|mjs|js)$/.test(entry.name)) {
        found.push(path.relative(root, child).split(path.sep).join('/'));
      }
    }
  };
  walk(absolute);
  return found;
}

/**
 * Every way applier work shows up under a root heritage, as one message per
 * violation. An empty array means the heritage is clean. This is a predicate
 * over the tree rather than a pinned file list, so a newly added duplicate is
 * inside its domain - which `PT-029-f` proves by planting one.
 */
function findApplierViolations(root) {
  const violations = [];

  for (const relativePath of applierOnlyPaths) {
    if (existsSync(path.join(root, relativePath))) {
      violations.push(`${relativePath} is applier work and belongs under cli/, not the frozen root heritage`);
    }
  }

  for (const relativePath of sourceFiles(root, 'src')) {
    const body = readFileSync(path.join(root, relativePath), 'utf8');
    if (/from\s+['"][^'"]*core\/issue\//.test(body)) {
      violations.push(`${relativePath} imports the applier core; that work belongs under cli/`);
    }
    if (/registerIssueCommand/.test(body)) {
      violations.push(`${relativePath} still references registerIssueCommand`);
    }
    // Matched on declaration shape, so unrelated prose or a `gh issue`
    // argument list is not mistaken for a route.
    if (/\.command\(\s*['"]issue\b/.test(body)) {
      violations.push(`${relativePath} still registers an "issue" command in the frozen heritage`);
    }
    if (/\bname:\s*['"]issue['"]/.test(body)) {
      violations.push(`${relativePath} still lists "issue" in a command or completion registry`);
    }
  }

  return violations.sort();
}

/** PT-029-a: no applier source, import, or registration survives outside `cli/`. */
test('PT-029-a keeps every applier source inside cli/', () => {
  assert.deepEqual(findApplierViolations(repositoryRoot), []);
});

/** PT-029-b: the root CLI entry point exposes no issue route. */
test('PT-029-b leaves no issue route reachable from the root CLI', () => {
  const entry = readFileSync(path.join(repositoryRoot, 'src/cli/index.ts'), 'utf8');
  assert.ok(!/registerIssueCommand/.test(entry), 'src/cli/index.ts still registers an issue command');
  assert.ok(
    !/commands\/issue(\.js|\.ts)?['"]/.test(entry),
    'src/cli/index.ts still imports the retired issue command module',
  );

  // The built entry point must not advertise it either.
  const help = execFileSync(process.execPath, [path.join(repositoryRoot, 'dist/cli/index.js'), '--help'], {
    encoding: 'utf8',
  });
  assert.ok(!/^\s*issue\b/m.test(help), 'the built root CLI still lists an issue command');
});

/** PT-029-c: the applier binary exposes the uni-spec surface and nothing else. */
test('PT-029-c exposes exactly the uni-spec applier command surface', () => {
  const binary = path.join(repositoryRoot, 'cli/bin/uni-spec.js');
  assert.ok(existsSync(binary), 'cli/bin/uni-spec.js must exist');

  const help = execFileSync(process.execPath, [binary, 'issue', '--help'], { encoding: 'utf8' });
  for (const subcommand of ['new', 'lint', 'status']) {
    assert.match(help, new RegExp(`\\b${subcommand}\\b`), `issue ${subcommand} must be reachable`);
  }
  for (const retired of ['change', 'workset', 'doctor', 'telemetry']) {
    assert.ok(!new RegExp(`\\b${retired}\\b`).test(help), `${retired} must not reach the applier`);
  }

  const manifest = JSON.parse(readFileSync(path.join(repositoryRoot, 'cli/package.json'), 'utf8'));
  assert.deepEqual(Object.keys(manifest.bin ?? {}), ['uni-spec']);
});

/** PT-029-d: no applier test exists twice across the repository. */
test('PT-029-d holds each applier test exactly once', () => {
  const rootTests = readdirSync(path.join(repositoryRoot, 'test'));
  const cliTests = readdirSync(path.join(repositoryRoot, 'cli/test'));
  const duplicates = rootTests.filter((name) => cliTests.includes(name));
  assert.deepEqual(duplicates, [], `these applier tests exist in both test/ and cli/test/: ${duplicates}`);

  // The root suite is governance only; applier behaviour is proven in cli/test.
  for (const name of rootTests) {
    assert.ok(
      !/issue|lint|scaffold|identity/.test(name),
      `test/${name} is applier coverage and belongs in cli/test/`,
    );
  }
});

/**
 * PT-029-f: the guard is a detector, not a snapshot. A real copy of the
 * heritage gains real applier files, and the same function that clears the
 * live tree must name every one of them.
 */
test('PT-029-f detects a fresh applier addition under the root heritage', () => {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t-029-'));
  const plantedRoot = path.join(parent, 'heritage');

  try {
    cpSync(path.join(repositoryRoot, 'src'), path.join(plantedRoot, 'src'), { recursive: true });
    // A clean copy must be as clean as the original, or the rest proves nothing.
    assert.deepEqual(findApplierViolations(plantedRoot), []);

    // Plant one of each violation kind.
    mkdirSync(path.join(plantedRoot, 'src/core/issue'), { recursive: true });
    mkdirSync(path.join(plantedRoot, 'schemas/uni-spec'), { recursive: true });
    writeFileSync(path.join(plantedRoot, 'src/core/issue/probe.ts'), 'export const probe = 1;\n', 'utf8');
    writeFileSync(
      path.join(plantedRoot, 'src/commands/issue.ts'),
      "import { x } from '../core/issue/probe.js';\nexport function registerIssueCommand(p) { p.command('issue'); }\n",
      'utf8',
    );
    writeFileSync(path.join(plantedRoot, 'schemas/uni-spec/schema.yaml'), 'artifacts: []\n', 'utf8');

    const violations = findApplierViolations(plantedRoot);
    const joined = violations.join('\n');
    assert.match(joined, /src\/core\/issue is applier work/);
    assert.match(joined, /schemas\/uni-spec is applier work/);
    assert.match(joined, /src\/commands\/issue\.ts is applier work/);
    assert.match(joined, /src\/commands\/issue\.ts imports the applier core/);
    assert.match(joined, /src\/commands\/issue\.ts still references registerIssueCommand/);
    assert.match(joined, /src\/commands\/issue\.ts still registers an "issue" command/);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
