import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cli = path.join(repoRoot, 'cli', 'bin', 'uni-spec.js');
const schemaPath = path.join(repoRoot, 'cli', 'schemas', 'uni-spec', 'schema.yaml');
const aspectFiles = [
  'index.md',
  'ubi-lang.md',
  'spec.md',
  'design.md',
  'test-plan.md',
] as const;

interface RunResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

/** Exercise the published shim, not a command/helper import. */
function runCli(args: readonly string[], cwd: string = repoRoot): RunResult {
  try {
    const stdout = execFileSync(process.execPath, [cli, ...args], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    const failure = error as {
      status?: number;
      stdout?: string | Buffer;
      stderr?: string | Buffer;
    };
    return {
      status: failure.status ?? 1,
      stdout: String(failure.stdout ?? ''),
      stderr: String(failure.stderr ?? ''),
    };
  }
}

function withTempParent(run: (parent: string) => void): void {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-status-'));
  try {
    run(parent);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function scaffoldWithBinary(parent: string): string {
  const created = runCli(
    [
      'issue',
      'new',
      'Five aspect status',
      '--in',
      parent,
      '--origin',
      'source/PT-026',
    ],
    parent
  );
  expect(created.status).toBe(0);

  const entries = readdirSync(parent, { withFileTypes: true });
  expect(entries).toHaveLength(1);
  const issue = entries[0];
  expect(issue?.isDirectory()).toBe(true);
  return path.join(parent, issue!.name);
}

function completeSpec(issue: string): void {
  writeFileSync(
    path.join(issue, 'spec.md'),
    [
      '# Specification',
      '',
      '## Source requests',
      '',
      '| Request ID | Source ask | Disposition | Rationale |',
      '| --- | --- | --- | --- |',
      '| R-001 | A completed source request | accepted | Its source-grounded rationale. |',
      '',
    ].join('\n'),
    'utf8'
  );
}

function artifactBlocks(schema: string): Record<string, string> {
  const blocks: Record<string, string> = {};
  for (const artifact of schema.split(/^  - id: /mu).slice(1)) {
    const [id, ...lines] = artifact.split(/\r?\n/u);
    if (id === undefined) continue;
    const artifactId = id.trim();
    if (Object.hasOwn(blocks, artifactId)) {
      throw new Error(`Duplicate schema artifact ${artifactId}`);
    }
    blocks[artifactId] = lines.join('\n');
  }
  return blocks;
}

describe('PT-026-a status speaks the five-aspect vocabulary', () => {
  test('reports a package reached through absolute, relative, and collection-member paths', () => {
    withTempParent((parent) => {
      const collection = path.join(parent, '.arca', 'issue');
      mkdirSync(collection, { recursive: true });
      const issue = scaffoldWithBinary(collection);
      const absolute = runCli(['issue', 'status', issue], parent);
      expect(absolute.status).toBe(0);
      expect(absolute.stdout).toContain('Progress: 0/5 aspects complete');
      for (const aspect of ['index', 'ubi-lang', 'spec', 'design', 'test-plan']) {
        expect(absolute.stdout).toContain(aspect);
      }
      expect(absolute.stdout).not.toMatch(/\b(?:proposal|specs|tasks)\b/u);

      const relative = runCli(
        ['issue', 'status', path.basename(issue)],
        collection
      );
      expect(relative.status).toBe(0);
      expect(relative.stdout).toContain('Progress: 0/5 aspects complete');

      const member = runCli(['issue', 'status', path.basename(issue)], parent);
      expect(member.status).toBe(0);
      expect(member.stdout).toContain('Progress: 0/5 aspects complete');
    });
  });
});

describe('PT-026-b dependency transitions', () => {
  test('keeps only the declared direct dependencies blocked', () => {
    withTempParent((parent) => {
      const issue = scaffoldWithBinary(parent);
      const before = runCli(['issue', 'status', issue], parent);
      expect(before.status).toBe(0);
      expect(before.stdout).toMatch(/index: ready \(requires: nothing\)/u);
      expect(before.stdout).toMatch(/ubi-lang: blocked \(blocked by: index\)/u);
      expect(before.stdout).toMatch(/spec: blocked \(blocked by: index\)/u);
      expect(before.stdout).toMatch(/design: blocked \(blocked by: spec\)/u);
      expect(before.stdout).toMatch(/test-plan: blocked \(blocked by: spec\)/u);

      completeSpec(issue);
      const after = runCli(['issue', 'status', issue], parent);
      expect(after.status).toBe(0);
      expect(after.stdout).toMatch(/spec: done/u);
      expect(after.stdout).toMatch(/design: ready/u);
      expect(after.stdout).toMatch(/test-plan: ready/u);
      expect(after.stdout).not.toMatch(/design: blocked/u);
      expect(after.stdout).not.toMatch(/test-plan: blocked/u);
    });
  });
});

describe('PT-026-c five-aspect schema', () => {
  test('declares exactly the root-level outputs and declared dependency edges', () => {
    const blocks = artifactBlocks(readFileSync(schemaPath, 'utf8'));
    expect(Object.keys(blocks)).toEqual([
      'index',
      'ubi-lang',
      'spec',
      'design',
      'test-plan',
    ]);

    const expected: Record<
      string,
      { readonly generates: string; readonly requires: readonly string[] }
    > = {
      index: { generates: 'index.md', requires: [] },
      'ubi-lang': { generates: 'ubi-lang.md', requires: ['index'] },
      spec: { generates: 'spec.md', requires: ['index'] },
      design: { generates: 'design.md', requires: ['spec'] },
      'test-plan': { generates: 'test-plan.md', requires: ['spec'] },
    };

    for (const [id, contract] of Object.entries(expected)) {
      const block = blocks[id];
      expect(block).toBeDefined();
      const generates = /^    generates: ([^\r\n]+)$/mu.exec(block!);
      expect(generates?.[1]).toBe(contract.generates);
      expect(generates?.[1]).not.toContain('/');
      expect(generates?.[1]).not.toContain('\\');

      if (contract.requires.length === 0) {
        expect(block).toMatch(/^    requires: \[\]$/mu);
        continue;
      }

      const requires = /^    requires:\r?\n((?:      - [^\r\n]+\r?\n)*)/mu.exec(
        block!
      );
      expect(requires).not.toBeNull();
      const required = [...requires![1]!.matchAll(/^      - ([^\r\n]+)$/gmu)].map(
        (match) => match[1]!.trim()
      );
      expect(required).toEqual(contract.requires);
    }
  });
});

describe('PT-026-d lifecycle comes from frontmatter through the built binary', () => {
  test('reports a hand-set integrated lifecycle without adding a sidecar', () => {
    withTempParent((parent) => {
      const issue = scaffoldWithBinary(parent);
      const indexPath = path.join(issue, 'index.md');
      writeFileSync(
        indexPath,
        readFileSync(indexPath, 'utf8').replace('status: "pending"', 'status: "integrated"'),
        'utf8'
      );

      const result = runCli(['issue', 'status', issue], parent);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Lifecycle: integrated');
      expect(readdirSync(issue).sort()).toEqual([...aspectFiles].sort());
      for (const file of aspectFiles) {
        expect(lstatSync(path.join(issue, file)).isFile()).toBe(true);
      }
    });
  });
});

describe('PT-026-e status is read-only', () => {
  test('does not add an entry to a freshly scaffolded package', () => {
    withTempParent((parent) => {
      const issue = scaffoldWithBinary(parent);
      const before = readdirSync(issue).sort();
      const result = runCli(['issue', 'status', issue], parent);
      expect(result.status).toBe(0);
      expect(readdirSync(issue).sort()).toEqual(before);
      expect(before).toEqual([...aspectFiles].sort());
    });
  });
});

describe('PT-026-f malformed frontmatter is not assigned a default lifecycle', () => {
  test('fails non-zero with the index filename and an unterminated-frontmatter problem', () => {
    withTempParent((parent) => {
      const issue = scaffoldWithBinary(parent);
      writeFileSync(
        path.join(issue, 'index.md'),
        ['---', 'issue-id: "i-001-five-aspect-status"', 'status: "pending"', ''].join('\n'),
        'utf8'
      );

      const result = runCli(['issue', 'status', issue], parent);
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain('index.md');
      expect(`${result.stdout}${result.stderr}`).toMatch(/unterminated frontmatter/u);
      expect(`${result.stdout}${result.stderr}`).not.toContain('Lifecycle: pending');
    });
  });

  test('fails explicitly when index.md is absent', () => {
    withTempParent((parent) => {
      const issue = scaffoldWithBinary(parent);
      rmSync(path.join(issue, 'index.md'));

      const result = runCli(['issue', 'status', issue], parent);
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain('index.md');
      expect(`${result.stdout}${result.stderr}`).toMatch(/cannot read frontmatter/u);
      expect(`${result.stdout}${result.stderr}`).not.toMatch(/Lifecycle:/u);
    });
  });
});
