/**
 * LINT-01 through LINT-07 validator for uni-spec issue packages.
 *
 * Contract sources:
 *  - `standard/lint.md` — the deterministic rule matrix and its finding shape.
 *  - `standard/issue-format.md` — the per-aspect heading, column, and link contracts.
 *
 * This module is an inspection, not a repair. It reads observed directory
 * entries and file text and reports findings; it never rewrites a target,
 * derives a slug from an unpersisted title, or invents a source fact.
 *
 * Two behaviours are load-bearing and deliberate:
 *  1. Every rule is evaluated for every target. A finding in one rule never
 *     short-circuits a later rule, so `evaluatedRules` always lists all seven
 *     in matrix order (`standard/lint.md`).
 *  2. Rules that cannot observe their input stay silent instead of guessing.
 *     A missing `spec.md` is a LINT-01 finding; it does not also become four
 *     invented LINT-04 findings.
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import {
  CANDIDATE_DIRECTORY_REGEX,
  ISSUE_DIRECTORY_REGEX,
  MIN_NUMBER_DIGITS,
  readSiblingDirectoryNames,
} from './identity.js';
import { ISSUE_ASPECT_FILES, type IssueAspectFile } from './scaffold.js';

/** The seven rule identifiers, in the order `standard/lint.md` fixes. */
export const LINT_RULE_IDS = [
  'LINT-01',
  'LINT-02',
  'LINT-03',
  'LINT-04',
  'LINT-05',
  'LINT-06',
  'LINT-07',
] as const;

export type LintRuleId = (typeof LINT_RULE_IDS)[number];

/** Observed kind of a direct-child entry of the issue directory. */
export type EntryKind = 'regular-file' | 'directory' | 'symlink' | 'other';

/** One direct-child entry of the issue directory, as observed. */
export interface ObservedEntry {
  readonly name: string;
  readonly kind: EntryKind;
}

/**
 * Everything LINT-01 through LINT-06 may observe about one issue package.
 *
 * The observation is separate from the filesystem so a documentary fixture can
 * record an entry kind (a symlink, say) that the host filesystem cannot create.
 */
export interface IssueObservation {
  /** Basename of the issue directory, e.g. `i-007-nucleus-only`. */
  readonly directoryName: string;
  /** Direct-child entries in observed order. */
  readonly entries: readonly ObservedEntry[];
  /** Text of each readable file, keyed by entry name. */
  readonly files: ReadonlyMap<string, string>;
  /** Direct-child directory names of the issue directory's parent. */
  readonly siblingDirectoryNames: readonly string[];
}

/**
 * The five goal documents LINT-07 inspects, keyed by goal-relative name.
 * `observeGoal` records a requested root that could not be read instead of
 * turning that failed observation into an empty, passing scope.
 */
export interface GoalObservation {
  readonly documents: ReadonlyMap<string, string>;
  /** Absolute root requested through `observeGoal`, when available. */
  readonly rootPath?: string;
  /** Root-level observation failure, when the requested root is inaccessible. */
  readonly rootError?: string;
}

/** One rule violation, carrying the six fields every trace records. */
export interface LintFinding {
  readonly ruleId: LintRuleId;
  /** Issue-relative (or goal-relative for LINT-07) path; `.` for the folder. */
  readonly path: string;
  /** 1-based line, or `null` when the fact is not line-locatable. */
  readonly line: number | null;
  readonly observed: string;
  readonly expected: string;
  readonly remediation: string;
}

export interface LintReport {
  readonly evaluatedRules: readonly LintRuleId[];
  readonly findings: readonly LintFinding[];
  readonly result: 'PASS' | 'FAIL';
}

export interface LintInput {
  readonly issue: IssueObservation;
  /**
   * Omitted only when no goal set is in scope. A caller that supplies
   * `observeGoal(...)` receives an explicit LINT-07 root observation on failure.
   */
  readonly goal?: GoalObservation;
}

/** The five goal document names LINT-07 inspects and nothing else. */
export const GOAL_DOCUMENT_FILES = [
  'index.md',
  'ubi-lang.md',
  'spec.md',
  'design.md',
  'test-list.md',
] as const;

/** Accepted `status` values from `standard/issue-format.md`. */
export const ISSUE_STATUS_VALUES = ['pending', 'integrated', 'rejected'] as const;

/** Exactly the frontmatter keys `index.md` may carry, in documented order. */
export const FRONTMATTER_KEYS = ['issue-id', 'origin', 'status'] as const;

/**
 * The canonical angle-bracket markers listed in `standard/issue-format.md`.
 * Matching is literal: LINT-05 flags these exact strings, not Markdown or HTML
 * tags that merely look similar.
 */
export const CANONICAL_TEMPLATE_MARKERS = [
  '<nnn>',
  '<slug>',
  '<actual source reference>',
  '<source-grounded summary, or the exact absence sentence: No source-grounded summary available.>',
  '<term>',
  '<issue-specific meaning>',
  '<source ask>',
  '<source-grounded rationale>',
  '<proposal mapped to source request IDs>',
  '<source-provided procedure>',
  '<source-provided expected evidence>',
] as const;

/** Exact absence sentences, per aspect. */
const ABSENCE_SENTENCES = {
  'index.md': 'No source-grounded summary available.',
  'ubi-lang.md': 'No issue-specific terms.',
  'spec.md': 'No issue-specific requests.',
  'design.md': 'No issue-specific design proposed.',
} as const;

const NO_VERIFICATION_REQUIRED =
  'No verification required: source contains no accepted or undecided request IDs.';

const UNCOVERED_PREFIX = 'No source verification provided for request IDs: ';
const UNCOVERED_SUFFIX = '; source provides none.';

/** Dispositions that make a request eligible for verification coverage. */
const ELIGIBLE_DISPOSITIONS = new Set(['accepted', 'undecided']);

/** Required heading and table columns for each aspect file. */
const ASPECT_CONTRACTS: Record<
  IssueAspectFile,
  { readonly heading: string; readonly columns: readonly string[] }
> = {
  'index.md': { heading: '## Routes', columns: ['Need', 'File'] },
  'ubi-lang.md': { heading: '## Terms', columns: ['Term', 'Meaning'] },
  'spec.md': {
    heading: '## Source requests',
    columns: ['Request ID', 'Source ask', 'Disposition', 'Rationale'],
  },
  'design.md': { heading: '## Proposed design', columns: ['Request IDs', 'Proposal'] },
  'test-plan.md': {
    heading: '## Verification',
    columns: ['Check ID', 'Request Refs', 'Procedure', 'Expected Evidence'],
  },
};

// ---------------------------------------------------------------------------
// Markdown observation helpers
// ---------------------------------------------------------------------------

interface HeadingLine {
  readonly line: number;
  readonly text: string;
}

