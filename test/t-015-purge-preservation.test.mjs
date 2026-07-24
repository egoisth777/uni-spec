import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidencePath = path.join(root, '.arca', 'io', 't-015-purge-preservation.json');
const planningCommit = '1c4d1fe516482adc1b550be0c364be32aeeb3298';
const planningParent = 'dd3fe7053bfee91ad9616367dd2c314ab2bf131f';
const recoveryCutoff = '36026f06cd0f0f3be89cd140a3944c525a92562d';
const frozenGoalHash = '86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021';
const goalFiles = ['index.md', 'ubi-lang.md', 'spec.md', 'design.md', 'test-list.md'];
const retainedRoots = [
  '.arca', '.gitignore', 'AGENTS.md', 'bin', 'build.js', 'package.json',
  'pnpm-lock.yaml', 'schemas', 'src', 'standard', 'test', 'tsconfig.json', 'vitest.config.ts',
];
const forbiddenRoots = [
  'website', 'openspec', 'docs', 'assets', '.github', '.devcontainer', '.changeset',
  '.agents', '.actrc', '.coderabbit.yaml', 'CHANGELOG.md', 'LICENSE', 'MAINTAINERS.md',
  'README.md', 'README_OLD.md', 'openspec-parallel-merge-plan.md', 'scripts',
  'eslint.config.js', 'flake.lock', 'flake.nix', 'vitest.setup.ts',
];
const provenance = [
  ['a737ad4af3a7ccac01c5472596fea4587d887c5f', 'Recover CLI runtime'],
  ['0927ed0feb38a6371dac2c11b5ab59c440152c4d', 'Review t-012 recovery evidence'],
  ['8628cc1a682ad669c7c08e35e0a07b8df31047dc', 'Clarify t-012 whitespace evidence'],
  ['cd84f85a186ecc984efde98a078b18dadb8325e5', 'Recover CLI package closure'],
  ['d81a26fd57d4893dd01010c208b3114d6e6c486d', 'Recover direct CLI support'],
  [recoveryCutoff, 'test: clean up PT-014 temporary directories'],
];

function readEvidence() {
  assert.equal(existsSync(evidencePath), true, 'PT-015 preservation evidence must be published');
  return JSON.parse(readFileSync(evidencePath, 'utf8'));
}

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function trackedRoots(commit) {
  return git('ls-tree', '--name-only', commit).split('\n').filter(Boolean).sort();
}

function changedPaths(from, to) {
  return git('diff', '--name-only', from, to).split('\n').filter(Boolean).sort();
}
function addedPaths(from, to) {
  return git('diff', '--diff-filter=A', '--name-only', from, to).split('\n').filter(Boolean).sort();
}


function frozenGoalDigest() {
  const hash = createHash('sha256');
  for (const name of goalFiles) {
    hash.update(`${name}\0`);
    hash.update(readFileSync(path.join(root, '.arca', 'goal', name)));
  }
  return hash.digest('hex');
}

test('PT-015 preservation evidence is machine-readable before filesystem proof', () => {
  const evidence = readEvidence();
  assert.equal(evidence.ticket, 't-015-purge-preservation');
  assert.equal(evidence.pt, 'PT-015');
  assert.equal(evidence.phase, 'P5');
  assert.equal(evidence.status, 'complete');
});

test('PT-015 inventories exact retained roots and additions since the recovery plan', () => {
  const evidence = readEvidence();
  const inventory = evidence.inventory;
  assert.deepEqual(inventory.retainedRoots, retainedRoots);
  assert.deepEqual(inventory.baselineRoots, trackedRoots(planningCommit));
  assert.deepEqual(inventory.currentRoots, trackedRoots(recoveryCutoff));
  assert.deepEqual(inventory.prePlanningRoots, trackedRoots(planningParent));
  assert.deepEqual(inventory.planningRoots, trackedRoots(planningCommit));
  assert.deepEqual(inventory.planningAddedPaths, addedPaths(planningParent, planningCommit));
  assert.deepEqual(inventory.addedPaths, addedPaths(planningCommit, recoveryCutoff).filter((entry) => !entry.startsWith('.arca/goal/')));
  assert.deepEqual(inventory.changedPaths, changedPaths(planningCommit, recoveryCutoff).filter((entry) => !entry.startsWith('.arca/goal/')));
  assert.deepEqual(inventory.forbiddenRoots, forbiddenRoots);
  for (const rootName of retainedRoots) assert.ok(inventory.currentRoots.includes(rootName), `${rootName} must be retained`);
  for (const rootName of forbiddenRoots) assert.equal(inventory.currentRoots.includes(rootName), false, `${rootName} must remain purged`);
  assert.equal(inventory.website, 'absent');
  assert.equal(inventory.openspec, 'absent');
});

test('PT-015 proves every recovered commit is linear, intentional, and non-rewriting', () => {
  const evidence = readEvidence();
  assert.equal(evidence.history.planningCommit, planningCommit);
  assert.equal(evidence.history.planningParent, planningParent);
  assert.equal(evidence.history.recoveryCutoff, recoveryCutoff);
  assert.deepEqual(evidence.history.recoveryCommits.map(({ sha, subject }) => [sha, subject]), provenance);
  assert.equal(evidence.history.topology, 'single-parent linear recovery chain');
  assert.equal(evidence.history.rewriteDetected, false);
  assert.equal(evidence.history.broadRevertOrResetDetected, false);
  assert.deepEqual(git('rev-list', '--parents', '--reverse', `${planningCommit}..${recoveryCutoff}`).split('\n').map((line) => line.split(' ')[0]), provenance.map(([sha]) => sha));
  for (const [sha, subject] of provenance) {
    assert.equal(git('show', '-s', '--format=%s', sha), subject);
    assert.equal(git('show', '-s', '--format=%P', sha).split(' ').length, 1, `${sha} must have one parent`);
  }
  assert.equal(git('log', '--format=%s', `${planningParent}..${recoveryCutoff}`).split('\n').some((subject) => /^(revert|reset|rewrite)\b/i.test(subject)), false);
});

