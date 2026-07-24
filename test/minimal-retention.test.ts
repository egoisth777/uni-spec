import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type RetentionEntry = {
  path: string;
  scope: 'exact' | 'recursive';
  decision: 'retain';
  required: boolean;
  temporary: boolean;
  evidence: string;
  rationale: string;
};

type Decision = {
  path: string;
  observed: string;
  decision: 'retain' | 'exclude' | 'absent';
  evidence: string;
  rationale: string;
};

type RetentionRecord = {
  schemaVersion: number;
  ticket: string;
  phase: string;
  status: string;
  ptMapping: {
    id: string;
    goalContractRef: string;
    executableTarget: string;
    testFile: string;
  };
  requiredRoots: string[];
  allowlist: RetentionEntry[];
  decisions: Decision[];
  absentPaths: string[];
  temporarySupport: string[];
  ignoredLocalSupport: string[];
};

const repositoryRoot = process.cwd();
const recordPath = path.join(repositoryRoot, '.arca/io/t-010-minimal-retention.json');
const vcsOnly = new Set(['.git']);

async function readRecord(): Promise<RetentionRecord> {
  return JSON.parse(await fs.readFile(recordPath, 'utf8')) as RetentionRecord;
}

async function walk(relativeRoot: string): Promise<string[]> {
  const result: string[] = [];
  async function visit(relativePath: string): Promise<void> {
    const absolutePath = path.join(repositoryRoot, relativePath);
    for (const entry of await fs.readdir(absolutePath, { withFileTypes: true })) {
      const child = path.posix.join(relativePath, entry.name);
      if (entry.isDirectory()) await visit(child);
      else result.push(child);
    }
  }
  await visit(relativeRoot);
  return result;
}


describe('repository-audit PT-010', () => {
  it('has a complete, explicit retention allowlist and evidence for every decision', async () => {
    const record = await readRecord();
    expect(record.schemaVersion).toBe(1);
    expect(record.ticket).toBe('t-010-minimal-retention');
    expect(record.phase).toBe('P5');
    expect(record.status).toBe('complete');
    expect(record.ptMapping).toEqual({
      id: 'PT-010',
      goalContractRef: '.arca/goal/spec.md#integrated-issue-requirements (US-11)',
      executableTarget: 'repository-audit PT-010',
      testFile: 'test/minimal-retention.test.ts',
    });
    expect(record.requiredRoots).toEqual(['.arca', 'standard', 'AGENTS.md']);
    expect(record.allowlist.length).toBeGreaterThan(0);
    expect(new Set(record.allowlist.map((entry) => entry.path)).size).toBe(record.allowlist.length);
    for (const entry of record.allowlist) {
      expect(['exact', 'recursive']).toContain(entry.scope);
      expect(entry.decision).toBe('retain');
      expect(entry.evidence).not.toBe('');
      expect(entry.rationale).not.toBe('');
      if (entry.path === 'test') expect(entry.temporary).toBe(true);
    }
    expect(record.temporarySupport).toEqual(
      expect.arrayContaining(['package.json', 'tsconfig.json', 'vitest.config.ts', 'test']),
    );
    expect(record.ignoredLocalSupport).toEqual(['node_modules/']);
    expect(record.absentPaths).toContain('test/AGENTS.md');
    expect(record.decisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'test/AGENTS.md', decision: 'absent' }),
        expect.objectContaining({ path: 'node_modules/', decision: 'exclude' }),
      ]),
    );
    for (const decision of record.decisions) {
      expect(decision.path).not.toBe('');
      expect(decision.observed).not.toBe('');
      expect(decision.evidence).not.toBe('');
      expect(decision.rationale).not.toBe('');
    }
  });

  it('matches the complete retained tree and rejects unexplained root paths', async () => {
    const record = await readRecord();
    const roots = new Map(record.allowlist.map((entry) => [entry.path, entry]));
    const actualRoots = (await fs.readdir(repositoryRoot, { withFileTypes: true }))
      .map((entry) => entry.name)
      .filter((entry) => !vcsOnly.has(entry) && entry !== 'node_modules')
      .sort();
    const expectedRoots = [...roots.keys()].sort();
    expect(actualRoots).toEqual(expectedRoots);
    expect(await fs.lstat(path.join(repositoryRoot, 'test/AGENTS.md')).catch(() => null)).toBeNull();
    for (const entry of record.allowlist) {
      const absolute = path.join(repositoryRoot, entry.path);
      const stat = await fs.lstat(absolute);
      expect(stat.isSymbolicLink()).toBe(false);
      if (entry.scope === 'recursive') {
        for (const file of await walk(entry.path)) {
          const fileStat = await fs.lstat(path.join(repositoryRoot, file));
          expect(fileStat.isFile()).toBe(true);
          expect(fileStat.isSymbolicLink()).toBe(false);
        }
      } else {
        expect(stat.isFile()).toBe(true);
      }
    }
    for (const file of await walk('test')) {
      expect(file.split('/')[0]).toBe('test');
      expect(file).not.toBe('test/AGENTS.md');
    }
  });

  it('keeps temporary support declarative, routes root guidance, and maps PT-010', async () => {
    const record = await readRecord();
    const agents = await fs.readFile(path.join(repositoryRoot, 'AGENTS.md'), 'utf8');
    expect(agents.trim()).not.toBe('');
    expect(agents).toContain('.arca/index.md');
    expect(await fs.readFile(path.join(repositoryRoot, 'package.json'), 'utf8')).not.toMatch(
      /(?:bin|src|dist|openspec|website|runtime|cli|api)/i,
    );
    for (const support of record.temporarySupport) {
      expect(record.allowlist.find((entry) => entry.path === support)?.temporary).toBe(true);
    }
    expect(record.allowlist.find((entry) => entry.path === '.arca')?.required).toBe(true);
    expect(record.allowlist.find((entry) => entry.path === 'standard')?.required).toBe(true);
    expect(record.allowlist.find((entry) => entry.path === 'AGENTS.md')?.required).toBe(true);
  });
});
