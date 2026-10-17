/**
 * Issue package scaffold: one command, one directory, exactly five regular
 * files, and no sixth entry.
 *
 * Two standard rules shape everything here:
 *
 *   - The package boundary (`standard/issue-format.md`): an issue folder holds
 *     the five aspect files and nothing else. No `README.md`, no
 *     `.openspec.yaml`, no subdirectory. Operational state lives outside the
 *     package or is derived from `index.md` frontmatter.
 *   - Template authority (`standard/templates/issue/`): the standard owns the
 *     template bytes. This module copies them; it does not carry a second copy
 *     that could drift from the document it claims to implement.
 *
 * A freshly scaffolded package deliberately does NOT pass lint. `LINT-05`
 * exists to catch un-filled template markers before delivery, and a scaffold is
 * by definition not yet filled. Substituting the remaining markers would mean
 * asserting facts the tool cannot know - a summary, a term, a source ask. The
 * only values substituted are the two this tool actually knows: the frozen
 * identity it just allocated, and a source reference the caller supplied.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadIssueTemplate } from '../templates.js';
import {
  allocateIdentityIn,
  type IssueIdentity,
  type AllocateIdentityOptions,
} from './identity.js';

/**
 * The five aspect files, in the standard's dependency order: `index` first,
 * then the two it feeds, then the two those feed. The scaffold writes exactly
 * these names and nothing else.
 */
export const ISSUE_ASPECT_FILES = [
  'index.md',
  'ubi-lang.md',
  'spec.md',
  'design.md',
  'test-plan.md',
] as const;

export type IssueAspectFile = (typeof ISSUE_ASPECT_FILES)[number];

/** The exact `index.md` template line carrying the identity placeholder. */
export const ISSUE_ID_PLACEHOLDER_LINE = 'issue-id: "i-<nnn>-<slug>"';

/** The exact `index.md` template line carrying the source-reference placeholder. */
export const ORIGIN_PLACEHOLDER_LINE = 'origin: "<actual source reference>"';

/**
 * The template's own note that it is a template. It says "Template-only", so by
 * its own words it is not part of a delivered package, and the standard's
 * conforming example does not carry it.
 */
export const TEMPLATE_ONLY_COMMENT_LINE =
  '<!-- Template-only placeholders above MUST be replaced before delivery. -->';

/**
 * One documented difference between a template and its generated file.
 *
 * This list is the whole contract behind "byte-for-byte identical apart from
 * documented placeholder substitution": anything not described here is a
 * template drift, not a substitution, and the generator refuses to guess.
 */
export interface DocumentedSubstitution {
  /** Which aspect file the substitution applies to. */
  readonly file: IssueAspectFile;
  /** The exact template text replaced. */
  readonly find: string;
  /** Why this one value is knowable at scaffold time. */
  readonly reason: string;
}

/** Every difference this generator is permitted to introduce. */
export const DOCUMENTED_SUBSTITUTIONS: readonly DocumentedSubstitution[] = [
  {
    file: 'index.md',
    find: ISSUE_ID_PLACEHOLDER_LINE,
    reason:
      'The identity is allocated by this tool and frozen at creation, so it is known exactly.',
  },
  {
    file: 'index.md',
    find: ORIGIN_PLACEHOLDER_LINE,
    reason:
      'The source reference is supplied by the caller. Left as the template marker when no origin is supplied, because a source reference is never invented.',
  },
  {
    file: 'index.md',
    find: TEMPLATE_ONLY_COMMENT_LINE,
    reason:
      'The line declares itself template-only; a delivered package does not carry it.',
  },
];

/** Raised when a template no longer contains the exact text this module edits. */
export class TemplateDriftError extends Error {
  readonly file: string;
  readonly missing: string;

  constructor(file: string, missing: string) {
    super(
      `Template '${file}' no longer contains the expected text ${JSON.stringify(
        missing
      )}. The standard's template changed; update the documented substitutions rather than generating a file that does not match the standard.`
    );
    this.name = 'TemplateDriftError';
    this.file = file;
    this.missing = missing;
  }
}

export interface ScaffoldIssueOptions {
  /** Directory the new issue folder is created inside. */
  parentDirectory: string;
  /** Title supplied by the caller; drives the slug. */
  title?: string;
  /** First source ask, used for the title only when no title is supplied. */
  sourceAsk?: string;
  /**
   * The actual source reference written to `origin`. Omitted leaves the
   * template marker in place for the author, and lint will say so.
   */
  origin?: string;
  /** Template directory override; defaults to the standard's own folder. */
  templateDir?: string;
}

export interface ScaffoldedIssue {
  /** The number and slug frozen at creation. */
  readonly identity: IssueIdentity;
  /** Absolute path of the created issue directory. */
  readonly directory: string;
  /** Absolute paths of the five created files, in dependency order. */
  readonly files: readonly string[];
  /**
   * True when no `origin` was supplied, so `index.md` still carries the source
   * reference marker for the author to fill.
   */
  readonly originPending: boolean;
}

/**
 * Applies the documented substitutions to `index.md`.
 *
 * Every replacement is an exact whole-line match. A missing line means the
 * standard's template moved and this generator would otherwise emit something
 * that silently disagrees with it, so it fails loudly instead.
 */
