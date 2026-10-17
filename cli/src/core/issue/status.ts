/**
 * Read-only progress model for one uni-spec issue package.
 *
 * The scaffold creates every file up front, so presence alone proves only that
 * a template was written. An aspect is complete once its regular file has
 * substantive text with none of the standard's unresolved template markers.
 * Dependencies then describe which unfinished aspect may be worked on next.
 */

import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { CANONICAL_TEMPLATE_MARKERS } from './lint.js';
import { requireIssueStatus } from './scaffold.js';

/** The five schema artifacts in dependency/build order. */
export const ISSUE_ARTIFACTS = [
  { id: 'index', generates: 'index.md', requires: [] },
  { id: 'ubi-lang', generates: 'ubi-lang.md', requires: ['index'] },
  { id: 'spec', generates: 'spec.md', requires: ['index'] },
  { id: 'design', generates: 'design.md', requires: ['spec'] },
  { id: 'test-plan', generates: 'test-plan.md', requires: ['spec'] },
] as const;

export type IssueArtifactId = (typeof ISSUE_ARTIFACTS)[number]['id'];
export type IssueArtifactState = 'done' | 'ready' | 'blocked';

export interface IssueArtifactStatus {
  readonly id: IssueArtifactId;
  readonly generates: string;
  /** The schema's direct prerequisites, complete or not. */
  readonly requires: readonly IssueArtifactId[];
  readonly state: IssueArtifactState;
  /** Direct prerequisites that are not complete; empty for done and ready. */
  readonly missingDependencies: readonly IssueArtifactId[];
}

export interface IssueStatusReport {
  /** Absolute package directory observed by the read-only report. */
  readonly directory: string;
  /** Lifecycle state read from `index.md` frontmatter, never synthesized. */
  readonly lifecycle: string;
  readonly completedAspects: number;
  readonly totalAspects: number;
  readonly artifacts: readonly IssueArtifactStatus[];
}

/**
 * A non-regular entry, unreadable file, empty file, or unresolved template is
 * unfinished. The status command intentionally leaves malformed packages for
 * lint to diagnose in full; it only needs an honest completion signal here.
 */
function isArtifactComplete(directory: string, filename: string): boolean {
  try {
    const target = path.join(directory, filename);
    if (!lstatSync(target).isFile()) return false;

    const content = readFileSync(target, 'utf8');
    return (
      content.trim().length > 0 &&
      !CANONICAL_TEMPLATE_MARKERS.some((marker) => content.includes(marker))
    );
  } catch {
    return false;
  }
}

/**
 * Observe one package without changing its contents or creating a sidecar.
 * Lifecycle is read first so a malformed `index.md` fails explicitly instead
 * of letting a progress report imply a default lifecycle state.
 */
export function readIssueStatusReport(issueDirectory: string): IssueStatusReport {
  const directory = path.resolve(issueDirectory);
  const lifecycle = requireIssueStatus(directory);
  const completed = new Set<IssueArtifactId>();

  for (const artifact of ISSUE_ARTIFACTS) {
    if (isArtifactComplete(directory, artifact.generates)) {
      completed.add(artifact.id);
    }
  }

  const artifacts: IssueArtifactStatus[] = ISSUE_ARTIFACTS.map((artifact) => {
    const missingDependencies = artifact.requires.filter(
      (dependency) => !completed.has(dependency)
    );

    if (completed.has(artifact.id)) {
      return {
        id: artifact.id,
        generates: artifact.generates,
        requires: artifact.requires,
        state: 'done',
        missingDependencies: [],
      };
    }

    if (missingDependencies.length === 0) {
      return {
        id: artifact.id,
        generates: artifact.generates,
        requires: artifact.requires,
        state: 'ready',
        missingDependencies,
      };
    }

    return {
      id: artifact.id,
      generates: artifact.generates,
      requires: artifact.requires,
      state: 'blocked',
      missingDependencies,
    };
  });

  return {
    directory,
    lifecycle,
    completedAspects: completed.size,
    totalAspects: ISSUE_ARTIFACTS.length,
    artifacts,
  };
}
