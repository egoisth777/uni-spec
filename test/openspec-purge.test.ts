import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = process.cwd();
const namedCandidates = [
  'openspec',
  'openspec/work',
  'openspec/specs',
  'openspec/explorations',
  'openspec/initiatives',
  'openspec/changes',
  'openspec/config.yaml',
  'work',
  'specs',
  'explorations',
  'initiatives',
  'changes',
  'config.yaml',
] as const;

async function existingCandidates(): Promise<string[]> {
  const results = await Promise.all(
    namedCandidates.map(async (relativePath) => {
      try {
        await fs.lstat(path.join(repositoryRoot, relativePath));
        return relativePath;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    }),
  );
  return results.filter((candidate): candidate is string => candidate !== null);
}

async function standardReferencesToCandidates(): Promise<string[]> {
  const references: string[] = [];
  const candidatePattern = /(?:^|[\\s`"'(])((?:openspec\/)?(?:work|specs|explorations|initiatives|changes)(?:\/|[\\s`"')]|$)|(?:openspec\/)?config\.yaml)/i;

  async function walk(directory: string): Promise<void> {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = await fs.readFile(absolutePath, 'utf8');
        if (candidatePattern.test(content)) {
          references.push(path.relative(repositoryRoot, absolutePath).split(path.sep).join('/'));
        }
      }
    }
  }

  await walk(path.join(repositoryRoot, 'standard'));
  return references;
}

describe('repository-audit PT-008', () => {
  it('removes every named OpenSpec workflow candidate while preserving authority routes', async () => {
    await expect(existingCandidates(), 'confirmed upstream workflow residue must be absent').resolves.toEqual([]);
    await expect(
      fs.access(path.join(repositoryRoot, '.arca')),
      'the governance route must remain reachable',
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(repositoryRoot, 'standard')),
      'the normative standard route must remain reachable',
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(repositoryRoot, 'AGENTS.md')),
      'the repository instruction route must remain reachable',
    ).resolves.toBeUndefined();
  });

  it('leaves no retained standard dependency pointing at a named candidate', async () => {
    await expect(standardReferencesToCandidates(), 'retained standard must not depend on purged workflow paths').resolves.toEqual([]);
  });
});