test('PT-015 freezes the goal bytes and preserves every authority/history route', () => {
  const evidence = readEvidence();
  assert.deepEqual(evidence.frozenGoal, {
    planningParent,
    planningCommit,
    revision: planningParent,
    sha256: frozenGoalHash,
    files: goalFiles,
  });
  assert.equal(frozenGoalDigest(), frozenGoalHash);
  assert.equal(git('diff', '--quiet', planningCommit, recoveryCutoff, '--', '.arca/goal'), '');
  assert.deepEqual(evidence.retained.arca.issuePaths, [
    '.arca/issue/i-002-selective-cli-recovery/index.md',
    '.arca/issue/i-002-selective-cli-recovery/ubi-lang.md',
    '.arca/issue/i-002-selective-cli-recovery/spec.md',
    '.arca/issue/i-002-selective-cli-recovery/design.md',
    '.arca/issue/i-002-selective-cli-recovery/test-plan.md',
  ]);
  assert.equal(evidence.retained.arca.residualCount, 17);
  assert.equal(evidence.retained.arca.ticketCount, 16);
  assert.equal(readdirSync(path.join(root, '.arca', 'residual')).filter((entry) => entry.endsWith('.md')).length, evidence.retained.arca.residualCount);
  assert.equal(readdirSync(path.join(root, '.arca', 'ticket')).filter((entry) => entry.endsWith('.md')).length, evidence.retained.arca.ticketCount);
  for (const issuePath of evidence.retained.arca.issuePaths) assert.equal(existsSync(path.join(root, issuePath)), true, `${issuePath} must remain reachable`);
  assert.deepEqual(evidence.retained.standard.frontDoorRoutes, [
    'standard/index.md', 'standard/issue-format.md', 'standard/conversion.md', 'standard/lint.md',
  ]);
  assert.equal(evidence.retained.agents.route, '.arca/index.md');
  assert.match(readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), /\.arca\/index\.md/);
  for (const route of evidence.retained.standard.frontDoorRoutes) assert.equal(existsSync(path.join(root, route)), true, `${route} must exist`);
  assert.match(readFileSync(path.join(root, 'standard/index.md'), 'utf8'), /normative authority.*companion/i);
  assert.match(readFileSync(path.join(root, 'standard/issue-format.md'), 'utf8'), /exactly one directory with exactly five regular files/i);
  assert.match(readFileSync(path.join(root, 'standard/conversion.md'), 'utf8'), /deterministic/i);
  assert.match(readFileSync(path.join(root, 'standard/lint.md'), 'utf8'), /LINT-01[\s\S]*LINT-07/);
});

test('PT-015 proves append-only current state and excludes unapproved artifacts without false-positive CLI checks', () => {
  const evidence = readEvidence();
  const state = evidence.state;
  assert.deepEqual(state.files, ['.arca/current/current.md', '.arca/current/log.md']);
  assert.equal(state.log.mode, 'append-only');
  assert.equal(state.log.baselineLineCount < state.log.currentLineCount, true);
  assert.equal(state.log.appendedLineCount, state.log.currentLineCount - state.log.baselineLineCount);
  assert.equal(state.log.appendedLineCount, evidence.logAppendedLines.length);
  assert.ok(evidence.logAppendedLines.every((line) => line.startsWith('- 2026-07-23 - Phase')));
  assert.equal(evidence.exclusions.intentionalCliIdentityAllowed, true);
  assert.equal(evidence.exclusions.temporaryProjectFixtureAllowed, true);
  assert.deepEqual(evidence.exclusions.unapprovedArtifacts, forbiddenRoots.filter((entry) => !['website', 'openspec'].includes(entry)));
  for (const candidate of evidence.exclusions.unapprovedArtifacts) assert.equal(existsSync(path.join(root, candidate)), false, `${candidate} must be absent`);
  assert.equal(existsSync(path.join(root, 'website')), false);
  assert.equal(existsSync(path.join(root, 'openspec')), false);
  assert.match(evidence.exclusions.identityNote, /openspec command|CLI/i);
  assert.match(evidence.exclusions.fixtureNote, /temporary/i);
});

test('PT-015 hole-pokes standard content, retained history, and root-only purge boundaries', () => {
  const evidence = readEvidence();
  assert.equal(evidence.holePokes.length >= 6, true);
  assert.ok(evidence.holePokes.some((entry) => /nested|tree/i.test(entry)));
  assert.ok(evidence.holePokes.some((entry) => /history|revert|reset/i.test(entry)));
  assert.ok(evidence.holePokes.some((entry) => /CLI|identity|fixture/i.test(entry)));
  assert.equal(evidence.routes.issueFrontDoor, 'reachable');
  assert.equal(evidence.routes.standardFrontDoor, 'reachable');
  assert.equal(evidence.routes.currentState, 'append-only');
  assert.equal(evidence.routes.frozenGoal, 'byte-and-hash-verified');
});
