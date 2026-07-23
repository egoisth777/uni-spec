import { promises as fs } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = process.cwd();


describe('repository-audit PT-007', () => {
  it('removes the audited website residue while preserving required routes', async () => {
    await expect(
      fs.access(path.join(repositoryRoot, 'website')),
      'confirmed website residue must be absent',
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      fs.access(path.join(repositoryRoot, 'standard')),
      'the normative standard route must remain reachable',
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(repositoryRoot, '.arca')),
      'the governance route must remain reachable',
    ).resolves.toBeUndefined();
  });
});
