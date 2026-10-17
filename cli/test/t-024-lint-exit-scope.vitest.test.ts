/**
 * C-008: the lint command's process exit code.
 * C-010: the LINT-07 scope inspection re-applied to this repository's own goal.
 *
 * Both checks run against the built CLI and the real `.arca/goal/` documents,
 * because their whole point is that the shipped surface behaves as the standard
 * says on real content, not on a fixture arranged to agree with it.
 */

import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { lintIssue, observeGoal, observeIssue } from '../src/core/issue/lint.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// The binary under test is the shipped `uni-spec` entrypoint in `cli/`.
const cli = path.join(repoRoot, 'cli', 'bin', 'uni-spec.js');
const conformingPackage = path.join(
  repoRoot,
  'standard',
  'examples',
  'lint-l0-pass',
  'i-007-nucleus-only'
);

interface RunResult {
  status: number;
  stdout: string;
}

/** Run the built CLI and capture its exit status rather than throwing on it. */
function runCli(args: readonly string[], cwd: string = repoRoot): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [cli, ...args], {
      cwd,
      encoding: 'utf8',
    });
    return { status: 0, stdout };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string };
    return { status: failure.status ?? 1, stdout: failure.stdout ?? '' };
  }
}

/** Copy the conforming package to a scratch directory so edits are throwaway. */
function withCopy(run: (directory: string) => void): void {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-lint-'));
  const directory = path.join(parent, path.basename(conformingPackage));
  cpSync(conformingPackage, directory, { recursive: true });
  try {
    run(directory);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

describe('C-008 lint exit code', () => {
  test('a conforming package exits zero', () => {
    const result = runCli(['issue', 'lint', conformingPackage]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('PASS');
  });

  test('one extra entry exits non-zero', () => {
    withCopy((directory) => {
      writeFileSync(path.join(directory, 'extra.md'), '# extra\n', 'utf8');

      const result = runCli(['issue', 'lint', directory]);
      expect(result.status).not.toBe(0);
      expect(result.stdout).toContain('FAIL');
      expect(result.stdout).toContain('LINT-01');
      expect(result.stdout).toContain('extra.md');
    });
  });

  test('a finding carries all six fields through the JSON trace', () => {
    withCopy((directory) => {
      writeFileSync(path.join(directory, 'extra.md'), '# extra\n', 'utf8');

      const result = runCli(['issue', 'lint', directory, '--json']);
      expect(result.status).not.toBe(0);

      const report = JSON.parse(result.stdout) as {
        result: string;
        evaluatedRules: string[];
        findings: Record<string, unknown>[];
      };
      expect(report.result).toBe('FAIL');
      expect(report.evaluatedRules).toHaveLength(7);
      for (const finding of report.findings) {
        for (const field of ['ruleId', 'path', 'observed', 'expected', 'remediation']) {
          expect(String(finding[field]).length).toBeGreaterThan(0);
        }
        expect(Object.hasOwn(finding, 'line')).toBe(true);
      }
    });
  });
});

describe('issue collection location', () => {
  /**
   * A scaffold must land in the one collection the project already keeps, not
   * beside whatever directory the author happened to stand in. Getting this
   * wrong scatters packages across the tree and silently breaks the identity
   * allocation, which counts siblings inside a single collection.
   */
  function withProject(run: (root: string, deep: string) => void): void {
    const root = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-collection-'));
    const deep = path.join(root, 'src', 'deep');
    mkdirSync(path.join(root, '.arca', 'issue'), { recursive: true });
    mkdirSync(deep, { recursive: true });
    try {
      run(root, deep);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  test('a scaffold started from a subdirectory lands in the existing collection', () => {
    withProject((root, deep) => {
      const result = runCli(['issue', 'new', 'Terminal archive sweep'], deep);
      expect(result.status).toBe(0);

      const collection = path.join(root, '.arca', 'issue');
      expect(readdirSync(collection)).toEqual(['i-001-terminal-archive-sweep']);
      // Nothing was created beside the working directory.
      expect(readdirSync(deep)).toEqual([]);
    });
  });

  test('the printed next-step command resolves from where it was printed', () => {
    withProject((root, deep) => {
      const created = runCli(['issue', 'new', 'Terminal archive sweep'], deep);
      const printed = created.stdout
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith('uni-spec issue lint '));
      expect(printed).toBeDefined();

      const target = printed!.slice('uni-spec issue lint '.length);
      // Run the suggested command verbatim, from the directory it was shown in.
      const lint = runCli(['issue', 'lint', target], deep);
      // A fresh scaffold is all placeholders, so FAIL is the right answer here;
      // what this asserts is that the path resolved at all.
      expect(lint.stdout).toContain('FAIL');
      expect(lint.stdout).not.toContain('not found');
    });
  });

  test('a second scaffold counts siblings in the collection, not the cwd', () => {
    withProject((root, deep) => {
      runCli(['issue', 'new', 'Terminal archive sweep'], deep);
      runCli(['issue', 'new', 'Loop cleanup archive'], path.join(root, 'src'));

      expect(readdirSync(path.join(root, '.arca', 'issue')).sort()).toEqual([
        'i-001-terminal-archive-sweep',
        'i-002-loop-cleanup-archive',
      ]);
    });
  });
});

describe('C-010 standard scope invariance', () => {
  /**
   * The check the standard actually asks for: re-apply LINT-07 to the five
   * real goal documents and expect nothing. Those documents legitimately use
   * the words `CLI`, `API`, and `runtime` in sentences that *deny* executable
   * behaviour, so a word search would fail here while the rule must not.
   */
  test('LINT-07 records zero findings against the real goal documents', () => {
    const report = lintIssue({
      issue: observeIssue(conformingPackage),
      goal: observeGoal(path.join(repoRoot, '.arca', 'goal')),
    });

    const scopeFindings = report.findings.filter((finding) => finding.ruleId === 'LINT-07');
    expect(scopeFindings).toEqual([]);
  });

  test('the goal documents do contain the words a word search would trip on', () => {
    const goal = observeGoal(path.join(repoRoot, '.arca', 'goal'));
    const corpus = [...goal.documents.values()].join('\n').toLowerCase();

    // Guards the test above: if these words ever left the goal, a passing
    // LINT-07 would prove nothing about the rule's precision.
    expect(corpus).toContain('cli');
    expect(corpus).toContain('runtime');
    expect(corpus).toContain('dependency');
  });

  test('LINT-07 still fires on a goal that requires a product artefact', () => {
    const report = lintIssue({
      issue: observeIssue(conformingPackage),
      goal: observeGoal(
        path.join(repoRoot, 'standard', 'examples', 'lint-l5-scope', 'goal-root')
      ),
    });

    const scopeFindings = report.findings.filter((finding) => finding.ruleId === 'LINT-07');
    expect(scopeFindings).toHaveLength(1);
    expect(scopeFindings[0]?.observed).toContain('executable converter command');
  });
});
