/**
 * PT-028: the docs-only boundary is guarded by two executable obligations -
 * `standard/` cannot change without its digest manifest changing in the same
 * edit, and the corrected LINT-07 still reports nothing against the five real
 * goal documents for the `US-01`..`US-12` range it governs.
 */

import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import {
  MANIFEST_RELATIVE_PATH,
  checkStandardBoundary,
  digestStandardTree,
  readStandardManifest,
} from '../src/core/standard/boundary.js';

import {
  type GoalObservation,
  lintIssue,
  observeGoal,
  observeIssue,
} from '../src/core/issue/lint.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const standardRoot = path.join(repoRoot, 'standard');
const manifestPath = path.join(repoRoot, MANIFEST_RELATIVE_PATH);
const goalRoot = path.join(repoRoot, '.arca', 'goal');
const conformingPackage = path.join(
  repoRoot,
  'standard',
  'examples',
  'lint-l0-pass',
  'i-007-nucleus-only',
);

/** LINT-07 findings only: the rule that owns the docs-only boundary. */
function lint07(goal: GoalObservation) {
  return lintIssue({ issue: observeIssue(conformingPackage), goal }).findings.filter(
    (finding) => finding.ruleId === 'LINT-07',
  );
}

/** A throwaway copy of `standard/` so mutation cases never touch the real tree. */
function withStandardCopy(mutate: (copyRoot: string) => void): string[] {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t-028-'));
  const copyRoot = path.join(parent, 'standard');
  try {
    cpSync(standardRoot, copyRoot, { recursive: true });
    mutate(copyRoot);
    return checkStandardBoundary(copyRoot, readStandardManifest(manifestPath));
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

describe('PT-028 standard boundary guard', () => {
  test('PT-028-a manifests every standard/ file exactly once with a matching digest', () => {
    const manifest = readStandardManifest(manifestPath);
    const onDisk = digestStandardTree(standardRoot);

    expect(Object.keys(manifest.files).length).toBe(onDisk.size);
    for (const [relativePath, digest] of onDisk) {
      expect(manifest.files[relativePath], `${relativePath} must be manifested`).toBe(digest);
    }
    // The current tree is the reviewed tree: the guard is silent today.
    expect(checkStandardBoundary(standardRoot, manifest)).toEqual([]);
    // ... and inspecting it changed nothing on disk.
    expect(digestStandardTree(standardRoot)).toEqual(onDisk);
  });

  test('PT-028-b fails and names the file when a standard document changes', () => {
    const failures = withStandardCopy((copyRoot) => {
      writeFileSync(
        path.join(copyRoot, 'lint.md'),
        `${readFileSync(path.join(copyRoot, 'lint.md'), 'utf8')}\nA normative implementation requirement.\n`,
        'utf8',
      );
    });

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('lint.md');
    expect(failures[0]).toMatch(/digest/i);
  });

  test('PT-028-c reports zero LINT-07 findings against the five real goal documents', () => {
    expect(lint07(observeGoal(goalRoot))).toEqual([]);
  });

  test('PT-028-d proves that zero result is not vacuous', () => {
    const corpus = [...observeGoal(goalRoot).documents.values()].join('\n');
    for (const word of ['CLI', 'runtime', 'dependency']) {
      expect(corpus).toContain(word);
    }
    // Five documents, so an empty or partial read cannot masquerade as a pass.
    expect(observeGoal(goalRoot).documents.size).toBe(5);
  });

  test('PT-028-e still catches a converter requirement regressed into the docs-only range', () => {
    const regressed: GoalObservation = {
      documents: new Map([
        ['spec.md', 'US-05: The tool must ship an executable converter command.'],
      ]),
    };

    const findings = lint07(regressed);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.path).toBe('spec.md');
    expect(path.isAbsolute(findings[0]?.path ?? '')).toBe(false);
  });

  test('PT-028-f covers every file kind and rejects an unmanifested addition', () => {
    const manifested = Object.keys(readStandardManifest(manifestPath).files);

    expect(manifested.some((entry) => entry.endsWith('.json'))).toBe(true);
    expect(manifested.some((entry) => entry.startsWith('templates/issue/'))).toBe(true);
    expect(manifested.every((entry) => !entry.includes('\\'))).toBe(true);

    const failures = withStandardCopy((copyRoot) => {
      writeFileSync(path.join(copyRoot, 'new-normative-rule.md'), 'A new rule.\n', 'utf8');
    });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('new-normative-rule.md');
    expect(failures[0]).toMatch(/not in the manifest/i);
  });

  test('PT-028-g fails loudly when its own evidence is missing or corrupt', () => {
    const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t-028-manifest-'));
    const absent = path.join(parent, 'absent-manifest.json');
    const corrupt = path.join(parent, 'corrupt-manifest.json');
    const shapeless = path.join(parent, 'shapeless-manifest.json');
    writeFileSync(corrupt, '{ not json', 'utf8');
    writeFileSync(shapeless, '{"files": "not an object"}', 'utf8');

    try {
      for (const candidate of [absent, corrupt, shapeless]) {
        expect(() => readStandardManifest(candidate)).toThrow(path.basename(candidate));
      }
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  test('PT-028-h reports a manifested file that disappeared from disk', () => {
    const failures = withStandardCopy((copyRoot) => {
      rmSync(path.join(copyRoot, 'conversion.md'));
    });

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('conversion.md');
    expect(failures[0]).toMatch(/missing/i);
  });
});
