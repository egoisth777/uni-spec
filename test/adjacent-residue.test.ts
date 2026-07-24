import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Candidate = {
  path: string;
  category: string;
  decision: 'purge' | 'retain';
  evidence: string;
  rationale: string;
};

type RecordShape = {
  ticket: string;
  phase: string;
  status: string;
  observedRootCandidates: string[];
  candidates: Candidate[];
  stats: { total: number; purge: number; retain: number; categories: Record<string, number> };
  ptMapping: { id: string; executableTarget: string; testFile: string };
};

const repositoryRoot = process.cwd();
const inventoryPath = path.join(repositoryRoot, '.arca/io/t-009-adjacent-residue.json');
const requiredRoots = ['.arca', 'standard', 'AGENTS.md'];
const forbiddenIdentity = new RegExp(['open', 'spec'].join(''), 'i');
const operationalRoots = ['package.json', 'tsconfig.json', 'vitest.config.ts', '.gitignore'];

async function readInventory(): Promise<RecordShape> {
  return JSON.parse(await fs.readFile(inventoryPath, 'utf8')) as RecordShape;
}

async function walkFiles(relativeRoot: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(relativePath: string): Promise<void> {
    const absolutePath = path.join(repositoryRoot, relativePath);
    for (const entry of await fs.readdir(absolutePath, { withFileTypes: true })) {
      const child = path.posix.join(relativePath, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (entry.isFile()) files.push(child);
    }
  }
  await walk(relativeRoot);
  return files;
}

describe('repository-audit PT-009', () => {
  it('records one evidence-backed decision for every pre-purge root candidate', async () => {
    const inventory = await readInventory();
    expect(inventory.ticket).toBe('t-009-adjacent-residue');
    expect(inventory.phase).toBe('P5');
    expect(inventory.status).toBe('complete');
    expect(inventory.candidates.length).toBe(inventory.stats.total);
    expect(inventory.stats.purge + inventory.stats.retain).toBe(inventory.stats.total);
    expect(new Set(inventory.candidates.map((candidate) => candidate.path)).size).toBe(
      inventory.candidates.length,
    );
    expect(inventory.observedRootCandidates.length).toBeGreaterThan(0);
    expect(
      inventory.observedRootCandidates.every((root) =>
        inventory.candidates.some((candidate) => candidate.path === root),
      ),
    ).toBe(true);
    for (const candidate of inventory.candidates) {
      expect(['purge', 'retain']).toContain(candidate.decision);
      expect(candidate.category).not.toBe('');
      expect(candidate.evidence).not.toBe('');
      expect(candidate.rationale).not.toBe('');
    }
    expect(inventory.stats.categories).toEqual(
      expect.objectContaining({ identity: expect.any(Number), assets: expect.any(Number), tooling: expect.any(Number), configuration: expect.any(Number), integrations: expect.any(Number), documentation: expect.any(Number), source: expect.any(Number), tests: expect.any(Number), schemas: expect.any(Number) }),
    );
  });

  it('has removed purged candidates and preserves only evidenced governance/support roots', async () => {
    const inventory = await readInventory();
    for (const candidate of inventory.candidates) {
      if (candidate.decision === 'purge') {
        await expect(fs.lstat(path.join(repositoryRoot, candidate.path))).rejects.toMatchObject({ code: 'ENOENT' });
      }
    }
    for (const root of requiredRoots) {
      await expect(fs.lstat(path.join(repositoryRoot, root))).resolves.toBeDefined();
    }
    for (const retained of inventory.candidates.filter((candidate) => candidate.decision === 'retain')) {
      await expect(fs.lstat(path.join(repositoryRoot, retained.path))).resolves.toBeDefined();
    }
  });

  it('maps PT-009 and leaves no operational upstream identity in retained non-test surfaces', async () => {
    const inventory = await readInventory();
    expect(inventory.ptMapping).toEqual({
      id: 'PT-009',
      goalContractRef: '.arca/goal/spec.md#integrated-issue-requirements (US-10)',
      executableTarget: 'repository-audit PT-009',
      testFile: 'test/adjacent-residue.test.ts',
    });
    const offenders: string[] = [];
    for (const relativePath of operationalRoots) {
      const content = await fs.readFile(path.join(repositoryRoot, relativePath), 'utf8');
      if (forbiddenIdentity.test(content)) offenders.push(relativePath);
    }
    for (const relativePath of await walkFiles('standard')) {
      const content = await fs.readFile(path.join(repositoryRoot, relativePath), 'utf8');
      if (forbiddenIdentity.test(content)) offenders.push(relativePath);
    }
    expect(offenders).toEqual([]);
  });
});
