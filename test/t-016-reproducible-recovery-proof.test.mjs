import { test } from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidencePath = path.join(root, '.arca', 'io', 't-016-reproducible-recovery-proof.json');
const baseline = '84741704290c547d64605699d697612ac03731bf';
const planningParent = 'dd3fe7053bfee91ad9616367dd2c314ab2bf131f';
const frozenGoalHash = '86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021';
const goalFiles = ['index.md', 'ubi-lang.md', 'spec.md', 'design.md', 'test-list.md'];
const purgeBoundaries = ['website/', 'openspec/'];
const requiredCommands = [
  'corepack pnpm install --frozen-lockfile',
  'corepack pnpm run build',
  'corepack pnpm exec tsc --noEmit',
  'node --test test/t-012-cli-runtime-recovery.test.mjs test/t-013-package-build-closure.test.mjs test/t-014-direct-support-closure.test.mjs test/t-015-purge-preservation.test.mjs test/t-016-reproducible-recovery-proof.test.mjs',
  'corepack pnpm test',
  'node bin/openspec.js --help',
  'node bin/openspec.js --version',
  'node bin/openspec.js schemas',
  'node bin/openspec.js templates',
];

function readEvidence() {
  assert.equal(existsSync(evidencePath), true, 'PT-016 proof must be published before runtime proof');
  return JSON.parse(readFileSync(evidencePath, 'utf8'));
}

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function frozenGoalDigest() {
  const hash = createHash('sha256');
  for (const name of goalFiles) {
    hash.update(`${name}\0`);
    hash.update(readFileSync(path.join(root, '.arca', 'goal', name)));
  }
  return hash.digest('hex');
}

function lineEndingAttributes() {
  return git('check-attr', 'eol', '--', '.arca/goal/spec.md', 'src/cli/index.ts');
}

function candidateMap(evidence) {
  const candidates = [...(evidence.inventory?.restored ?? []), ...(evidence.inventory?.excluded ?? [])];
  assert.ok(candidates.length > 0, 'restored/excluded inventory must not be empty');
  const paths = candidates.map((candidate) => candidate.path);
  assert.equal(new Set(paths).size, paths.length, 'each inspected candidate must occur exactly once');
  for (const candidate of candidates) {
    assert.match(candidate.path, /^(?:[^/]+\/)*[^/]+\/?$/);
    assert.ok(['restored', 'excluded'].includes(candidate.decision));
    assert.equal(typeof candidate.reason, 'string');
    assert.ok(candidate.reason.length > 0);
    assert.equal(typeof candidate.evidence, 'string');
    assert.ok(candidate.evidence.length > 0);
  }
  return new Map(candidates.map((candidate) => [candidate.path, candidate]));
}

test('PT-016 proof is machine-readable and gated after the intentional red run', () => {
  const evidence = readEvidence();
  assert.equal(evidence.ticket, 't-016-reproducible-recovery-proof');
  assert.equal(evidence.pt, 'PT-016');
  assert.equal(evidence.phase, 'P5');
  assert.equal(evidence.status, 'complete');
  assert.equal(evidence.verification?.p4Red?.status, 'failed-as-intended');
  assert.match(evidence.verification.p4Red.command, /t-016-reproducible-recovery-proof/);
  assert.equal(evidence.verification?.p5Green?.status, 'passed');
});

test('PT-016 records frozen provenance, goal bytes, and a linear recovery chain', () => {
  const evidence = readEvidence();
  assert.equal(evidence.provenance?.baselineCommit, baseline);
  assert.equal(evidence.provenance?.planningParent, planningParent);
  assert.equal(frozenGoalDigest(), frozenGoalHash);
  assert.equal(lineEndingAttributes(), '.arca/goal/spec.md: eol: lf\nsrc/cli/index.ts: eol: lf');
  assert.equal(evidence.frozenGoal?.bundleSha256, frozenGoalHash);
  assert.deepEqual(evidence.frozenGoal?.files, goalFiles);
  assert.equal(evidence.provenance?.topology, 'single-parent linear recovery chain');
  assert.equal(evidence.provenance?.rewriteDetected, false);
  assert.equal(evidence.provenance?.broadRevertOrResetDetected, false);
  assert.ok(Array.isArray(evidence.provenance?.recoveryCommits));
  assert.ok(evidence.provenance.recoveryCommits.length >= 5);
  const restoreCommands = evidence.provenance?.restoreCommands;
  assert.equal(Array.isArray(restoreCommands), true);
  assert.deepEqual(restoreCommands.map((entry) => entry.order), [1, 2, 3, 4]);
  for (const entry of restoreCommands) {
    assert.match(entry.command, /^git restore --source=84741704290c547d64605699d697612ac03731bf --/);
    assert.equal(entry.decision, 'restored');
    assert.equal(typeof entry.scope, 'string');
    assert.ok(entry.scope.length > 0);
  }
});

