/**
 * PT-027: regressions for strict metadata, request-ref resolution, observed
 * link targets, scoped goal requirements, and stricter-rule exit behavior.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import {
  LINT_RULE_IDS,
  type GoalObservation,
  type IssueObservation,
  lintIssue,
  observeGoal,
  observeIssue,
} from '../src/core/issue/lint.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const conformingPackage = path.join(
  repoRoot,
  'standard',
  'examples',
  'lint-l0-pass',
  'i-007-nucleus-only',
);
const l5Goal = path.join(repoRoot, 'standard', 'examples', 'lint-l5-scope', 'goal-root');
const cli = path.join(repoRoot, 'cli', 'bin', 'uni-spec.js');

function conformingIssue(): IssueObservation {
  const observed = observeIssue(conformingPackage);
  return {
    directoryName: observed.directoryName,
    entries: observed.entries.map((entry) => ({ ...entry })),
    files: new Map(observed.files),
    siblingDirectoryNames: [...observed.siblingDirectoryNames],
  };
}

function issueWithIndex(transform: (index: string) => string): IssueObservation {
  const issue = conformingIssue();
  const index = issue.files.get('index.md');
  if (index === undefined) throw new Error('The conforming fixture must contain index.md.');
  issue.files.set('index.md', transform(index));
  return issue;
}

function lint07Findings(goal: GoalObservation) {
  return lintIssue({ issue: conformingIssue(), goal }).findings.filter(
    (finding) => finding.ruleId === 'LINT-07',
  );
}

function runCli(args: readonly string[]): { readonly status: number; readonly stdout: string } {
  try {
    const stdout = execFileSync(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    return { status: 0, stdout };
  } catch (error) {
    const failure = error as { readonly status?: number; readonly stdout?: string };
    return { status: failure.status ?? 1, stdout: failure.stdout ?? '' };
  }
}

function withCopiedPackage(run: (directory: string) => void): void {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t-027-'));
  const directory = path.join(parent, path.basename(conformingPackage));
  cpSync(conformingPackage, directory, { recursive: true });
  try {
    run(directory);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

describe('PT-027 LINT rule fidelity', () => {
  test('PT-027-a rejects an unterminated quoted metadata scalar', () => {
    const report = lintIssue({
      issue: issueWithIndex((index) =>
        index.replace('origin: "source/request-007"', 'origin: "unterminated'),
      ),
    });

    expect(report.result).toBe('FAIL');
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'LINT-03',
          path: 'index.md',
          line: 3,
          observed: 'unterminated quoted scalar "unterminated',
        }),
      ]),
    );
  });

  test('PT-027-b requires every request reference in a verification row to resolve', () => {
    const partiallyResolved = conformingIssue();
    const testPlan = partiallyResolved.files.get('test-plan.md');
    if (testPlan === undefined) throw new Error('The conforming fixture must contain test-plan.md.');
    partiallyResolved.files.set(
      'test-plan.md',
      testPlan.replace('| T-001 | R-001 |', '| T-001 | R-001, R-999 |'),
    );

    const partialFindings = lintIssue({ issue: partiallyResolved }).findings.filter(
      (finding) => finding.ruleId === 'LINT-04',
    );
    expect(partialFindings).toEqual([
      expect.objectContaining({
        path: 'test-plan.md',
        line: 4,
        observed: 'request reference R-999 does not resolve to an accepted or undecided request',
      }),
    ]);
    expect(lintIssue({ issue: conformingIssue() }).findings).not.toContainEqual(
      expect.objectContaining({ ruleId: 'LINT-04', path: 'test-plan.md' }),
    );
  });

  test('PT-027-c resolves local links against observed regular entries', () => {
    const base = conformingIssue();
    const entries = base.entries.map((entry) =>
      entry.name === 'spec.md' ? { ...entry, kind: 'symlink' as const } : entry,
    );
    const files = new Map(base.files);
    files.delete('spec.md');
    const report = lintIssue({ issue: { ...base, entries, files } });

    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'LINT-01',
          path: 'spec.md',
          observed: 'entry spec.md (entry.kind: symlink)',
        }),
        expect.objectContaining({
          ruleId: 'LINT-06',
          path: 'index.md',
          observed: 'local destination spec.md',
        }),
      ]),
    );
  });

  test('PT-027-d attributes forbidden requirements to their US scope', () => {
    const standardScoped: GoalObservation = {
      documents: new Map([['design.md', 'US-01: Implement a linter.']]),
    };
    const excludedScoped: GoalObservation = {
      documents: new Map([['design.md', 'US-21 requires a linter.']]),
    };

    expect(lint07Findings(standardScoped)).toEqual([
      expect.objectContaining({
        path: 'design.md',
        line: 1,
        observed: 'US-01: Implement a linter.',
      }),
    ]);
    expect(lint07Findings(excludedScoped)).toEqual([]);
    expect(lint07Findings(observeGoal(path.join(repoRoot, '.arca', 'goal')))).toEqual([]);
    expect(lint07Findings(observeGoal(l5Goal))).toEqual([
      {
        ruleId: 'LINT-07',
        path: 'design.md',
        line: 3,
        observed: 'The goal requires an executable converter command and implementation plan.',
        expected: 'the five goal documents require only declarative standard and inspection evidence',
        remediation:
          'Remove the forbidden executable converter and implementation requirement from the goal document.',
      },
    ]);
  });

  test('PT-027-f makes absent and inaccessible goal roots explicit LINT-07 observations', () => {
    const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t-027-goal-'));
    const absentRoot = path.join(parent, 'absent-goal-root');
    const nonDirectoryRoot = path.join(parent, 'not-a-goal-directory');
    writeFileSync(nonDirectoryRoot, 'not a directory\n', 'utf8');
    try {
      for (const goalRoot of [absentRoot, nonDirectoryRoot]) {
        const report = lintIssue({ issue: conformingIssue(), goal: observeGoal(goalRoot) });
        const scopeFindings = report.findings.filter((finding) => finding.ruleId === 'LINT-07');
        expect(scopeFindings).toHaveLength(1);
        expect(scopeFindings[0]?.path).toBe('.');
        expect(scopeFindings[0]?.observed).toContain(path.resolve(goalRoot));
        expect(report.result).toBe('FAIL');
      }
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  test('PT-027-g keeps every rule observable after a parser failure', () => {
    const report = lintIssue({
      issue: issueWithIndex((index) =>
        index
          .replace('origin: "source/request-007"', 'origin: "unterminated')
          .replace('A conforming lint observation.', '<slug>'),
      ),
    });

    expect(report.evaluatedRules).toEqual(LINT_RULE_IDS);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: 'LINT-03' }),
        expect.objectContaining({ ruleId: 'LINT-05', observed: 'canonical template marker <slug>' }),
      ]),
    );
  });

  test.each([
    [
      'duplicate keys',
      (index: string) =>
        index.replace('status: "pending"', 'status: "pending"\nstatus: integrated'),
    ],
    [
      'a non-scalar mapping',
      (index: string) => index.replace('status: "pending"', 'status:\n  value: pending'),
    ],
    [
      'a missing closing delimiter',
      (index: string) => index.replace('status: "pending"\n---', 'status: "pending"'),
    ],
    [
      'tab indentation',
      (index: string) => index.replace('status: "pending"', 'status:\n\tvalue: pending'),
    ],
    [
      'an unterminated scalar',
      (index: string) => index.replace('origin: "source/request-007"', 'origin: "unterminated'),
    ],
  ])('PT-027-h rejects %s as strict YAML', (_description, transform) => {
    const report = lintIssue({ issue: issueWithIndex(transform) });
    expect(report.result).toBe('FAIL');
    expect(report.findings).toContainEqual(expect.objectContaining({ ruleId: 'LINT-03' }));
  });

  test('PT-027-i maps a newly strict metadata finding to a non-zero CLI exit', () => {
    expect(runCli(['issue', 'lint', conformingPackage]).status).toBe(0);

    withCopiedPackage((directory) => {
      const indexPath = path.join(directory, 'index.md');
      const index = observeIssue(directory).files.get('index.md');
      if (index === undefined) throw new Error('The copied fixture must contain index.md.');
      writeFileSync(
        indexPath,
        index.replace('origin: "source/request-007"', 'origin: "unterminated'),
        'utf8',
      );

      const result = runCli(['issue', 'lint', directory]);
      expect(result.status).not.toBe(0);
      expect(result.stdout).toContain('FAIL');
      expect(result.stdout).toContain('LINT-03');
    });
  });
});
