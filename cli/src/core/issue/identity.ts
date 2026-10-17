/**
 * Issue identity allocation: the `i-<nnn>-<slug>` folder name and the matching
 * `index.md` `issue-id`.
 *
 * This is a transcription of two standard sections, not a new policy:
 *   - `standard/issue-format.md` "Naming and allocation" (the observable
 *     pattern and the smallest-unused-positive-integer rule)
 *   - `standard/conversion.md` C1/C2 (title selection and slug derivation)
 *
 * Both parts are frozen at creation. A later title change never renames the
 * folder and never rewrites `issue-id`, so nothing here reads existing
 * identity back out of a title.
 */

import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/** The exact title used when no supplied title and no source ask yields one. */
export const FALLBACK_TITLE = 'Untitled issue';

/** The exact slug used when the selected title contributes no `[a-z0-9]` token. */
export const FALLBACK_SLUG = 'untitled-issue';

/** The token appended when the selected title yields exactly one token. */
export const SINGLE_TOKEN_SUFFIX = 'issue';

/** Slugs carry two to four components, so at most four tokens are kept. */
export const MAX_SLUG_TOKENS = 4;

/** Numbers render with at least three digits; larger values are not truncated. */
export const MIN_NUMBER_DIGITS = 3;

/**
 * The complete observable directory-name pattern from `issue-format.md`.
 * Lint checks this; allocation is built so that it always produces a match.
 */
export const ISSUE_DIRECTORY_REGEX =
  /^i-[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+){1,3}$/u;

/**
 * The candidate pattern for number reservation. Deliberately looser than
 * ISSUE_DIRECTORY_REGEX: a malformed remainder such as `i-001-old` or an empty
 * remainder such as `i-002-` still reserves its number, because the standard
 * reserves on the digits alone.
 */
export const CANDIDATE_DIRECTORY_REGEX = /^i-([0-9]+)-/u;

/** A number and slug frozen together at creation. */
export interface IssueIdentity {
  /** The allocated positive integer, before digit padding. */
  readonly number: number;
  /** The rendered number, at least three digits. */
  readonly renderedNumber: string;
  /** The derived slug, two to four `[a-z0-9]` components. */
  readonly slug: string;
  /** The frozen `i-<nnn>-<slug>` used for both folder name and `issue-id`. */
  readonly issueId: string;
  /** The normalized title the slug came from, for the caller to write verbatim. */
  readonly title: string;
}

export interface AllocateIdentityOptions {
  /**
   * Titles in supplied-input order followed by document order. The caller owns
   * that ordering because only the caller knows which titles were supplied and
   * which were read out of documents.
   */
  readonly titleCandidates?: readonly string[];
  /** The first source ask, used only when no title candidate survives trimming. */
  readonly firstSourceAsk?: string;
  /** Direct-child directory names of the target parent. */
  readonly siblingDirectoryNames: readonly string[];
}

/** Trim and collapse whitespace, the normalization the standard applies first. */
export function normalizeTitle(raw: string): string {
  return raw.trim().replace(/\s+/gu, ' ');
}

/**
 * The first non-empty sentence of a source ask.
 *
 * The standard says "first non-empty sentence" without defining a boundary, so
 * this takes the narrowest defensible reading: a run ending at `.`, `!`, or `?`
 * followed by whitespace or end of text. The choice is nearly unobservable —
 * the slug keeps at most the first four `[a-z0-9]` tokens — but it is written
 * down here so two runs never disagree.
 */
export function firstNonEmptySentence(sourceAsk: string): string {
  for (const candidate of sourceAsk.split(/(?<=[.!?])\s+/u)) {
    const normalized = normalizeTitle(candidate);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return '';
}

/**
 * Select the title to slug from. Returns the normalized title, never an empty
 * string: the last resort is the exact FALLBACK_TITLE.
 */
export function selectTitle(
  titleCandidates: readonly string[] = [],
  firstSourceAsk?: string
): string {
  for (const candidate of titleCandidates) {
    const normalized = normalizeTitle(candidate);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  if (firstSourceAsk !== undefined) {
    const sentence = firstNonEmptySentence(firstSourceAsk);
    if (sentence.length > 0) {
      return sentence;
    }
  }

  return FALLBACK_TITLE;
}

/**
 * Derive the slug from an already-selected title. Always returns two to four
 * `[a-z0-9]` components, so the result always satisfies ISSUE_DIRECTORY_REGEX.
 */
export function slugFromTitle(title: string): string {
  const tokens = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .split('-')
    .filter((token) => token.length > 0)
    .slice(0, MAX_SLUG_TOKENS);

  if (tokens.length === 0) {
    return FALLBACK_SLUG;
  }

  if (tokens.length === 1) {
    return `${tokens[0]}-${SINGLE_TOKEN_SUFFIX}`;
  }

  return tokens.join('-');
}

/**
 * Every positive number already taken by a direct-child directory, including
 * candidates whose remainder is malformed.
 */
export function reservedNumbers(
  siblingDirectoryNames: readonly string[]
): Set<number> {
  const reserved = new Set<number>();

  for (const name of siblingDirectoryNames) {
    const match = CANDIDATE_DIRECTORY_REGEX.exec(name);
    if (match === null) {
      continue;
    }

    const value = Number.parseInt(match[1] as string, 10);
    if (Number.isSafeInteger(value) && value > 0) {
      reserved.add(value);
    }
  }

  return reserved;
}

/** The smallest unused positive integer across the candidate collection. */
export function allocateNumber(
  siblingDirectoryNames: readonly string[]
): number {
  const reserved = reservedNumbers(siblingDirectoryNames);

  let candidate = 1;
  while (reserved.has(candidate)) {
    candidate += 1;
  }

  return candidate;
}

/** Render with at least three digits; values above 999 keep every digit. */
export function renderNumber(value: number): string {
  return String(value).padStart(MIN_NUMBER_DIGITS, '0');
}

/** Allocate a complete, frozen identity. */
export function allocateIdentity(
  options: AllocateIdentityOptions
): IssueIdentity {
  const title = selectTitle(options.titleCandidates, options.firstSourceAsk);
  const slug = slugFromTitle(title);
  const number = allocateNumber(options.siblingDirectoryNames);
  const renderedNumber = renderNumber(number);

  return {
    number,
    renderedNumber,
    slug,
    issueId: `i-${renderedNumber}-${slug}`,
    title,
  };
}

/**
 * Direct-child directory names of the target parent, the collection the
 * standard reserves numbers from. A missing parent is an empty collection, so
 * scaffolding into a not-yet-created directory allocates 1.
 *
 * A symlink whose target is a directory counts too. The standard reserves on
 * "direct-child directories", and skipping a linked one would hand out a number
 * that already names a sibling.
 */
export function readSiblingDirectoryNames(parentDirectory: string): string[] {
  let entries;
  try {
    entries = readdirSync(parentDirectory, { withFileTypes: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return [];
    }
    throw error;
  }

  const names: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      names.push(entry.name);
      continue;
    }

    if (entry.isSymbolicLink()) {
      try {
        if (statSync(path.join(parentDirectory, entry.name)).isDirectory()) {
          names.push(entry.name);
        }
      } catch {
        // A broken link names no directory, so it reserves nothing.
      }
    }
  }

  return names;
}

/** Allocate against a real parent directory on disk. */
export function allocateIdentityIn(
  parentDirectory: string,
  options: Omit<AllocateIdentityOptions, 'siblingDirectoryNames'> = {}
): IssueIdentity {
  return allocateIdentity({
    ...options,
    siblingDirectoryNames: readSiblingDirectoryNames(parentDirectory),
  });
}