test('PT-016 inventories every inspected candidate with explicit restored and excluded decisions', () => {
  const evidence = readEvidence();
  const candidates = candidateMap(evidence);
  assert.equal(evidence.inventory.inspected, candidates.size);
  assert.equal(evidence.inventory.restoredCount, evidence.inventory.restored.length);
  assert.equal(evidence.inventory.excludedCount, evidence.inventory.excluded.length);
  assert.equal(candidates.get('bin/openspec.js')?.decision, 'restored');
  assert.equal(candidates.get('schemas/spec-driven/schema.yaml')?.decision, 'restored');
  assert.equal(candidates.get('website/')?.decision, 'excluded');
  assert.equal(candidates.get('openspec/')?.decision, 'excluded');
  for (const boundary of purgeBoundaries) assert.equal(candidates.get(boundary)?.decision, 'excluded');
});

test('PT-016 proves package and source import closure without stale generated state', () => {
  const evidence = readEvidence();
  assert.equal(evidence.packageClosure?.sourceModuleCount, 167);
  assert.equal(evidence.packageClosure?.externalRuntimeDependencyCount, 10);
  assert.equal(evidence.packageClosure?.manifestMatchesLockImporter, true);
  assert.equal(evidence.packageClosure?.distBeforeBuild, 'absent');
  assert.equal(evidence.packageClosure?.nodeModulesBeforeInstall, 'absent');
  assert.equal(evidence.packageClosure?.generatedArtifactsCleaned, true);
  assert.equal(evidence.packageClosure?.sourceImportClosure, 'complete');
});

test('PT-016 records exact clean-checkout commands, versions, results, and test counts', () => {
  const evidence = readEvidence();
  const clean = evidence.cleanCheckout;
  assert.match(clean.method, /repository-enforced LF checkout/);
  assert.doesNotMatch(clean.method, /core\.autocrlf/);
  assert.equal(clean?.isolated, true);
  assert.equal(clean?.temporaryDirectoryCleaned, true);
  assert.equal(clean?.candidateTree, 'HEAD^{tree}');
  assert.deepEqual(clean?.commands.map((entry) => entry.command), requiredCommands);
  for (const entry of clean.commands) {
    assert.equal(entry.status, 'passed');
    assert.equal(typeof entry.result, 'string');
    assert.ok(entry.result.length > 0);
  }
  assert.match(clean.versions.node, /^v\d+\.\d+\.\d+$/);
  assert.match(clean.versions.pnpm, /^\d+\.\d+\.\d+$/);
  assert.equal(clean.tests.pt012To016.status, 'passed');
  assert.equal(clean.tests.package.status, 'passed');
  assert.equal(clean.tests.pt012To016.count, 22);
  assert.equal(clean.tests.package.files, 6);
  assert.equal(clean.tests.package.passed, 23);
  assert.equal(clean.tests.package.skipped, 0);
});

test('PT-016 records side-effect-safe CLI traces and isolated init/validate behavior', () => {
  const evidence = readEvidence();
  const cli = evidence.cli;
  assert.deepEqual(cli.commands.map((entry) => entry.command), requiredCommands.slice(5));
  assert.equal(cli.help.status, 'passed');
  assert.match(cli.help.stdout, /Usage: openspec/);
  assert.equal(cli.version.stdout, '0.1.0');
  assert.equal(cli.schemas.status, 'passed');
  assert.equal(cli.templates.status, 'passed');
  assert.equal(cli.init.status, 'passed');
  assert.equal(cli.validate.status, 'passed');
  assert.equal(cli.init.rootSideEffects, false);
  assert.equal(cli.validate.rootSideEffects, false);
  assert.equal(cli.temporaryDirectoriesCleaned, true);
});

test('PT-016 preserves hard purge boundaries and verifies clean generated state', () => {
  const evidence = readEvidence();
  assert.equal(evidence.purge?.website, 'absent');
  assert.equal(evidence.purge?.openspec, 'absent');
  assert.equal(existsSync(path.join(root, 'website')), false);
  assert.equal(existsSync(path.join(root, 'openspec')), false);
  assert.equal(evidence.purge?.rootSideEffectsAfterReadOnlyChecks, false);
});

test('PT-016 records final P2 one-to-one residual reconciliation and Idle state', () => {
  const evidence = readEvidence();
  const residuals = evidence.gapRecheck?.residuals;
  assert.equal(evidence.gapRecheck?.status, 'complete');
  assert.equal(residuals.length, 17);
  assert.equal(new Set(residuals.map((row) => row.us)).size, 17);
  for (const row of residuals) {
    assert.match(row.us, /^US-\d{2}$/);
    assert.equal(row.status, 'satisfied');
    assert.equal(typeof row.proof, 'string');
    assert.ok(row.proof.length > 0);
  }
  assert.equal(evidence.state?.phase, 'Idle');
  assert.equal(evidence.state?.status, 'idle');
  assert.equal(evidence.state?.waitingOn, '');
  assert.deepEqual(evidence.state?.activeRefs, []);
});
