import { describe, expect, test } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  ISSUE_DIRECTORY_REGEX,
  allocateIdentity,
  allocateIdentityIn,
  allocateNumber,
  firstNonEmptySentence,
  normalizeTitle,
  readSiblingDirectoryNames,
  renderNumber,
  reservedNumbers,
  selectTitle,
  slugFromTitle,
} from '../src/core/issue/identity.js';

function withTempParent(run: (parent: string) => void): void {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-identity-'));
  try {
    run(parent);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

describe('C-002 number allocation', () => {
  test('reserves malformed candidates and picks the smallest unused integer', () => {
    const siblings = ['i-001-old', 'i-003-existing', 'i-002-'];

    expect([...reservedNumbers(siblings)].sort((a, b) => a - b)).toEqual([
      1, 2, 3,
    ]);
    expect(allocateNumber(siblings)).toBe(4);

    const identity = allocateIdentity({
      titleCandidates: ['Uni spec issue generation'],
      siblingDirectoryNames: siblings,
    });

    expect(identity.issueId).toBe('i-004-uni-spec-issue-generation');
    expect(ISSUE_DIRECTORY_REGEX.test(identity.issueId)).toBe(true);
  });

  test('fills the gap the standard names: 1 and 3 taken yields 2', () => {
    expect(allocateNumber(['i-001-old', 'i-003-existing'])).toBe(2);
  });

  test('an empty collection allocates 1', () => {
    expect(allocateNumber([])).toBe(1);
    expect(allocateNumber(['notes', 'i-abc-thing', 'i-x'])).toBe(1);
  });

  test('zero and non-positive candidates reserve nothing', () => {
    expect(allocateNumber(['i-000-void', 'i-0-void'])).toBe(1);
  });

  test('renders at least three digits and never truncates larger values', () => {
    expect(renderNumber(1)).toBe('001');
    expect(renderNumber(42)).toBe('042');
    expect(renderNumber(999)).toBe('999');
    expect(renderNumber(1000)).toBe('1000');
    expect(renderNumber(10001)).toBe('10001');
  });

  test('allocation walks past a dense collection', () => {
    const siblings = Array.from(
      { length: 12 },
      (_, index) => `i-${String(index + 1).padStart(3, '0')}-slug-here`
    );
    expect(allocateNumber(siblings)).toBe(13);
  });
});

describe('C-003 slug derivation', () => {
  test('a four-plus-word title keeps the first four lowercase tokens', () => {
    expect(slugFromTitle('Replace The OpenSpec Scaffold With Five Files')).toBe(
      'replace-the-openspec-scaffold'
    );
  });

  test('a single-token title gains the issue suffix', () => {
    expect(slugFromTitle('Scaffold')).toBe('scaffold-issue');
    expect(slugFromTitle('  Scaffold  ')).toBe('scaffold-issue');
  });

  test('an empty title falls back to the exact fallback slug', () => {
    expect(selectTitle([''], undefined)).toBe('Untitled issue');
    expect(slugFromTitle(selectTitle([''], undefined))).toBe('untitled-issue');
    expect(slugFromTitle(selectTitle([], undefined))).toBe('untitled-issue');
  });

  test('a punctuation-only title falls back to the exact fallback slug', () => {
    expect(selectTitle(['!!! ???'], undefined)).toBe('!!! ???');
    expect(slugFromTitle('!!! ???')).toBe('untitled-issue');
  });

  test('every maximal non-alphanumeric run collapses to one hyphen', () => {
    expect(slugFromTitle('CLI   ---  runtime___recovery!!')).toBe(
      'cli-runtime-recovery'
    );
    expect(slugFromTitle('v2.0 / release notes')).toBe('v2-0-release-notes');
  });

  test('non-ASCII characters are separators, not tokens', () => {
    expect(slugFromTitle('café → beans')).toBe('caf-beans');
    expect(slugFromTitle('日本語')).toBe('untitled-issue');
  });

  test('derived slugs always satisfy the observable directory pattern', () => {
    for (const title of [
      'Replace The OpenSpec Scaffold With Five Files',
      'Scaffold',
      '',
      '!!! ???',
      'café → beans',
    ]) {
      const identity = allocateIdentity({
        titleCandidates: [title],
        siblingDirectoryNames: [],
      });
      expect(ISSUE_DIRECTORY_REGEX.test(identity.issueId)).toBe(true);
    }
  });
});

describe('title selection order', () => {
  test('trim and collapse run before the non-empty test', () => {
    expect(normalizeTitle('  loop   completion \n archive ')).toBe(
      'loop completion archive'
    );
    expect(selectTitle(['   ', '\n\t', 'Real title'])).toBe('Real title');
  });

  test('the first non-empty candidate wins; later ones are observations', () => {
    expect(selectTitle(['', 'First real', 'Second real'])).toBe('First real');
  });

  test('the first source ask supplies the fallback title', () => {
    expect(
      selectTitle([''], 'Replace the scaffold. Then lint the package.')
    ).toBe('Replace the scaffold.');
    expect(slugFromTitle(selectTitle([''], 'Replace the scaffold. Then lint.'))).toBe(
      'replace-the-scaffold'
    );
  });

  test('a supplied title outranks the source ask', () => {
    expect(selectTitle(['Supplied'], 'Ask sentence here.')).toBe('Supplied');
  });

  test('an empty source ask falls through to the exact fallback title', () => {
    expect(selectTitle([], '   ')).toBe('Untitled issue');
    expect(firstNonEmptySentence('   ')).toBe('');
    expect(firstNonEmptySentence('. . Real sentence.')).toBe('.');
  });
});

describe('sibling collection on disk', () => {
  test('reads direct-child directories only, and ignores files', () => {
    withTempParent((parent) => {
      mkdirSync(path.join(parent, 'i-001-old'));
      mkdirSync(path.join(parent, 'i-003-existing'));
      mkdirSync(path.join(parent, 'i-002-'));
      writeFileSync(path.join(parent, 'i-009-a-file.md'), 'not a directory\n');

      expect(readSiblingDirectoryNames(parent).sort()).toEqual([
        'i-001-old',
        'i-002-',
        'i-003-existing',
      ]);

      const identity = allocateIdentityIn(parent, {
        titleCandidates: ['Uni spec issue generation'],
      });
      expect(identity.issueId).toBe('i-004-uni-spec-issue-generation');
    });
  });

  test('nested grandchildren do not reserve numbers', () => {
    withTempParent((parent) => {
      mkdirSync(path.join(parent, 'group', 'i-001-nested'), {
        recursive: true,
      });
      expect(allocateIdentityIn(parent).number).toBe(1);
    });
  });

  test('a missing parent is an empty collection', () => {
    withTempParent((parent) => {
      const missing = path.join(parent, 'not-created-yet');
      expect(readSiblingDirectoryNames(missing)).toEqual([]);
      expect(allocateIdentityIn(missing).issueId).toBe('i-001-untitled-issue');
    });
  });
});

describe('identity freezing', () => {
  test('a later title never re-derives an allocated identity', () => {
    const first = allocateIdentity({
      titleCandidates: ['Original frozen title'],
      siblingDirectoryNames: [],
    });
    expect(first.issueId).toBe('i-001-original-frozen-title');

    // Re-deriving with a new title is what a caller must never do; the point of
    // this check is that the identity is a plain frozen value, so re-running
    // allocation cannot mutate the first result.
    const second = allocateIdentity({
      titleCandidates: ['Completely different title now'],
      siblingDirectoryNames: [first.issueId],
    });
    expect(first.issueId).toBe('i-001-original-frozen-title');
    expect(second.issueId).toBe('i-002-completely-different-title-now');
  });

  test('the identity carries the normalized title for the caller to write', () => {
    const identity = allocateIdentity({
      titleCandidates: ['  Loop   completion  archive  '],
      siblingDirectoryNames: [],
    });
    expect(identity.title).toBe('Loop completion archive');
    expect(identity.slug).toBe('loop-completion-archive');
    expect(identity.number).toBe(1);
    expect(identity.renderedNumber).toBe('001');
  });
});
