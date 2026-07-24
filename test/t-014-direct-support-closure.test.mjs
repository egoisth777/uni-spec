import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidencePath = path.join(root, '.arca', 'io', 't-014-direct-support-closure.json');
const baseline = '84741704290c547d64605699d697612ac03731bf';
const requiredAssets = [
  'schemas/spec-driven/schema.yaml',
  'schemas/spec-driven/templates/design.md',
  'schemas/spec-driven/templates/proposal.md',
  'schemas/spec-driven/templates/spec.md',
  'schemas/spec-driven/templates/tasks.md',
];

function readEvidence() {
  assert.equal(existsSync(evidencePath), true, 'PT-014 closure evidence must be published');
  return JSON.parse(readFileSync(evidencePath, 'utf8'));
}

function candidateMap(evidence) {
  const candidates = [...(evidence.restored ?? []), ...(evidence.excluded ?? [])];
  assert.ok(candidates.length > 0, 'candidate inventory must not be empty');
  const paths = candidates.map((candidate) => candidate.path);
  assert.equal(new Set(paths).size, paths.length, 'each candidate path must occur exactly once');
  for (const candidate of candidates) {
    assert.equal(typeof candidate.path, 'string');
    assert.ok(candidate.path.length > 0);
    assert.equal(typeof candidate.decision, 'string');
    assert.equal(typeof candidate.reason, 'string');
    assert.ok(candidate.reason.length > 10);
    assert.equal(typeof candidate.evidence, 'string');
    assert.ok(candidate.evidence.length > 10);
    assert.equal(typeof candidate.source, 'string');
    assert.equal(candidate.baseline, baseline);
  }
  return new Map(candidates.map((candidate) => [candidate.path, candidate]));
}

test('PT-014 closure evidence is machine-readable before runtime checks', () => {
  const evidence = readEvidence();
  assert.equal(evidence.ticket, 't-014-direct-support-closure');
  assert.equal(evidence.pt, 'PT-014');
});

test('PT-014 manifest records direct provenance for restored and excluded candidates', () => {
  const evidence = readEvidence();
  assert.equal(evidence.ticket, 't-014-direct-support-closure');
  assert.equal(evidence.pt, 'PT-014');
  assert.equal(evidence.baseline.commit, baseline);
  const candidates = candidateMap(evidence);
  for (const asset of requiredAssets) {
    assert.equal(candidates.get(asset)?.decision, 'restored', `${asset} must be directly restored`);
    assert.equal(existsSync(path.join(root, asset)), true, `${asset} must exist`);
  }
  assert.ok([...candidates.values()].some((candidate) => candidate.path === 'docs/cli.md' && candidate.decision === 'excluded'));
  assert.ok([...candidates.values()].some((candidate) => candidate.path === 'website/' && candidate.decision === 'excluded'));
  assert.ok([...candidates.values()].some((candidate) => candidate.path === 'openspec/' && candidate.decision === 'excluded'));
  assert.equal(evidence.counts.restored, evidence.restored.length);
  assert.equal(evidence.counts.excluded, evidence.excluded.length);
});

test('PT-014 schemas and templates commands resolve the recovered package contract', () => {
  const evidence = readEvidence();
  assert.equal(evidence.runtimeEdge.commands.schemas, 'direct package schema lookup');
  assert.equal(evidence.runtimeEdge.commands.templates, 'direct package schema and template lookup');
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t014-'));
  const env = { ...process.env, NO_COLOR: '1' };
  const schemas = execFileSync(process.execPath, [path.join(root, 'bin/openspec.js'), 'schemas', '--json'], {
    cwd: tempDir,
    env,
    encoding: 'utf8',
  });
  const schemaJson = JSON.parse(schemas);
  assert.ok(schemaJson.some((schema) => schema.name === 'spec-driven'));
  const templates = execFileSync(process.execPath, [path.join(root, 'bin/openspec.js'), 'templates', '--json'], {
    cwd: tempDir,
    env,
    encoding: 'utf8',
  });
  const templateJson = JSON.parse(templates);
  assert.deepEqual(Object.keys(templateJson).sort(), ['design', 'proposal', 'specs', 'tasks']);
});

test('PT-014 init and validate remain side-effect-safe in an isolated temporary project', () => {
  const evidence = readEvidence();
  assert.equal(evidence.runtimeEdge.commands.init, 'isolated temporary project setup');
  assert.equal(evidence.runtimeEdge.commands.validate, 'isolated temporary project validation');
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t014-init-'));
  try {
    const env = { ...process.env, NO_COLOR: '1' };
    const bin = path.join(root, 'bin/openspec.js');
    const init = execFileSync(process.execPath, [bin, 'init', '.', '--tools', 'none'], {
      cwd: tempDir,
      env,
      encoding: 'utf8',
    });
    assert.match(init, /Setup Complete/);
    assert.equal(existsSync(path.join(tempDir, 'openspec', 'config.yaml')), true);
    const validation = JSON.parse(execFileSync(process.execPath, [bin, 'validate', '--all', '--json'], {
      cwd: tempDir,
      env,
      encoding: 'utf8',
    }));
    assert.equal(validation.summary.totals.failed, 0);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('PT-014 preserves purge boundaries while allowing isolated openspec fixture names', () => {
  const evidence = readEvidence();
  assert.equal(existsSync(path.join(root, 'website')), false);
  assert.equal(existsSync(path.join(root, 'openspec')), false);
  assert.equal(evidence.purge.website, 'absent');
  assert.equal(evidence.purge.openspec, 'absent');
  assert.ok((evidence.runtimeEdge.tempDirectorySafety ?? '').includes('isolated'));
});