export function renderIndex(
  template: string,
  identity: IssueIdentity,
  origin?: string
): string {
  if (!template.includes(ISSUE_ID_PLACEHOLDER_LINE)) {
    throw new TemplateDriftError('index.md', ISSUE_ID_PLACEHOLDER_LINE);
  }
  if (!template.includes(ORIGIN_PLACEHOLDER_LINE)) {
    throw new TemplateDriftError('index.md', ORIGIN_PLACEHOLDER_LINE);
  }
  if (!template.includes(TEMPLATE_ONLY_COMMENT_LINE)) {
    throw new TemplateDriftError('index.md', TEMPLATE_ONLY_COMMENT_LINE);
  }

  let rendered = template.replace(
    ISSUE_ID_PLACEHOLDER_LINE,
    `issue-id: "${identity.issueId}"`
  );

  if (origin !== undefined && origin.trim().length > 0) {
    rendered = rendered.replace(
      ORIGIN_PLACEHOLDER_LINE,
      `origin: "${origin.trim()}"`
    );
  }

  // Drop the whole line, including its newline, so no blank line is left where
  // the template-only note used to be.
  return rendered.replace(`${TEMPLATE_ONLY_COMMENT_LINE}\n`, '');
}

/**
 * Creates one issue package.
 *
 * Fails rather than overwriting: the issue directory is created without
 * `recursive`, and each file is opened with `wx`, so an existing package is an
 * error instead of a silent merge.
 */
export function scaffoldIssue(
  options: ScaffoldIssueOptions
): ScaffoldedIssue {
  const { parentDirectory, title, sourceAsk, origin, templateDir } = options;

  const identityOptions: Omit<
    AllocateIdentityOptions,
    'siblingDirectoryNames'
  > = {
    ...(title !== undefined ? { titleCandidates: [title] } : {}),
    ...(sourceAsk !== undefined ? { firstSourceAsk: sourceAsk } : {}),
  };

  const identity = allocateIdentityIn(parentDirectory, identityOptions);
  const directory = path.join(parentDirectory, identity.issueId);

  // Read and render everything before creating anything, so a template problem
  // never leaves a half-written package on disk.
  const contents = ISSUE_ASPECT_FILES.map((file) => {
    const template = loadIssueTemplate(file, templateDir);
    return {
      file,
      content: file === 'index.md' ? renderIndex(template, identity, origin) : template,
    };
  });

  mkdirSync(parentDirectory, { recursive: true });
  mkdirSync(directory);

  const files: string[] = [];
  for (const { file, content } of contents) {
    const target = path.join(directory, file);
    writeFileSync(target, content, { encoding: 'utf-8', flag: 'wx' });
    files.push(target);
  }

  return {
    identity,
    directory,
    files,
    originPending: origin === undefined || origin.trim().length === 0,
  };
}

/**
 * Reads the lifecycle status out of an issue package's `index.md` frontmatter.
 *
 * The package carries no CLI-owned state file, so frontmatter is the only
 * place status can come from.
 */
export function readIssueStatus(issueDirectory: string): string | undefined {
  const indexPath = path.join(issueDirectory, 'index.md');
  let content: string;
  try {
    content = readFileSync(indexPath, 'utf-8');
  } catch {
    return undefined;
  }

  // Frontmatter begins at byte 1 and closes at the next line that is exactly
  // `---`; anything after that close is body, not state.
  const lines = content.split(/\r?\n/u);
  if (lines[0] !== '---') return undefined;

  let status: string | undefined;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i] as string;
    if (line === '---') return status;
    const match = /^status:\s*"?([^"]*)"?\s*$/u.exec(line);
    if (match) status = (match[1] as string).trim();
  }
  return undefined;
}

/** An actionable failure to obtain lifecycle state from `index.md`. */
export class IssueStatusReadError extends Error {
  readonly indexPath: string;
  readonly problem: string;

  constructor(indexPath: string, problem: string) {
    super(`Cannot read lifecycle status from ${indexPath}: ${problem}`);
    this.name = 'IssueStatusReadError';
    this.indexPath = indexPath;
    this.problem = problem;
  }
}

/**
 * Turn an absent status value into a concrete frontmatter diagnostic. This is
 * deliberately narrower than lint's full metadata validation: status needs to
 * refuse an invented lifecycle, while lint remains the authority for every
 * shape and enum finding.
 */
function describeStatusReadProblem(content: string): string {
  const lines = content.split(/\r?\n/u);
  if (lines[0] !== '---') {
    return 'frontmatter must begin at byte 1 with an exact --- delimiter';
  }

  let closingLine = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === '---') {
      closingLine = index;
      break;
    }
  }
  if (closingLine === -1) {
    return 'unterminated frontmatter (missing closing --- delimiter)';
  }

  const statusLines = lines
    .slice(1, closingLine)
    .filter((line) => line.trimStart().startsWith('status:'));
  if (statusLines.length === 0) {
    return 'frontmatter has no status field';
  }
  return 'frontmatter status is not a parseable scalar';
}

/**
 * Read lifecycle state for a command that must never substitute a default.
 * `readIssueStatus` remains the parser; this wrapper only supplies a precise
 * diagnostic when that parser cannot derive a state.
 */
export function requireIssueStatus(issueDirectory: string): string {
  const status = readIssueStatus(issueDirectory);
  if (status !== undefined && status.length > 0) return status;

  const indexPath = path.join(issueDirectory, 'index.md');
  let content: string;
  try {
    content = readFileSync(indexPath, 'utf-8');
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'the file could not be read';
    throw new IssueStatusReadError(indexPath, `cannot read frontmatter (${reason})`);
  }

  throw new IssueStatusReadError(indexPath, describeStatusReadProblem(content));
}