interface TableRow {
  readonly line: number;
  readonly cells: readonly string[];
}

interface MarkdownTable {
  readonly headerLine: number;
  readonly headerCells: readonly string[];
  /** `null` when the header is not followed by a valid delimiter row. */
  readonly delimiterCells: readonly string[] | null;
  readonly rows: readonly TableRow[];
}

function splitLines(text: string): string[] {
  return text.split(/\r?\n/u);
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith('|');
}

function splitCells(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((cell) => cell.trim());
}

function isDelimiterRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/u.test(cell));
}

function collectHeadings(lines: readonly string[]): HeadingLine[] {
  const headings: HeadingLine[] = [];
  for (const [index, raw] of lines.entries()) {
    const match = /^(#{1,6})\s+(.*)$/u.exec(raw);
    if (match) headings.push({ line: index + 1, text: `${match[1]} ${match[2].trim()}` });
  }
  return headings;
}

/**
 * Body lines of the section opened by `headingLine`, up to the next heading.
 * Returned entries keep their 1-based file line numbers.
 */
function sectionBody(
  lines: readonly string[],
  headingLine: number,
): { readonly line: number; readonly text: string }[] {
  const body: { line: number; text: string }[] = [];
  for (let index = headingLine; index < lines.length; index += 1) {
    const raw = lines[index];
    if (/^#{1,6}\s+/u.test(raw)) break;
    body.push({ line: index + 1, text: raw });
  }
  return body;
}

/** The first Markdown table inside a section body, or `undefined`. */
function firstTable(
  body: readonly { readonly line: number; readonly text: string }[],
): MarkdownTable | undefined {
  const start = body.findIndex((entry) => isTableLine(entry.text));
  if (start === -1) return undefined;

  const headerCells = splitCells(body[start].text);
  const next = body[start + 1];
  const nextCells = next && isTableLine(next.text) ? splitCells(next.text) : undefined;
  const delimiterCells = nextCells && isDelimiterRow(nextCells) ? nextCells : null;

  const rows: TableRow[] = [];
  const rowStart = delimiterCells ? start + 2 : start + 1;
  for (let index = rowStart; index < body.length; index += 1) {
    const entry = body[index];
    if (!isTableLine(entry.text)) break;
    rows.push({ line: entry.line, cells: splitCells(entry.text) });
  }

  return { headerLine: body[start].line, headerCells, delimiterCells, rows };
}

/** Non-empty, non-table prose lines of a section body. */
function proseLines(
  body: readonly { readonly line: number; readonly text: string }[],
): { readonly line: number; readonly text: string }[] {
  return body
    .filter((entry) => entry.text.trim().length > 0 && !isTableLine(entry.text))
    .map((entry) => ({ line: entry.line, text: entry.text.trim() }));
}

interface ObservedLink {
  readonly line: number;
  readonly column: number;
  readonly destination: string;
}

const INLINE_LINK_REGEX = /\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/gu;

function collectLinks(lines: readonly string[]): ObservedLink[] {
  const links: ObservedLink[] = [];
  for (const [index, raw] of lines.entries()) {
    INLINE_LINK_REGEX.lastIndex = 0;
    let match = INLINE_LINK_REGEX.exec(raw);
    while (match !== null) {
      links.push({ line: index + 1, column: match.index, destination: match[1] });
      match = INLINE_LINK_REGEX.exec(raw);
    }
  }
  return links;
}

function isExternalDestination(destination: string): boolean {
  return destination.startsWith('http://') || destination.startsWith('https://');
}

/**
 * Resolve a local destination after dot-segment normalization.
 * Returns `undefined` when the path escapes the issue folder.
 */
function normalizeLocalDestination(destination: string): string | undefined {
  const segments = destination.split('/');
  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      if (stack.length === 0) return undefined;
      stack.pop();
      continue;
    }
    stack.push(segment);
  }
  return stack.join('/');
}

// ---------------------------------------------------------------------------
// LINT-01 — package boundary
// ---------------------------------------------------------------------------

const EXPECTED_SHAPE = 'exactly the five named regular files and no extra entries';
const EXPECTED_REGULAR = 'all five named entries are regular files and no symlink exists';

