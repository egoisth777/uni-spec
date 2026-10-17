/**
 * Collection-wide lint: fan the single-package linter across every issue
 * folder that is a direct child of a collection root.
 *
 * The standard scopes lint to one issue package (`standard/lint.md`); this
 * walk is CLI convenience layered on top, not a new rule set. Classification
 * is structural, so the command never guesses from flags:
 *
 *   - a directory carrying `index.md` is one package;
 *   - otherwise a directory whose direct children match the issue-folder
 *     candidate pattern (`i-<number>-...`) is a collection, and each matching
 *     child is linted as its own package;
 *   - anything else falls through to single-package lint, whose findings
 *     already describe what is missing.
 *
 * Only direct children are walked. `archive/` (or any non-candidate name) is
 * therefore excluded naturally: archived issues live below a folder that does
 * not match the candidate pattern, outside the live collection.
 */

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { CANDIDATE_DIRECTORY_REGEX } from './identity.js';
import {
  lintIssue,
  observeIssue,
  type GoalObservation,
  type LintReport,
} from './lint.js';

/** How a lint target is treated, decided by what is on disk. */
export type LintTargetKind = 'package' | 'collection';

export interface CollectionPackageResult {
  /** Absolute path of the linted issue directory. */
  readonly directory: string;
  /** The unmodified single-package report. */
  readonly report: LintReport;
}

export interface CollectionLintResult {
  /** Absolute path of the collection root that was walked. */
  readonly root: string;
  /** PASS only when at least one package was linted and every one passed. */
  readonly result: 'PASS' | 'FAIL';
  /** Per-package results, ordered by folder name. */
  readonly packages: readonly CollectionPackageResult[];
}

/**
 * `index.md` at the target makes it a package — even a malformed one, so its
 * findings stay findings instead of being reinterpreted as an empty
 * collection. Without it, one candidate child is enough to call it a
 * collection.
 */
export function classifyLintTarget(target: string): LintTargetKind {
  if (existsSync(path.join(target, 'index.md'))) return 'package';
  return listCandidateDirectories(target).length > 0 ? 'collection' : 'package';
}

/**
 * Direct child directories that look like issue folders, by the loose
 * candidate pattern. Loose on purpose: a near-miss name (`i-01-x`) is linted
 * as a package so `LINT-01` can name the defect, rather than silently
 * skipped.
 */
function listCandidateDirectories(root: string): string[] {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter(
      (entry) =>
        entry.isDirectory() && CANDIDATE_DIRECTORY_REGEX.test(entry.name)
    )
    .map((entry) => entry.name)
    .sort();
}

/**
 * Lints every candidate child as its own package. One goal observation is
 * taken by the caller and shared, so every package is judged against the same
 * goal state.
 *
 * An empty walk FAILs: a lint that inspected nothing must not claim PASS.
 */
export function lintCollection(
  root: string,
  goal?: GoalObservation
): CollectionLintResult {
  const packages = listCandidateDirectories(root).map((name) => {
    const directory = path.join(root, name);
    const report = lintIssue({
      issue: observeIssue(directory),
      ...(goal === undefined ? {} : { goal }),
    });
    return { directory, report };
  });

  const result =
    packages.length > 0 &&
    packages.every((entry) => entry.report.result === 'PASS')
      ? 'PASS'
      : 'FAIL';

  return { root, result, packages };
}
