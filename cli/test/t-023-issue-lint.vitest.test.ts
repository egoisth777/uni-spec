/**
 * C-007 / PT-027-e: replay the six recorded lint traces in
 * `standard/examples/lint-findings/` against the validator and compare every
 * field of every finding. The published traces are the oracle, including their
 * ordered finding arrays and their exact expected/remediation prose.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import {
  LINT_RULE_IDS,
  type EntryKind,
  type IssueObservation,
  lintIssue,
  observeGoal,
  observeIssue,
} from '../src/core/issue/lint.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const examplesRoot = path.join(repoRoot, 'standard', 'examples');
const tracesRoot = path.join(examplesRoot, 'lint-findings');

interface RecordedFinding {
  ruleId: string;
  path: string;
  line: number | null;
  observed: string;
  expected: string;
  remediation: string;
}

interface RecordedTrace {
  state: string;
  target: string | { issueRoot: string; goalRoot: string };
  entryKinds: Record<string, EntryKind>;
  evaluatedRules: string[];
  findings: RecordedFinding[];
  result: 'PASS' | 'FAIL';
}

function readTrace(name: string): RecordedTrace {
  return JSON.parse(readFileSync(path.join(tracesRoot, `${name}.json`), 'utf8')) as RecordedTrace;
}

/**
 * Build an observation for a documentary fixture: the aspect text is on disk in
 * a flat folder, while the target directory name and entry kinds live only in
 * the trace (a symlink cannot be created portably on Windows).
 */
function documentaryObservation(fixtureDirectory: string, trace: RecordedTrace): IssueObservation {
  const target = trace.target as string;
  const directoryName = path.posix.basename(target);
  const folder = path.join(examplesRoot, fixtureDirectory);

  const files = new Map<string, string>();
  for (const [name, kind] of Object.entries(trace.entryKinds)) {
    if (kind !== 'regular-file') continue;
    try {
      files.set(name, readFileSync(path.join(folder, name), 'utf8'));
    } catch {
      // Entry kinds may name a file the documentary fixture does not ship.
    }
  }

  return {
    directoryName,
    entries: Object.entries(trace.entryKinds).map(([name, kind]) => ({ name, kind })),
    files,
    siblingDirectoryNames: [directoryName],
  };
}

const cases: { trace: string; observe: () => { issue: IssueObservation; goal?: ReturnType<typeof observeGoal> } }[] = [
  {
    trace: 'l0',
    observe: () => ({
      issue: observeIssue(path.join(examplesRoot, 'lint-l0-pass', 'i-007-nucleus-only')),
    }),
  },
  {
    trace: 'l1',
    observe: () => ({ issue: documentaryObservation('lint-l1-shape', readTrace('l1')) }),
  },
  {
    trace: 'l2',
    observe: () => ({ issue: documentaryObservation('lint-l2-metadata', readTrace('l2')) }),
  },
  {
    trace: 'l3',
    observe: () => ({ issue: documentaryObservation('lint-l3-content', readTrace('l3')) }),
  },
  {
    trace: 'l4',
    observe: () => ({ issue: documentaryObservation('lint-l4-links-token', readTrace('l4')) }),
  },
  {
    trace: 'l5',
    observe: () => ({
      issue: observeIssue(
        path.join(examplesRoot, 'lint-l5-scope', 'issue-target', 'i-012-scope-guard'),
      ),
      goal: observeGoal(path.join(examplesRoot, 'lint-l5-scope', 'goal-root')),
    }),
  },
];

describe('C-007 recorded lint traces', () => {
  for (const testCase of cases) {
    const trace = readTrace(testCase.trace);

    test(`${trace.state} reproduces its recorded findings`, () => {
      const report = lintIssue(testCase.observe());

      expect(report.evaluatedRules).toEqual(LINT_RULE_IDS);
      expect(report.evaluatedRules).toEqual(trace.evaluatedRules);
      expect(report.findings).toEqual(trace.findings);
      expect(report.result).toBe(trace.result);

      // Carried over from the retired root duplicate (PT-029-h): deep equality
      // pins the findings to the trace, but these hold independently of it.
      for (const finding of report.findings) {
        expect(LINT_RULE_IDS).toContain(finding.ruleId);
        expect(finding.line === null || finding.line > 0).toBe(true);
      }
    });
  }

  test('every rule is evaluated even when an earlier rule fails', () => {
    const report = lintIssue(documentaryFailure());
    expect(report.evaluatedRules).toEqual(LINT_RULE_IDS);
    expect(new Set(report.findings.map((finding) => finding.ruleId)).size).toBeGreaterThan(1);
  });
});

/** A target that trips several rules at once, proving no rule short-circuits. */
function documentaryFailure(): { issue: IssueObservation } {
  return {
    issue: {
      directoryName: 'i-000-bad',
      entries: [{ name: 'index.md', kind: 'regular-file' }],
      files: new Map([['index.md', '---\nissue-id: "i-000-bad"\n---\n\n## Summary\n<slug>\n']]),
      siblingDirectoryNames: ['i-000-bad'],
    },
  };
}