function lintPackageBoundary(issue: IssueObservation): LintFinding[] {
  const findings: LintFinding[] = [];
  const required = new Set<string>(ISSUE_ASPECT_FILES);
  const seen = new Set<string>();

  for (const entry of issue.entries) {
    if (required.has(entry.name)) seen.add(entry.name);

    if (entry.kind === 'symlink') {
      findings.push({
        ruleId: 'LINT-01',
        path: entry.name,
        line: null,
        observed: `entry ${entry.name} (entry.kind: symlink)`,
        expected: EXPECTED_REGULAR,
        remediation:
          'Remove the symlink and restore a regular companion file only if it is required.',
      });
      continue;
    }

    if (!required.has(entry.name)) {
      findings.push({
        ruleId: 'LINT-01',
        path: entry.name,
        line: null,
        observed: `entry ${entry.name} (entry.kind: ${entry.kind})`,
        expected: EXPECTED_SHAPE,
        remediation: `Remove ${entry.name} from the issue folder.`,
      });
      continue;
    }

    if (entry.kind !== 'regular-file') {
      findings.push({
        ruleId: 'LINT-01',
        path: entry.name,
        line: null,
        observed: `entry ${entry.name} (entry.kind: ${entry.kind})`,
        expected: EXPECTED_REGULAR,
        remediation: `Replace ${entry.name} with a regular file.`,
      });
    }
  }

  for (const name of ISSUE_ASPECT_FILES) {
    if (seen.has(name)) continue;
    findings.push({
      ruleId: 'LINT-01',
      path: name,
      line: null,
      observed: `entry ${name} is absent`,
      expected: EXPECTED_SHAPE,
      remediation: `Restore ${name} as a regular file.`,
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// LINT-02 — directory identity
// ---------------------------------------------------------------------------

const NAMING_CONSTRAINT =
  'directory name matching i-[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+){1,3}';

function lintDirectoryIdentity(issue: IssueObservation): LintFinding[] {
  const findings: LintFinding[] = [];
  const name = issue.directoryName;

  if (!ISSUE_DIRECTORY_REGEX.test(name)) {
    findings.push({
      ruleId: 'LINT-02',
      path: '.',
      line: null,
      observed: `directory name ${name}`,
      expected: NAMING_CONSTRAINT,
      remediation:
        `Rename the directory to i-<nnn>-<slug> with at least ${String(MIN_NUMBER_DIGITS)} ` +
        'digits and two to four lowercase alphanumeric slug components; do not infer a slug ' +
        'from an unpersisted title.',
    });
  }

  const candidate = CANDIDATE_DIRECTORY_REGEX.exec(name);
  if (!candidate) return findings;

  const digits = candidate[1];
  const value = Number.parseInt(digits, 10);

  if (!Number.isSafeInteger(value) || value <= 0) {
    findings.push({
      ruleId: 'LINT-02',
      path: '.',
      line: null,
      observed: `numeric component ${digits} has value ${String(value)}`,
      expected: 'a numeric component whose value is greater than zero',
      remediation:
        'Renumber the directory with the smallest unused positive integer among the ' +
        'target-parent candidate directories.',
    });
    return findings;
  }

  const reserved = new Set<number>();
  const collisions: string[] = [];
  for (const sibling of issue.siblingDirectoryNames) {
    const siblingMatch = CANDIDATE_DIRECTORY_REGEX.exec(sibling);
    if (!siblingMatch) continue;
    const siblingValue = Number.parseInt(siblingMatch[1], 10);
    if (Number.isSafeInteger(siblingValue) && siblingValue > 0) reserved.add(siblingValue);
    if (sibling !== name && siblingValue === value) collisions.push(sibling);
  }

  if (collisions.length > 0) {
    let unused = 1;
    while (reserved.has(unused)) unused += 1;
    const suggestion = String(unused).padStart(MIN_NUMBER_DIGITS, '0');
    for (const sibling of collisions) {
      findings.push({
        ruleId: 'LINT-02',
        path: '.',
        line: null,
        observed: `sibling directory ${sibling} reserves number ${String(value)}`,
        expected:
          'a number unique among target-parent direct-child directories beginning i-<digits>-',
        remediation: `Rename the directory to use the smallest unused number ${suggestion} before creation.`,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// LINT-03 — index frontmatter
// ---------------------------------------------------------------------------

interface FrontmatterEntry {
  readonly key: string;
  readonly line: number;
  /** Scalar text, or `undefined` when the value is not a scalar. */
  readonly scalar?: string;
  /** Rendered non-scalar shape, e.g. `mapping {value: pending}`. */
  readonly nonScalar?: string;
  /** Human name of the non-scalar shape, e.g. `mapping`. */
  readonly shape?: string;
}

interface FrontmatterParse {
  readonly entries: readonly FrontmatterEntry[];
  readonly errors: readonly { readonly line: number; readonly observed: string }[];
}

/**
 * A quoted scalar must close with the same quote. Double-quoted backslashes and
 * single-quoted doubled quotes are the only quote escapes this flat parser
 * needs to distinguish while preserving the original line for its finding.
 */
function quotedScalarError(inline: string): string | undefined {
  const quote = inline[0];
  if (quote !== '"' && quote !== "'") return undefined;

  let index = 1;
  while (index < inline.length) {
    const character = inline[index];
    if (quote === '"' && character === '\\') {
      index += 2;
      continue;
    }
    if (character !== quote) {
      index += 1;
      continue;
    }
    if (quote === "'" && inline[index + 1] === "'") {
      index += 2;
      continue;
    }
    return index === inline.length - 1
      ? undefined
      : `unparseable quoted scalar ${inline}`;
  }

  return `unterminated quoted scalar ${inline}`;
}

function unquoteScalar(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/**
 * Parse the tiny flat mapping `index.md` frontmatter is allowed to be.
 *
 * A general YAML loader is the wrong tool here: it silently drops duplicate
 * keys (last wins) and erases the line numbers LINT-03 must report. The
 * contract is three scalar keys, so a strict line reader observes more.
 */
function parseFrontmatterBody(
  lines: readonly string[],
  firstBodyIndex: number,
  closingIndex: number,
): FrontmatterParse {
  const entries: FrontmatterEntry[] = [];
  const errors: { line: number; observed: string }[] = [];

  let index = firstBodyIndex;
  while (index < closingIndex) {
    const raw = lines[index];
    if (raw.trim().length === 0) {
      index += 1;
      continue;
    }

    if (/^\s/u.test(raw)) {
      errors.push({ line: index + 1, observed: `unattached indented line ${raw.trim()}` });
      index += 1;
      continue;
    }

    const match = /^([A-Za-z][A-Za-z0-9_-]*)\s*:(.*)$/u.exec(raw);
    if (!match) {
      errors.push({ line: index + 1, observed: `unparseable YAML line ${raw.trim()}` });
      index += 1;
      continue;
    }

    const key = match[1];
    const inline = match[2].trim();
    if (inline.length > 0) {
      const quotedError = quotedScalarError(inline);
      if (quotedError !== undefined) {
        errors.push({ line: index + 1, observed: quotedError });
        // Keep the key present so the key-set finding reports the malformed
        // scalar rather than inventing a second "absent" key observation.
        entries.push({ key, line: index + 1 });
      } else if (inline.startsWith('[') || inline.startsWith('{')) {
        const shape = inline.startsWith('[') ? 'sequence' : 'mapping';
        entries.push({ key, line: index + 1, nonScalar: `${shape} ${inline}`, shape });
      } else {
        entries.push({ key, line: index + 1, scalar: unquoteScalar(inline) });
      }
      index += 1;
      continue;
    }

    // Empty inline value: the value, if any, lives on the following indented lines.
    const nested: { readonly raw: string; readonly text: string; readonly line: number }[] = [];
    let cursor = index + 1;
    while (cursor < closingIndex && /^\s+\S/u.test(lines[cursor])) {
      nested.push({ raw: lines[cursor], text: lines[cursor].trim(), line: cursor + 1 });
      cursor += 1;
    }

    const tabIndented = nested.find((entry) => /^ *\t/u.test(entry.raw));
    if (tabIndented !== undefined) {
      errors.push({
        line: tabIndented.line,
        observed: `tab indentation ${JSON.stringify(tabIndented.raw)}`,
      });
    }

    if (nested.length === 0) {
      entries.push({ key, line: index + 1, nonScalar: 'empty value', shape: 'empty value' });
    } else if (nested.every((entry) => entry.text.startsWith('- '))) {
      const items = nested.map((entry) => entry.text.slice(2).trim()).join(', ');
      entries.push({ key, line: index + 1, nonScalar: `sequence [${items}]`, shape: 'sequence' });
    } else {
      entries.push({
        key,
        line: index + 1,
        nonScalar: `mapping {${nested.map((entry) => entry.text).join(', ')}}`,
        shape: 'mapping',
      });
    }
    index = cursor;
  }

  return { entries, errors };
}

function expectedScalar(key: string): string {
  return key === 'status'
    ? 'status is exactly one scalar enum value: pending, integrated, or rejected'
    : `${key} is exactly one scalar string`;
}

function lintIndexFrontmatter(issue: IssueObservation): LintFinding[] {
  const text = issue.files.get('index.md');
  if (text === undefined) return [];

  const findings: LintFinding[] = [];
  const lines = splitLines(text);

  if (lines[0] !== '---') {
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: 1,
      observed: `first line ${JSON.stringify(lines[0] ?? '')}`,
      expected: 'index.md begins at byte 1 with an exact --- line',
      remediation: 'Start index.md with an exact --- delimiter line at byte 1.',
    });
    return findings;
  }

  const closingIndex = lines.findIndex((line, index) => index > 0 && line === '---');
  if (closingIndex === -1) {
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: 1,
      observed: 'no closing --- line after the opening delimiter',
      expected: 'frontmatter closes with a later line containing exactly ---',
      remediation: 'Close the frontmatter with an exact --- line before the body.',
    });
    return findings;
  }

  const parsed = parseFrontmatterBody(lines, 1, closingIndex);

  for (const error of parsed.errors) {
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: error.line,
      observed: error.observed,
      expected: 'strict, parseable YAML holding exactly issue-id, origin, and status',
      remediation: 'Rewrite the frontmatter as three scalar keys with no other content.',
    });
  }

  const seen = new Set<string>();
  for (const entry of parsed.entries) {
    if (seen.has(entry.key)) {
      findings.push({
        ruleId: 'LINT-03',
        path: 'index.md',
        line: entry.line,
        observed: `duplicate YAML key ${entry.key}`,
        expected: 'strict YAML with no duplicate keys',
        remediation: `Remove the duplicate ${entry.key} key and retain one source-grounded scalar value.`,
      });
      continue;
    }
    seen.add(entry.key);
  }

  for (const entry of parsed.entries) {
    if (entry.nonScalar === undefined) continue;
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: entry.line,
      observed: `non-scalar ${entry.key} value: ${entry.nonScalar}`,
      expected: expectedScalar(entry.key),
      remediation: `Replace the ${entry.shape ?? 'value'} with one scalar ${entry.key} value.`,
    });
  }

  for (const key of FRONTMATTER_KEYS) {
    if (seen.has(key)) continue;
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: null,
      observed: `frontmatter key ${key} is absent`,
      expected: 'exactly one scalar issue-id, origin, and status key',
      remediation: `Add a scalar ${key} entry to the frontmatter.`,
    });
  }

  const allowed = new Set<string>(FRONTMATTER_KEYS);
  for (const entry of parsed.entries) {
    if (allowed.has(entry.key)) continue;
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: entry.line,
      observed: `unexpected frontmatter key ${entry.key}`,
      expected: 'exactly one scalar issue-id, origin, and status key',
      remediation: `Remove the ${entry.key} key; route that fact to its owning aspect file.`,
    });
  }

  const firstScalar = (key: string): FrontmatterEntry | undefined =>
    parsed.entries.find((entry) => entry.key === key && entry.scalar !== undefined);

  const issueId = firstScalar('issue-id');
  if (issueId?.scalar !== undefined && issueId.scalar !== issue.directoryName) {
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: issueId.line,
      observed: `issue-id ${issueId.scalar}`,
      expected: `issue-id equals the full directory name ${issue.directoryName}`,
      remediation: `Set issue-id to ${issue.directoryName}.`,
    });
  }

  const origin = firstScalar('origin');
  if (origin?.scalar !== undefined && origin.scalar.trim().length === 0) {
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: origin.line,
      observed: 'empty origin value',
      expected: 'origin is non-empty and preserves the actual source reference',
      remediation: 'Record the actual source reference in origin.',
    });
  }

  const status = firstScalar('status');
  if (
    status?.scalar !== undefined &&
    !(ISSUE_STATUS_VALUES as readonly string[]).includes(status.scalar)
  ) {
    findings.push({
      ruleId: 'LINT-03',
      path: 'index.md',
      line: status.line,
      observed: `status value ${status.scalar}`,
      expected: expectedScalar('status'),
      remediation: 'Set status to pending, integrated, or rejected.',
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// LINT-04 — headings, columns, cells, declarations, routes
// ---------------------------------------------------------------------------

function columnMismatchObserved(
  observedColumns: readonly string[],
  requiredColumns: readonly string[],
): string | undefined {
  const missing = requiredColumns.filter((column) => !observedColumns.includes(column));
  const extra = observedColumns.filter((column) => !requiredColumns.includes(column));
  const ordered =
    observedColumns.length === requiredColumns.length &&
    observedColumns.every((column, index) => column === requiredColumns[index]);
  if (ordered) return undefined;

  const observedList = observedColumns.length > 0 ? observedColumns.join(', ') : '(none)';
  if (extra.length === 0 && missing.length > 0) {
    const verb = missing.length === 1 ? 'is' : 'are';
    return `table columns are ${observedList} only; ${missing.join(', ')} ${verb} missing`;
  }
  return `table columns are ${observedList}; expected exactly ${requiredColumns.join(', ')}`;
}

function requiredColumnsExpectation(requiredColumns: readonly string[]): string {
  return `exact columns ${requiredColumns.join(' and ')}`;
}

interface AspectContext {
  readonly file: IssueAspectFile;
  readonly lines: readonly string[];
  readonly headings: readonly HeadingLine[];
}

function headingFinding(file: IssueAspectFile, heading: string): LintFinding {
  return {
    ruleId: 'LINT-04',
    path: file,
    line: null,
    observed: `required heading ${heading} is absent`,
    expected: `${file} contains ${heading}`,
    remediation: `Add the ${heading} heading and its aspect content.`,
  };
}

/** Emit findings for a table's columns and required non-empty cells. */
function lintTableShape(
  file: IssueAspectFile,
  table: MarkdownTable | undefined,
  requiredColumns: readonly string[],
  headingLine: number,
): LintFinding[] {
  if (!table) {
    return [
      {
        ruleId: 'LINT-04',
        path: file,
        line: headingLine,
        observed: 'no Markdown table under the required heading',
        expected: requiredColumnsExpectation(requiredColumns),
        remediation: `Add the ${file} table with ${requiredColumns.join(', ')} columns and non-empty cells.`,
      },
    ];
  }

  const mismatch = columnMismatchObserved(table.headerCells, requiredColumns);
  if (mismatch !== undefined) {
    // A table whose header is wrong has no addressable required cells; reporting
    // per-cell findings on top would describe columns that do not exist.
    return [
      {
        ruleId: 'LINT-04',
        path: file,
        line: table.headerLine,
        observed: mismatch,
        expected: requiredColumnsExpectation(requiredColumns),
        remediation: `Restore the exact ${file.replace(/\.md$/u, '')} table columns and provide non-empty required cells.`,
      },
    ];
  }

  const findings: LintFinding[] = [];
  if (table.delimiterCells === null) {
    findings.push({
      ruleId: 'LINT-04',
      path: file,
      line: table.headerLine + 1,
      observed: 'header row is not followed by a Markdown delimiter row',
      expected: `${requiredColumns.length} valid Markdown delimiter cells`,
      remediation: `Add a delimiter row with ${requiredColumns.length} cells beneath the header.`,
    });
  }

  if (table.rows.length === 0) {
    findings.push({
      ruleId: 'LINT-04',
      path: file,
      line: table.headerLine,
      observed: 'table has no data rows',
      expected: 'at least one row with every required cell non-empty',
      remediation: `Record at least one ${file.replace(/\.md$/u, '')} row or use the exact absence declaration.`,
    });
  }

  for (const row of table.rows) {
    for (const [index, column] of requiredColumns.entries()) {
      const cell = row.cells[index];
      if (cell !== undefined && cell.length > 0) continue;
      findings.push({
        ruleId: 'LINT-04',
        path: file,
        line: row.line,
        observed: `${column} cell is empty`,
        expected: `every ${column === 'Rationale' ? 'source-request row has a non-empty Rationale' : `row has a non-empty ${column}`}`,
        remediation:
          column === 'Rationale'
            ? 'Set disposition `undecided` and write exactly `No source disposition or rationale provided.`.'
            : `Record the observed ${column} value or use the exact absence declaration.`,
      });
    }
  }

  return findings;
}

function lintIndexAspect(context: AspectContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const { lines, headings } = context;

  const summary = headings.find((heading) => heading.text === '## Summary');
  if (!summary) {
    findings.push(headingFinding('index.md', '## Summary'));
  } else {
    const body = sectionBody(lines, summary.line);
    const content = body.map((entry) => entry.text.trim()).filter((text) => text.length > 0);
    if (content.length === 0) {
      findings.push({
        ruleId: 'LINT-04',
        path: 'index.md',
        line: summary.line,
        observed: 'Summary section is empty',
        expected: `non-empty source-grounded summary text or the exact sentence ${ABSENCE_SENTENCES['index.md']}`,
        remediation: `Record the source-grounded summary, or write exactly \`${ABSENCE_SENTENCES['index.md']}\`.`,
      });
    }
  }

  const routes = headings.find((heading) => heading.text === '## Routes');
  if (!routes) {
    findings.push(headingFinding('index.md', '## Routes'));
    return findings;
  }

  const body = sectionBody(lines, routes.line);
  const table = firstTable(body);
  const columns = ASPECT_CONTRACTS['index.md'].columns;
  const shapeFindings = lintTableShape('index.md', table, columns, routes.line);
  findings.push(...shapeFindings);

  if (!table || shapeFindings.some((finding) => finding.observed.startsWith('table columns'))) {
    return findings;
  }

  const companions = ISSUE_ASPECT_FILES.filter((name) => name !== 'index.md');
  const destinations = table.rows.flatMap((row) =>
    collectLinks([row.cells.join(' | ')]).map((link) => link.destination),
  );
  for (const companion of companions) {
    const matches = destinations.filter(
      (destination) => normalizeLocalDestination(destination) === companion,
    );
    if (matches.length === 1) continue;
    findings.push({
      ruleId: 'LINT-04',
      path: 'index.md',
      line: routes.line,
      observed:
        matches.length === 0
          ? `no Routes row links to ${companion}`
          : `${String(matches.length)} Routes rows link to ${companion}`,
      expected: `exactly one relative route to ${companion}`,
      remediation: `Record exactly one Routes row whose File cell links to ${companion}.`,
    });
  }

  return findings;
}

function lintSimpleAspect(context: AspectContext): LintFinding[] {
  const { file, lines, headings } = context;
  const contract = ASPECT_CONTRACTS[file];
  const matching = headings.filter((heading) => heading.text === contract.heading);

  if (matching.length === 0) return [headingFinding(file, contract.heading)];

  if (file === 'design.md' && matching.length > 1) {
    return [
      {
        ruleId: 'LINT-04',
        path: file,
        line: matching[1].line,
        observed: `${String(matching.length)} ${contract.heading} headings`,
        expected: `exactly one ${contract.heading} heading`,
        remediation: `Keep one ${contract.heading} heading and merge its content.`,
      },
    ];
  }

  const body = sectionBody(lines, matching[0].line);
  const absence = ABSENCE_SENTENCES[file as keyof typeof ABSENCE_SENTENCES];
  const prose = proseLines(body);
  const table = firstTable(body);

  if (absence !== undefined && table === undefined) {
    if (prose.length === 1 && prose[0].text === absence) return [];
    return [
      {
        ruleId: 'LINT-04',
        path: file,
        line: prose.length > 0 ? prose[0].line : matching[0].line,
        observed:
          prose.length === 0
            ? 'section has no table and no absence declaration'
            : `section content ${JSON.stringify(prose.map((entry) => entry.text).join(' '))}`,
        expected: `the aspect table with ${contract.columns.join(', ')} columns, or exactly ${absence}`,
        remediation: `Record the aspect table, or write exactly \`${absence}\` as the only content.`,
      },
    ];
  }

  return lintTableShape(file, table, contract.columns, matching[0].line);
}

/** Request IDs whose disposition makes them eligible for verification. */
function eligibleRequestIds(issue: IssueObservation): string[] | undefined {
  const text = issue.files.get('spec.md');
  if (text === undefined) return undefined;
  const lines = splitLines(text);
  const heading = collectHeadings(lines).find(
    (entry) => entry.text === ASPECT_CONTRACTS['spec.md'].heading,
  );
  if (!heading) return undefined;
  const table = firstTable(sectionBody(lines, heading.line));
  if (!table) return undefined;
  const columns = ASPECT_CONTRACTS['spec.md'].columns;
  if (columnMismatchObserved(table.headerCells, columns) !== undefined) return undefined;

  const eligible: string[] = [];
  for (const row of table.rows) {
    const id = row.cells[0]?.trim() ?? '';
    const disposition = row.cells[2]?.trim().toLowerCase() ?? '';
    if (id.length > 0 && ELIGIBLE_DISPOSITIONS.has(disposition)) eligible.push(id);
  }
  return eligible;
}

function lintTestPlanAspect(context: AspectContext, issue: IssueObservation): LintFinding[] {
  const { lines, headings } = context;
  const contract = ASPECT_CONTRACTS['test-plan.md'];
  const heading = headings.find((entry) => entry.text === contract.heading);
  if (!heading) return [headingFinding('test-plan.md', contract.heading)];

  const body = sectionBody(lines, heading.line);
  const prose = proseLines(body);
  const table = firstTable(body);
  const eligible = eligibleRequestIds(issue);
  const findings: LintFinding[] = [];

  if (table === undefined) {
    const declaration = prose.map((entry) => entry.text).join(' ');
    const noneEligible = eligible !== undefined && eligible.length === 0;
    if (noneEligible && declaration === NO_VERIFICATION_REQUIRED) return [];
    if (
      !noneEligible &&
      declaration.startsWith(UNCOVERED_PREFIX) &&
      declaration.endsWith(UNCOVERED_SUFFIX)
    ) {
      return lintUncoveredDeclaration(declaration, eligible, [], prose[0]?.line ?? heading.line);
    }
    return [
      {
        ruleId: 'LINT-04',
        path: 'test-plan.md',
        line: prose.length > 0 ? prose[0].line : heading.line,
        observed:
          prose.length === 0
            ? 'Verification section has no checks table and no declaration'
            : `Verification declaration ${JSON.stringify(declaration)}`,
        expected: noneEligible
          ? `exactly ${NO_VERIFICATION_REQUIRED}`
          : `a checks table with ${contract.columns.join(', ')} columns, or the exact uncovered-ID declaration`,
        remediation: noneEligible
          ? `Write exactly \`${NO_VERIFICATION_REQUIRED}\` as the only Verification content.`
          : 'Record the checks table, or the exact uncovered-request-ID declaration.',
      },
    ];
  }

  const shapeFindings = lintTableShape('test-plan.md', table, contract.columns, heading.line);
  findings.push(...shapeFindings);
  if (shapeFindings.some((finding) => finding.observed.startsWith('table columns'))) {
    return findings;
  }

  const covered: string[] = [];
  if (eligible !== undefined) {
    const eligibleSet = new Set(eligible);
    for (const row of table.rows) {
      const refs = (row.cells[1] ?? '')
        .split(',')
        .map((ref) => ref.trim())
        .filter((ref) => ref.length > 0);
      const resolved = refs.filter((ref) => eligibleSet.has(ref));
      const unresolved = refs.filter((ref) => !eligibleSet.has(ref));
      covered.push(...resolved);
      for (const ref of unresolved) {
        findings.push({
          ruleId: 'LINT-04',
          path: 'test-plan.md',
          line: row.line,
          observed: `request reference ${ref} does not resolve to an accepted or undecided request`,
          expected: 'each request reference resolves to an accepted or undecided request in spec.md',
          remediation:
            'Reference an accepted or undecided request ID from spec.md; rejected, duplicate, and deferred requests are not eligible.',
        });
      }
    }

    const declaration = prose.map((entry) => entry.text).join(' ');
    const uncovered = eligible.filter((id) => !covered.includes(id));
    if (uncovered.length > 0) {
      findings.push(
        ...lintUncoveredDeclaration(
          declaration,
          eligible,
          covered,
          prose[0]?.line ?? heading.line,
        ),
      );
    } else if (declaration.startsWith(UNCOVERED_PREFIX) || declaration === NO_VERIFICATION_REQUIRED) {
      findings.push({
        ruleId: 'LINT-04',
        path: 'test-plan.md',
        line: prose[0]?.line ?? heading.line,
        observed: `verification absence declaration ${JSON.stringify(declaration)} beside full coverage`,
        expected: 'no absence declaration when every eligible request is covered',
        remediation: 'Remove the absence declaration; every eligible request already has a check.',
      });
    }
  }

  return findings;
}

function lintUncoveredDeclaration(
  declaration: string,
  eligible: readonly string[] | undefined,
  covered: readonly string[],
  line: number,
): LintFinding[] {
  const uncovered = (eligible ?? []).filter((id) => !covered.includes(id));
  const required = `${UNCOVERED_PREFIX}${uncovered.join(', ')}${UNCOVERED_SUFFIX}`;
  if (declaration === required) return [];
  return [
    {
      ruleId: 'LINT-04',
      path: 'test-plan.md',
      line,
      observed:
        declaration.length === 0
          ? `uncovered request IDs ${uncovered.join(', ')} have no declaration`
          : `verification declaration ${JSON.stringify(declaration)}`,
      expected: `exactly ${required}`,
      remediation: `Append exactly \`${required}\` in spec encounter order.`,
    },
  ];
}

function lintAspectContent(issue: IssueObservation): LintFinding[] {
  const findings: LintFinding[] = [];
  for (const file of ISSUE_ASPECT_FILES) {
    const text = issue.files.get(file);
    if (text === undefined) continue; // Absence is a LINT-01 finding, not an invented LINT-04 one.
    const lines = splitLines(text);
    const context: AspectContext = { file, lines, headings: collectHeadings(lines) };
    if (file === 'index.md') findings.push(...lintIndexAspect(context));
    else if (file === 'test-plan.md') findings.push(...lintTestPlanAspect(context, issue));
    else findings.push(...lintSimpleAspect(context));
  }
  return findings;
}

// ---------------------------------------------------------------------------
// LINT-05 — template tokens
// ---------------------------------------------------------------------------

const TOKEN_EXPECTED =
  'no canonical angle-bracket or double-brace template token; use concrete or exact absence content';
const TOKEN_REMEDIATION =
  'Replace the token with source-grounded content or the exact absence declaration; do not invent a value.';

const BLANK_TOKEN_REGEX = /\{\{[^}]*\}\}/gu;

function lintTemplateTokens(issue: IssueObservation): LintFinding[] {
  const findings: LintFinding[] = [];

  for (const file of ISSUE_ASPECT_FILES) {
    const text = issue.files.get(file);
    if (text === undefined) continue;

    for (const [index, raw] of splitLines(text).entries()) {
      const hits: { column: number; observed: string }[] = [];

      BLANK_TOKEN_REGEX.lastIndex = 0;
      let blank = BLANK_TOKEN_REGEX.exec(raw);
      while (blank !== null) {
        hits.push({ column: blank.index, observed: `blank token ${blank[0]}` });
        blank = BLANK_TOKEN_REGEX.exec(raw);
      }

      for (const marker of CANONICAL_TEMPLATE_MARKERS) {
        let from = raw.indexOf(marker);
        while (from !== -1) {
          hits.push({ column: from, observed: `canonical template marker ${marker}` });
          from = raw.indexOf(marker, from + marker.length);
        }
      }

      hits.sort((left, right) => left.column - right.column);
      for (const hit of hits) {
        findings.push({
          ruleId: 'LINT-05',
          path: file,
          line: index + 1,
          observed: hit.observed,
          expected: TOKEN_EXPECTED,
          remediation: TOKEN_REMEDIATION,
        });
      }
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// LINT-06 — local link contract
// ---------------------------------------------------------------------------

type LinkViolation = 'traversal' | 'backslash' | 'absolute' | 'query' | 'fragment' | 'unresolved';

function classifyDestination(
  destination: string,
  regularIssueFiles: ReadonlySet<string>,
): LinkViolation | undefined {
  if (destination.includes('\\')) return 'backslash';
  if (destination.split('/').includes('..')) return 'traversal';
  if (destination.startsWith('/')) return 'absolute';
  if (destination.includes('?')) return 'query';
  if (destination.includes('#')) return 'fragment';
  const normalized = normalizeLocalDestination(destination);
  if (normalized === undefined) return 'traversal';
  if (!regularIssueFiles.has(normalized)) return 'unresolved';
  return undefined;
}

function linkExpectation(violation: LinkViolation, destination: string): {
  expected: string;
  remediation: string;
} {
  switch (violation) {
    case 'traversal':
      return {
        expected: 'local destination has no path traversal and resolves within the issue folder',
        remediation:
          'Change the route to one of the five issue files using a non-traversing relative path.',
      };
    case 'backslash':
      return {
        expected: 'local destination uses / separators and resolves to one issue file',
        remediation: 'Replace the backslash separators with / and name one of the five files.',
      };
    case 'absolute':
      return {
        expected: 'local destination is relative and resolves to one issue file',
        remediation: 'Drop the leading / and use a relative destination naming one of the five files.',
      };
    case 'query':
      return {
        expected: 'local links have no query or fragment and resolve to one companion file',
        remediation: `Remove the query and use the plain relative destination ${destination.split('?')[0]}.`,
      };
    case 'fragment':
      return {
        expected: 'local destination has no fragment and resolves to exactly one issue file',
        remediation:
          'Use a relative destination naming an existing one of the five files, without a fragment.',
      };
    case 'unresolved':
      return {
        expected: 'local destination resolves to exactly one of the five regular issue files',
        remediation: 'Point the link at one of the five issue files in this folder.',
      };
  }
}

function lintLocalLinks(issue: IssueObservation): LintFinding[] {
  const regularIssueFiles = new Set(
    issue.entries
      .filter(
        (entry) =>
          entry.kind === 'regular-file' &&
          (ISSUE_ASPECT_FILES as readonly string[]).includes(entry.name),
      )
      .map((entry) => entry.name),
  );
  const findings: LintFinding[] = [];
  for (const file of ISSUE_ASPECT_FILES) {
    const text = issue.files.get(file);
    if (text === undefined) continue;
    for (const link of collectLinks(splitLines(text))) {
      if (isExternalDestination(link.destination)) continue;
      const violation = classifyDestination(link.destination, regularIssueFiles);
      if (violation === undefined) continue;
      const { expected, remediation } = linkExpectation(violation, link.destination);
      findings.push({
        ruleId: 'LINT-06',
        path: file,
        line: link.line,
        observed: `local destination ${link.destination}`,
        expected,
        remediation,
      });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// LINT-07 — docs-only goal scope
// ---------------------------------------------------------------------------

/**
 * Nouns naming the product artefacts `standard/lint.md` forbids a goal document
 * from requiring, as its own enumeration lists them.
 */
const PRODUCT_ARTEFACT_TERMS = new Set([
  'software',
  'command',
  'commands',
  'cli',
  'clis',
  'api',
  'apis',
  'runtime',
  'runtimes',
  'converter',
  'converters',
  'linter',
  'linters',
  'package',
  'packages',
  'dependency',
  'dependencies',
  'orchestration',
  'executable',
  'executables',
  'binary',
  'binaries',
  'script',
  'scripts',
]);

/** Two-word product artefacts; matched as a pair before the single-word set. */
const PRODUCT_ARTEFACT_PHRASES = [
  ['implementation', 'plan'],
  ['implementation', 'plans'],
  ['apply', 'action'],
  ['apply', 'actions'],
  ['archive', 'action'],
  ['archive', 'actions'],
  ['source', 'code'],
  ['product', 'code'],
] as const;

/**
 * Explicit requirement language is valid in unlabelled base-goal prose, as the
 * L5 documentary trace shows.
 */
const REQUIREMENT_VERB_REGEX = /\b(?:requires?|needs?|must|shall)\b/giu;

/**
 * Imperative rows are requirements only when a US identifier attributes them
 * to the declarative scope.
 */
const IMPERATIVE_REQUIREMENT_VERB_REGEX =
  /\b(?:implement(?:s|ed|ing)?|build(?:s|ing)?|ship(?:s|ped|ping)?|provide(?:s|d|ing)?|include(?:s|d|ing)?|create(?:s|d|ing)?|add(?:s|ed|ing)?|run(?:s|ning)?|use(?:s|d|ing)?)\b/giu;

/**
 * Markers that make a sentence a denial or an exemption. A goal document is
 * allowed — and this repository's goal set needs — to say "no CLI, API,
 * runtime, converter" without tripping the rule.
 */
const DENIAL_TERMS = [
  'must not',
  'shall not',
  'may not',
  'cannot',
  'never',
  'does not',
  'do not',
  'neither',
  ' no ',
  ' not ',
  ' nor ',
  'without',
  'forbid',
  'forbids',
  'forbidden',
  'exempt',
];

/**
 * Words that may end the required object phrase. A product noun only counts
 * when one of these (or the sentence end) follows it, so it is the head of the
 * object rather than a modifier.
 */
const OBJECT_BOUNDARY_WORDS = new Set([
  'and',
  'or',
  'nor',
  'for',
  'to',
  'from',
  'in',
  'of',
  'on',
  'with',
  'before',
  'after',
  'that',
  'which',
  'as',
  'plus',
  'per',
  'when',
  'while',
]);

/** Determiner/modifier slots allowed between the verb and the object head. */
const MAX_OBJECT_WORDS = 6;

function splitSentences(line: string): string[] {
  return line
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function normalizeWord(raw: string): string {
  return raw.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gu, '');
}

/** True when `word` is followed by an object boundary or the sentence end. */
function endsObjectPhrase(words: readonly string[], index: number): boolean {
  const next = words[index + 1];
  if (next === undefined) return true;
  if (/[,.;:!?)]$/u.test(next) || /^[,.;:!?)]/u.test(next)) return true;
  return OBJECT_BOUNDARY_WORDS.has(normalizeWord(next));
}

/**
 * Detect a sentence that requires a product artefact.
 *
 * The match is deliberately tight: a requirement verb, then a product noun that
 * is the *head* of the object phrase. "requires a dependency check" asks for an
 * inspection and does not fire; "requires an executable converter command and
 * implementation plan" asks for a product and does.
 *
 * A looser word search is the wrong trade. It flags the many goal sentences
 * that legitimately name a CLI or runtime while denying or inspecting one, and
 * a rule that cries wolf on ordinary prose is a rule reviewers switch off.
 */
function isForbiddenRequirement(sentence: string, allowImperative: boolean): boolean {
  const lowered = ` ${sentence.toLowerCase()} `;
  if (DENIAL_TERMS.some((term) => lowered.includes(term))) return false;

  const verbExpressions = allowImperative
    ? [REQUIREMENT_VERB_REGEX, IMPERATIVE_REQUIREMENT_VERB_REGEX]
    : [REQUIREMENT_VERB_REGEX];
  for (const verbExpression of verbExpressions) {
    verbExpression.lastIndex = 0;
    let verb = verbExpression.exec(sentence);
    while (verb !== null) {
      const tail = sentence.slice(verb.index + verb[0].length);
      const words = tail.split(/\s+/u).filter((word) => word.length > 0);
      const limit = Math.min(words.length, MAX_OBJECT_WORDS);

      for (let index = 0; index < limit; index += 1) {
        const word = normalizeWord(words[index]);
        const next = normalizeWord(words[index + 1] ?? '');
        const isPhrase = PRODUCT_ARTEFACT_PHRASES.some(
          ([first, second]) => first === word && second === next,
        );
        if (isPhrase && endsObjectPhrase(words, index + 1)) return true;
        if (PRODUCT_ARTEFACT_TERMS.has(word) && endsObjectPhrase(words, index)) return true;
      }

      verb = verbExpression.exec(sentence);
    }
  }

  return false;
}

/**
 * Attribute a candidate requirement to its owning US identifier before judging
 * it. An explicit `US-13` through `US-26` marker always excludes that
 * requirement, even when its prose mentions a docs-only US in a cross-reference.
 * Unlabelled base-goal prose remains in declarative scope; the L5 documentary
 * trace intentionally exercises that form.
 */
function lintGoalScope(goal: GoalObservation | undefined): LintFinding[] {
  if (!goal) return [];
  const findings: LintFinding[] = [];

  if (goal.rootError !== undefined) {
    const root = goal.rootPath ?? '(unknown goal root)';
    findings.push({
      ruleId: 'LINT-07',
      path: '.',
      line: null,
      observed: `goal root ${root} is unreadable: ${goal.rootError}`,
      expected: 'a readable goal root containing the five named goal documents',
      remediation: `Restore readable access to goal root ${root}.`,
    });
  }

  for (const name of GOAL_DOCUMENT_FILES) {
    const text = goal.documents.get(name);
    if (text === undefined) continue;
    let activeUs: number | undefined;
    for (const [index, raw] of splitLines(text).entries()) {
      const lineIdentifier = /\bUS-(\d{2,})\b/iu.exec(raw);
      if (lineIdentifier !== null) {
        activeUs = Number(lineIdentifier[1]);
      } else if (/^#{1,6}\s/u.test(raw)) {
        activeUs = undefined;
      }

      for (const sentence of splitSentences(raw)) {
        const sentenceIdentifier = /\bUS-(\d{2,})\b/iu.exec(sentence);
        const requirementUs =
          sentenceIdentifier === null ? activeUs : Number(sentenceIdentifier[1]);
        if (
          requirementUs !== undefined &&
          (requirementUs < 1 || requirementUs > 12)
        ) {
          continue;
        }
        if (!isForbiddenRequirement(sentence, requirementUs !== undefined)) continue;
        findings.push({
          ruleId: 'LINT-07',
          path: name,
          line: index + 1,
          observed: sentence,
          expected: 'the five goal documents require only declarative standard and inspection evidence',
          remediation:
            'Remove the forbidden executable converter and implementation requirement from the goal document.',
        });
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/**
 * Sort one rule's findings into the order the recorded traces use: by path,
 * then by line, then by discovery. `standard/lint.md` fixes no order, so the
 * validator picks a stable one a reviewer can diff, rather than leaking the
 * order rules happen to walk their inputs.
 */
function orderFindings(findings: readonly LintFinding[]): LintFinding[] {
  return findings
    .map((finding, index) => ({ finding, index }))
    .sort((left, right) => {
      if (left.finding.path !== right.finding.path) {
        return left.finding.path < right.finding.path ? -1 : 1;
      }
      const leftLine = left.finding.line ?? -1;
      const rightLine = right.finding.line ?? -1;
      if (leftLine !== rightLine) return leftLine - rightLine;
      return left.index - right.index;
    })
    .map((entry) => entry.finding);
}

/**
 * Evaluate all seven rules against one target.
 *
 * Findings are returned in rule order, then by path and line within a rule.
 * `evaluatedRules` always lists all seven: `standard/lint.md` forbids stopping
 * after the first failure, so a caller can distinguish "rule passed" from
 * "rule never ran" without a second signal.
 */
export function lintIssue(input: LintInput): LintReport {
  const { issue, goal } = input;
  const findings: LintFinding[] = [
    ...orderFindings(lintPackageBoundary(issue)),
    ...orderFindings(lintDirectoryIdentity(issue)),
    ...orderFindings(lintIndexFrontmatter(issue)),
    ...orderFindings(lintAspectContent(issue)),
    ...orderFindings(lintTemplateTokens(issue)),
    ...orderFindings(lintLocalLinks(issue)),
    ...orderFindings(lintGoalScope(goal)),
  ];

  return {
    evaluatedRules: LINT_RULE_IDS,
    findings,
    result: findings.length === 0 ? 'PASS' : 'FAIL',
  };
}

// ---------------------------------------------------------------------------
// Filesystem adapters
// ---------------------------------------------------------------------------

function entryKindOf(entry: {
  isSymbolicLink: () => boolean;
  isFile: () => boolean;
  isDirectory: () => boolean;
}): EntryKind {
  if (entry.isSymbolicLink()) return 'symlink';
  if (entry.isFile()) return 'regular-file';
  if (entry.isDirectory()) return 'directory';
  return 'other';
}

/** Read one issue directory into an observation. */
export function observeIssue(issueDirectory: string): IssueObservation {
  const absolute = path.resolve(issueDirectory);
  const entries: ObservedEntry[] = readdirSync(absolute, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    kind: entryKindOf(entry),
  }));

  const files = new Map<string, string>();
  for (const entry of entries) {
    if (entry.kind !== 'regular-file') continue;
    if (!(ISSUE_ASPECT_FILES as readonly string[]).includes(entry.name)) continue;
    files.set(entry.name, readFileSync(path.join(absolute, entry.name), 'utf8'));
  }

  return {
    directoryName: path.basename(absolute),
    entries,
    files,
    siblingDirectoryNames: readSiblingDirectoryNames(path.dirname(absolute)),
  };
}

/**
 * Read the five goal documents. A requested root is itself an observation:
 * inaccessible roots are carried into LINT-07 rather than becoming a silent
 * empty document set.
 */
export function observeGoal(goalRoot: string): GoalObservation {
  const absolute = path.resolve(goalRoot);
  const documents = new Map<string, string>();
  try {
    readdirSync(absolute);
  } catch (error) {
    return {
      documents,
      rootPath: absolute,
      rootError: error instanceof Error ? error.message : String(error),
    };
  }

  for (const name of GOAL_DOCUMENT_FILES) {
    try {
      documents.set(name, readFileSync(path.join(absolute, name), 'utf8'));
    } catch {
      // A missing document has no text to inspect for a product requirement.
    }
  }
  return { documents, rootPath: absolute };
}
