/**
 * t-025 - collection-wide lint.
 *
 * The single-package exit contract is C-008: zero on PASS, non-zero on any
 * finding. This suite pins the CLI convenience that fans that contract out
 * across a collection:
 *
 *   - classification is structural (`index.md` means package; candidate
 *     children mean collection; anything else stays single-package);
 *   - only direct candidate children are linted, so `archive/` is excluded
 *     naturally;
 *   - an empty walk FAILs rather than claiming a vacuous PASS;
 *   - the built binary discovers `.arca/issue` on a bare `issue lint`.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import {
  classifyLintTarget,
  lintCollection,
} from '../src/core/issue/collection.js';
import { scaffoldIssue } from '../src/core/issue/scaffold.js';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const cli = path.join(repoRoot, 'cli', 'bin', 'uni-spec.js');
const templateDir = path.join(repoRoot, 'standard', 'templates', 'issue');
const conformingPackage = path.join(
  repoRoot,
  'standard',
  'examples',
  'lint-l0-pass',
  'i-007-nucleus-only'
);

function withTempDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-collection-'));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Copies the standard's conforming example in as a passing package. */
function addConforming(root: string): string {
  const target = path.join(root, 'i-007-nucleus-only');
  cpSync(conformingPackage, target, { recursive: true });
  return target;
}

/** A fresh scaffold deliberately fails lint (LINT-05: unfilled markers). */
function addFailing(root: string): string {
  const created = scaffoldIssue({
    parentDirectory: root,
    title: 'Fresh scaffold',
    origin: 'source/t-025',
    templateDir,
  });
  return created.directory;
}

interface RunResult {
  status: number;
  stdout: string;
}

/** Run the built CLI and capture its exit status rather than throwing on it. */
function runCli(args: readonly string[], cwd: string): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [cli, ...args], {
      cwd,
      encoding: 'utf-8',
    });
    return { status: 0, stdout };
  } catch (error) {
    const failure = error as { status?: number | null; stdout?: string };
    return { status: failure.status ?? -1, stdout: failure.stdout ?? '' };
  }
}

describe('classification is structural', () => {
  test('a directory carrying index.md is a package', () => {
    withTempDir((dir) => {
      const pkg = addConforming(dir);
      expect(classifyLintTarget(pkg)).toBe('package');
    });
  });

  test('a directory with candidate children is a collection', () => {
    withTempDir((dir) => {
      addConforming(dir);
      expect(classifyLintTarget(dir)).toBe('collection');
    });
  });

  test('an empty directory falls through to single-package lint', () => {
    withTempDir((dir) => {
      expect(classifyLintTarget(dir)).toBe('package');
    });
  });
});

describe('lintCollection', () => {
  test('mixed collection FAILs and carries one report per package', () => {
    withTempDir((dir) => {
      addConforming(dir);
      addFailing(dir);

      const result = lintCollection(dir);

      expect(result.result).toBe('FAIL');
      expect(result.packages).toHaveLength(2);
      // Allocation fills the smallest free number, so the fresh scaffold is
      // i-001-fresh-scaffold and sorts ahead of the conforming i-007.
      expect(path.basename(result.packages[0]!.directory)).toBe(
        'i-001-fresh-scaffold'
      );
      expect(result.packages[0]!.report.result).toBe('FAIL');
      expect(result.packages[1]!.report.result).toBe('PASS');
    });
  });

  test('all-conforming collection PASSes', () => {
    withTempDir((dir) => {
      addConforming(dir);

      const result = lintCollection(dir);

      expect(result.result).toBe('PASS');
      expect(result.packages).toHaveLength(1);
    });
  });

  test('an empty walk FAILs instead of claiming a vacuous PASS', () => {
    withTempDir((dir) => {
      const result = lintCollection(dir);

      expect(result.result).toBe('FAIL');
      expect(result.packages).toHaveLength(0);
    });
  });

  test('archive/ is outside the live collection', () => {
    withTempDir((dir) => {
      addConforming(dir);
      const archive = path.join(dir, 'archive');
      mkdirSync(archive);
      addFailing(archive);

      const result = lintCollection(dir);

      expect(result.result).toBe('PASS');
      expect(result.packages).toHaveLength(1);
    });
  });
});

describe('CLI exit codes over a collection (C-008 fan-out)', () => {
  test('exit 0 when every package passes', () => {
    withTempDir((dir) => {
      addConforming(dir);

      const run = runCli(['issue', 'lint', dir], dir);

      expect(run.status).toBe(0);
      expect(run.stdout).toContain('1/1 package(s) pass.');
    });
  });

  test('exit 1 when any package fails', () => {
    withTempDir((dir) => {
      addConforming(dir);
      addFailing(dir);

      const run = runCli(['issue', 'lint', dir], dir);

      expect(run.status).toBe(1);
      expect(run.stdout).toContain('1/2 package(s) pass.');
    });
  });

  test('--json reports root, result, and one entry per package', () => {
    withTempDir((dir) => {
      addConforming(dir);
      addFailing(dir);

      const run = runCli(['issue', 'lint', dir, '--json'], dir);

      expect(run.status).toBe(1);
      const parsed = JSON.parse(run.stdout) as {
        root: string;
        result: string;
        packages: { directory: string; report: { result: string } }[];
      };
      expect(path.basename(parsed.root)).toBe(path.basename(dir));
      expect(parsed.result).toBe('FAIL');
      expect(parsed.packages).toHaveLength(2);
      for (const entry of parsed.packages) {
        expect(typeof entry.directory).toBe('string');
        expect(['PASS', 'FAIL']).toContain(entry.report.result);
      }
    });
  });

  test('bare `issue lint` discovers .arca/issue from the working directory', () => {
    withTempDir((dir) => {
      const collection = path.join(dir, '.arca', 'issue');
      mkdirSync(collection, { recursive: true });
      addConforming(collection);

      const run = runCli(['issue', 'lint'], dir);

      expect(run.status).toBe(0);
      expect(run.stdout).toContain('1/1 package(s) pass.');
    });
  });
});
