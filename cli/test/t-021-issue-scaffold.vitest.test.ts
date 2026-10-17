import { describe, expect, test } from 'vitest';
import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DOCUMENTED_SUBSTITUTIONS,
  ISSUE_ASPECT_FILES,
  ISSUE_ID_PLACEHOLDER_LINE,
  ORIGIN_PLACEHOLDER_LINE,
  TEMPLATE_ONLY_COMMENT_LINE,
  TemplateDriftError,
  readIssueStatus,
  renderIndex,
  scaffoldIssue,
} from '../src/core/issue/scaffold.js';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const templateDir = path.join(repoRoot, 'standard', 'templates', 'issue');

function withTempParent(run: (parent: string) => void): void {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-scaffold-'));
  try {
    run(parent);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function templateBytes(file: string): Buffer {
  return readFileSync(path.join(templateDir, file));
}

describe('C-001 package boundary', () => {
  test('creates exactly the five aspect files and no sixth entry', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Package boundary check',
        origin: 'source/request-001',
        templateDir,
      });

      const entries = readdirSync(created.directory, { withFileTypes: true });

      expect(entries).toHaveLength(5);
      expect(entries.map((entry) => entry.name).sort()).toEqual(
        [...ISSUE_ASPECT_FILES].sort()
      );

      for (const entry of entries) {
        // isFile() alone would accept a symlink resolved by readdir; lstat is
        // the only way to prove the entry itself is a regular file.
        const stats = lstatSync(path.join(created.directory, entry.name));
        expect(stats.isFile()).toBe(true);
        expect(stats.isSymbolicLink()).toBe(false);
        expect(stats.isDirectory()).toBe(false);
      }
    });
  });

  test('writes no README.md and no .openspec.yaml', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'No operational state inside',
        templateDir,
      });

      const names = readdirSync(created.directory);
      expect(names).not.toContain('README.md');
      expect(names).not.toContain('.openspec.yaml');
      expect(names).not.toContain('.openspec.yml');
    });
  });

  test('reports the five created files in dependency order', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Dependency order',
        templateDir,
      });

      expect(created.files.map((file) => path.basename(file))).toEqual([
        ...ISSUE_ASPECT_FILES,
      ]);
    });
  });

  test('creates the folder under the allocated identity', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Folder matches identity',
        templateDir,
      });

      expect(path.basename(created.directory)).toBe(created.identity.issueId);
      expect(created.identity.issueId).toBe('i-001-folder-matches-identity');
    });
  });

  test('refuses to overwrite an existing package', () => {
    withTempParent((parent) => {
      const first = scaffoldIssue({
        parentDirectory: parent,
        title: 'Same title twice',
        templateDir,
      });
      const second = scaffoldIssue({
        parentDirectory: parent,
        title: 'Same title twice',
        templateDir,
      });

      // The same title yields the same slug, so only the allocated number keeps
      // the second package from landing on the first.
      expect(first.directory).not.toBe(second.directory);
      expect(second.identity.number).toBe(2);
      expect(readdirSync(parent).sort()).toEqual([
        'i-001-same-title-twice',
        'i-002-same-title-twice',
      ]);
    });
  });
});

describe('C-005 template authority', () => {
  test('copies the four non-index aspects byte for byte', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Byte identical copies',
        origin: 'source/request-005',
        templateDir,
      });

      for (const file of ISSUE_ASPECT_FILES) {
        if (file === 'index.md') continue;
        const generated = readFileSync(path.join(created.directory, file));
        expect(generated.equals(templateBytes(file))).toBe(true);
      }
    });
  });

  test('index.md differs from its template only by documented substitutions', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Documented substitutions only',
        origin: 'source/request-005',
        templateDir,
      });

      const generated = readFileSync(
        path.join(created.directory, 'index.md'),
        'utf-8'
      );
      const template = templateBytes('index.md').toString('utf-8');

      // Re-applying only the documented finds to the template must reproduce
      // the generated bytes exactly. Any undocumented edit breaks this.
      const expected = template
        .replace(
          ISSUE_ID_PLACEHOLDER_LINE,
          `issue-id: "${created.identity.issueId}"`
        )
        .replace(ORIGIN_PLACEHOLDER_LINE, 'origin: "source/request-005"')
        .replace(`${TEMPLATE_ONLY_COMMENT_LINE}\n`, '');

      expect(generated).toBe(expected);
    });
  });

  test('every documented substitution names text the template really contains', () => {
    for (const substitution of DOCUMENTED_SUBSTITUTIONS) {
      const template = templateBytes(substitution.file).toString('utf-8');
      expect(template).toContain(substitution.find);
    }
  });

  test('carries no template-only marker into the generated package', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'No template only note',
        templateDir,
      });

      const generated = readFileSync(
        path.join(created.directory, 'index.md'),
        'utf-8'
      );
      expect(generated).not.toContain(TEMPLATE_ONLY_COMMENT_LINE);
      expect(generated).not.toContain('i-<nnn>-<slug>');
    });
  });

  test('fails a drift check when the template loses an expected line', () => {
    const drifted = templateBytes('index.md')
      .toString('utf-8')
      .replace(ISSUE_ID_PLACEHOLDER_LINE, 'issue-id: "renamed-key"');

    expect(() =>
      renderIndex(drifted, {
        number: 1,
        renderedNumber: '001',
        slug: 'drift-check',
        issueId: 'i-001-drift-check',
        title: 'Drift check',
      })
    ).toThrow(TemplateDriftError);
  });

  test('leaves the source reference marker when no origin is supplied', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Origin not supplied',
        templateDir,
      });

      const generated = readFileSync(
        path.join(created.directory, 'index.md'),
        'utf-8'
      );

      // A source reference is never invented, so the marker stays and lint
      // reports it under LINT-05.
      expect(created.originPending).toBe(true);
      expect(generated).toContain(ORIGIN_PLACEHOLDER_LINE);
    });
  });
});

describe('C-006 status from frontmatter', () => {
  test('a fresh package reports pending', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Fresh package status',
        origin: 'source/request-006',
        templateDir,
      });

      expect(readIssueStatus(created.directory)).toBe('pending');
    });
  });

  test('a hand-edited status is what the CLI reads back', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Hand edited status',
        origin: 'source/request-006',
        templateDir,
      });

      const indexPath = path.join(created.directory, 'index.md');
      const edited = readFileSync(indexPath, 'utf-8').replace(
        'status: "pending"',
        'status: "integrated"'
      );
      writeFileSync(indexPath, edited, 'utf-8');

      expect(readIssueStatus(created.directory)).toBe('integrated');
    });
  });

  test('a status line after the frontmatter close is body, not state', () => {
    withTempParent((parent) => {
      const created = scaffoldIssue({
        parentDirectory: parent,
        title: 'Body is not state',
        origin: 'source/request-006',
        templateDir,
      });

      const indexPath = path.join(created.directory, 'index.md');
      const edited = readFileSync(indexPath, 'utf-8').replace(
        'status: "pending"',
        'origin-note: "kept"'
      );
      writeFileSync(indexPath, `${edited}\nstatus: "integrated"\n`, 'utf-8');

      expect(readIssueStatus(created.directory)).toBeUndefined();
    });
  });
});
