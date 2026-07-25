/**
 * PT-019 — ticket t-019-terminal-archive-sweep.
 *
 * Goal contract: `.arca/goal/spec.md#integrated-repository-wide-terminal-archive-requirement` (`US-20`)
 * and `.arca/goal/test-list.md#verification` (`T-020`).
 *
 * The completion lifecycle selects records by terminal status alone across every collection and
 * loop, so each live collection directly holds only nonterminal or `active_refs` records plus its
 * reserved `archive/`, every relocated record is preserved at exactly one location with repaired
 * links, and a repeated sweep is a strict no-op.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync,
  renameSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const collections = [
  { kind: 'issue', live: '.arca/issue', archive: '.arca/issue/archive', terminal: ['integrated', 'rejected'] },
  { kind: 'residual', live: '.arca/residual', archive: '.arca/residual/archive', terminal: ['satisfied'] },
  { kind: 'ticket', live: '.arca/ticket', archive: '.arca/ticket/archive', terminal: ['done'] },
];
const legacyIssues = ['i-001-purge-sanitization', 'i-002-selective-cli-recovery'];
const legacyResiduals = Array.from({ length: 17 }, (unused, index) => `residual-us-${String(index + 1).padStart(2, '0')}.md`);
const legacyTicketCount = 16;
const retainedRecoveryIssueFiles = ['index.md', 'ubi-lang.md', 'spec.md', 'design.md', 'test-plan.md']
  .map((file) => `.arca/issue/i-002-selective-cli-recovery/${file}`);

const slash = (value) => value.replaceAll(path.sep, '/');
const at = (root, repositoryPath) => path.join(root, ...repositoryPath.split('/'));
const read = (root, repositoryPath) => readFileSync(at(root, repositoryPath), 'utf8');
const write = (root, repositoryPath, content) => {
  mkdirSync(path.dirname(at(root, repositoryPath)), { recursive: true });
  writeFileSync(at(root, repositoryPath), content);
};

function filesBelow(root, repositoryPath = '') {
  const absolute = repositoryPath ? at(root, repositoryPath) : root;
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = repositoryPath ? `${repositoryPath}/${entry.name}` : entry.name;
    return entry.isDirectory() ? filesBelow(root, child) : [child];
  }).sort();
}

function treeDigest(root, repositoryPath = '.arca') {
  const digest = createHash('sha256');
  for (const file of filesBelow(root, repositoryPath)) {
    digest.update(Buffer.from(file, 'utf8'));
    digest.update(Buffer.from([0]));
    digest.update(readFileSync(at(root, file)));
    digest.update(Buffer.from([0]));
  }
  return digest.digest('hex');
}

/** Record status: an issue directory carries it in `index.md`, a residual/ticket file in its own body. */
function recordStatus(root, repositoryPath) {
  const target = at(root, repositoryPath);
  const body = statSync(target).isDirectory()
    ? read(root, `${repositoryPath}/index.md`)
    : read(root, repositoryPath);
  return body.match(/^status:\s*["']?([a-z]+)["']?\s*$/m)?.[1] ?? '';
}

/** Every direct child record of a collection, excluding the reserved archive. */
function liveRecords(root, collection) {
  const directory = at(root, collection.live);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => (collection.kind === 'issue' ? entry.isDirectory() : entry.isFile() && entry.name.endsWith('.md')))
    .filter((entry) => entry.name !== 'archive')
    .map((entry) => `${collection.live}/${entry.name}`)
    .sort();
}

/** Every archived record of a collection, at any archive depth. */
function archivedRecords(root, collection) {
  if (!existsSync(at(root, collection.archive))) return [];
  const descendants = filesBelow(root, collection.archive);
  if (collection.kind === 'issue') {
    return descendants
      .filter((file) => file.endsWith('/index.md'))
      .map((file) => file.slice(0, -'/index.md'.length))
      .sort();
  }
  return descendants.filter((file) => file.endsWith('.md')).sort();
}

function activeRefs(root) {
  const current = read(root, '.arca/current/current.md');
  const raw = current.match(/^active_refs:\s*\[(.*)\]\s*$/m)?.[1] ?? '';
  return [...raw.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

/** Location-independent preservation: a record is retained live or archived, never neither or both. */
function resolveRecord(root, repositoryPath) {
  const segments = repositoryPath.split('/');
  const collection = collections.find((entry) => repositoryPath.startsWith(`${entry.live}/`));
  assert.ok(collection, `${repositoryPath} must belong to a governed collection`);
  const tail = repositoryPath.slice(collection.live.length + 1);
  const marker = `/${tail}`;
  const archived = [...new Set(filesBelow(root, collection.archive).flatMap((file) => {
    if (file.endsWith(marker)) return [file];
    const boundary = file.indexOf(`${marker}/`);
    return boundary === -1 ? [] : [file.slice(0, boundary + marker.length)];
  }))];
  const liveExists = existsSync(at(root, repositoryPath));
  assert.ok(archived.length < 2, `${segments.at(-1)} must be archived at exactly one depth`);
  assert.notEqual(liveExists, archived.length === 1, `${segments.at(-1)} must be preserved at exactly one location`);
  return liveExists ? repositoryPath : archived[0];
}

function localMarkdownTargets(text) {
  return [...text.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^<|>$/g, ''))
    .filter((target) => !/^(?:https?:|mailto:)/i.test(target));
}

function assertMarkdownLinksResolve(root, scope = '.arca') {
  for (const source of filesBelow(root, scope).filter((file) => file.endsWith('.md'))) {
    const sourceText = read(root, source);
    for (const rawTarget of localMarkdownTargets(sourceText)) {
      const [rawFile, rawFragment = ''] = rawTarget.split('#', 2);
      if (!rawFile && !rawFragment) continue;
      if (source.startsWith('.arca/tpl/') && /(?:\{\{|<)[^}>]+(?:}}|>)/.test(rawTarget)) continue;
      const destination = rawFile
        ? path.resolve(path.dirname(at(root, source)), decodeURIComponent(rawFile))
        : at(root, source);
      assert.ok(existsSync(destination), `${source} link ${rawTarget} must resolve`);
      if (!rawFragment || !statSync(destination).isFile()) continue;
      const headings = readFileSync(destination, 'utf8')
        .split(/\r?\n/)
        .filter((line) => /^#{1,6}\s+/.test(line))
        .map((line) => line.replace(/^#{1,6}\s+/, '').toLowerCase()
          .replace(/<[^>]+>/g, '').replace(/[`*_]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '')
          .trim().replace(/\s+/g, '-'));
      assert.ok(headings.includes(decodeURIComponent(rawFragment).toLowerCase()), `${source} link ${rawTarget} heading must resolve`);
    }
  }
}

/** The sweep plan: every terminal record in every collection, minus records named by `active_refs`. */
function planSweep(root) {
  const protectedRefs = activeRefs(root);
  const plan = [];
  for (const collection of collections) {
    for (const source of liveRecords(root, collection)) {
      const name = source.slice(collection.live.length + 1);
      if (!collection.terminal.includes(recordStatus(root, source))) continue;
      if (protectedRefs.includes(name) || protectedRefs.includes(name.replace(/\.md$/, '')) || protectedRefs.includes(source)) continue;
      plan.push({ kind: collection.kind, name, source, destination: `${collection.archive}/${name}` });
    }
  }
  return plan.sort((left, right) => left.destination.localeCompare(right.destination));
}

function mapMovedPath(plan, repositoryPath) {
  for (const record of plan) {
    if (repositoryPath === record.source || repositoryPath.startsWith(`${record.source}/`)) {
      return record.destination + repositoryPath.slice(record.source.length);
    }
  }
  return repositoryPath;
}

function repairedMarkdown(root, plan, oldSource, finalSource) {
  return read(root, oldSource).replace(/(!?(?:\[[^\]]*\]))\(([^)]+)\)/g, (whole, label, rawTarget) => {
    const cleanTarget = rawTarget.trim().replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:|#)/i.test(cleanTarget)) return whole;
    const [rawFile, rawFragment] = cleanTarget.split('#', 2);
    if (!rawFile) return whole;
    const oldTarget = slash(path.relative(root, path.resolve(path.dirname(at(root, oldSource)), decodeURIComponent(rawFile))));
    let relativeTarget = slash(path.relative(path.dirname(finalSource), mapMovedPath(plan, oldTarget)));
    if (!relativeTarget.startsWith('.')) relativeTarget = `./${relativeTarget}`;
    return `${label}(${relativeTarget}${rawFragment ? `#${rawFragment}` : ''})`;
  });
}

/** One atomic, idempotent sweep: stage a full copy, move the plan, repair links, then swap. */
function applySweep(root) {
  const plan = planSweep(root);
  for (const record of plan) {
    assert.ok(!existsSync(at(root, record.destination)), `${record.name} must not already exist beneath its owning archive`);
  }
  if (plan.length === 0) return { moves: 0, logAppends: 0 };

  const stageParent = mkdtempSync(path.join(path.dirname(root), '.sweep-stage-'));
  const stage = path.join(stageParent, 'tree');
  cpSync(root, stage, { recursive: true });
  try {
    const markdown = filesBelow(stage, '.arca').filter((file) => file.endsWith('.md'));
    const rewrites = new Map(markdown.map((oldSource) => {
      const finalSource = mapMovedPath(plan, oldSource);
      return [finalSource, repairedMarkdown(stage, plan, oldSource, finalSource)];
    }));
    for (const record of plan) {
      mkdirSync(path.dirname(at(stage, record.destination)), { recursive: true });
      renameSync(at(stage, record.source), at(stage, record.destination));
    }
    for (const [destination, content] of rewrites) write(stage, destination, content);
    const log = read(stage, '.arca/current/log.md');
    write(stage, '.arca/current/log.md', `${log.trimEnd()}\n- sweep complete\n`);
    assertMarkdownLinksResolve(stage);

    const backup = `${root}.pre-sweep`;
    renameSync(root, backup);
    try {
      renameSync(stage, root);
      rmSync(backup, { recursive: true, force: true });
    } catch (error) {
      if (!existsSync(root)) renameSync(backup, root);
      throw error;
    }
    return { moves: plan.length, logAppends: 1 };
  } finally {
    rmSync(stageParent, { recursive: true, force: true });
  }
}

function issueDocument(id, status, links = '') {
  return `---\nissue-id: "${id}"\norigin: "fixture"\nstatus: "${status}"\n---\n\n# Issue ${id}\n\n${links}\n`;
}

function seedIssue(root, id, status, links = '') {
  write(root, `.arca/issue/${id}/index.md`, issueDocument(id, status, links));
  for (const file of ['ubi-lang.md', 'spec.md', 'design.md', 'test-plan.md']) {
    write(root, `.arca/issue/${id}/${file}`, `# ${file}\n\nFixture content.\n`);
  }
}

/** A repository holding finished records from two earlier loops plus this loop's active work. */
function seedFixture() {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t019-'));
  const root = path.join(parent, 'repository');
  mkdirSync(root);
  write(root, '.arca/goal/spec.md', '# Goal spec\n\n[Loop one issue](../issue/i-101-first-loop/index.md)\n[Loop two issue](../issue/i-102-second-loop/index.md)\n[Active issue](../issue/i-103-active-loop/index.md)\n');
  write(root, '.arca/current/current.md', 'phase: "P5"\nstatus: "running"\ngoal_revision: "fixture"\ninput_revision: "fixture"\noutput_revision: "fixture"\nactive_refs: ["i-103-active-loop", "t-103-active.md", "residual-us-103.md"]\nwaiting_on: ""\n');
  write(root, '.arca/current/log.md', '- fixture ready\n');
  write(root, '.arca/tpl/ticket.md', '# Template\n\n[Token]({{path/to/ticket}})\n');

  seedIssue(root, 'i-101-first-loop', 'integrated', '[Residual](../../residual/residual-us-101.md)\n[Ticket](../../ticket/t-101-first.md)');
  seedIssue(root, 'i-102-second-loop', 'rejected', '[Goal](../../goal/spec.md)');
  seedIssue(root, 'i-103-active-loop', 'integrated', '[Loop one](../i-101-first-loop/index.md)');
  seedIssue(root, 'i-104-pending', 'pending', '[Loop two](../i-102-second-loop/index.md)');
  write(root, '.arca/residual/residual-us-101.md', '# Residual 101\n\nstatus: "satisfied"\n\n[Issue](../issue/i-101-first-loop/index.md)\n[Ticket](../ticket/t-101-first.md)\n');
  write(root, '.arca/residual/residual-us-102.md', '# Residual 102\n\nstatus: "satisfied"\n\n[Goal](../goal/spec.md)\n');
  write(root, '.arca/residual/residual-us-103.md', '# Residual 103\n\nstatus: "satisfied"\n\n[Active issue](../issue/i-103-active-loop/index.md)\n');
  write(root, '.arca/residual/residual-us-104.md', '# Residual 104\n\nstatus: "partial"\n\n[Pending issue](../issue/i-104-pending/index.md)\n');
  write(root, '.arca/ticket/t-101-first.md', '# Ticket 101\n\nstatus: "done"\n\n[Residual](../residual/residual-us-101.md)\n');
  write(root, '.arca/ticket/t-102-second.md', '# Ticket 102\n\nstatus: "done"\n\n[Issue](../issue/i-102-second-loop/index.md)\n');
  write(root, '.arca/ticket/t-103-active.md', '# Ticket 103\n\nstatus: "approved"\n\n[Residual](../residual/residual-us-103.md)\n');

  // A prior maintainer grouped an older loop's archived records one level deeper; descendants at any
  // depth stay archived, keep their identifiers reserved, and must never be counted as loss.
  seedIssue(root, 'archive/loop-2025/i-120-nested', 'integrated', '[Goal](../../../../goal/spec.md)');
  write(root, '.arca/residual/archive/loop-2025/residual-us-120.md', '# Residual 120\n\nstatus: "satisfied"\n\n[Goal](../../../goal/spec.md)\n');
  write(root, '.arca/ticket/archive/loop-2025/t-120-nested.md', '# Ticket 120\n\nstatus: "done"\n\n[Residual](../../../residual/archive/loop-2025/residual-us-120.md)\n');
  return { parent, root };
}

function nextReservedId(root, kind) {
  const pattern = kind === 'issue' ? /(?:^|\/)i-(\d+)-[^/]+(?:\/|$)/g
    : kind === 'residual' ? /(?:^|\/)residual-us-(\d+)\.md$/g
      : /(?:^|\/)t-(\d+)-[^/]+\.md$/g;
  const values = [];
  for (const file of filesBelow(root, '.arca')) {
    for (const match of file.matchAll(pattern)) values.push(Number(match[1]));
  }
  return Math.max(...values) + 1;
}

/** PT-019: governance selects by terminal status across every loop, not by loop ownership. */
test('PT-019 governance sweeps every terminal record and defines the live collection remainder', () => {
  const governance = read(repositoryRoot, '.arca/index.md');
  assert.match(governance, /every (?:eligible )?terminal record[\s\S]{0,400}regardless of (?:the |which )?loop|terminal status alone/i);
  assert.match(governance, /live collection[\s\S]{0,300}(?:nonterminal|non-terminal)[\s\S]{0,200}archive/i);
  assert.match(governance, /live or archived location|live-or-archived/i);
  assert.doesNotMatch(governance, /relocate the completed loop's eligible records/i);
});

/** PT-019: after the sweep no live collection holds a finished record that is not active work. */
test('PT-019 leaves each live collection holding only nonterminal or active records', () => {
  const protectedRefs = activeRefs(repositoryRoot);
  for (const collection of collections) {
    assert.ok(existsSync(at(repositoryRoot, collection.archive)), `${collection.archive} must exist`);
    for (const record of liveRecords(repositoryRoot, collection)) {
      const name = record.slice(collection.live.length + 1);
      if (!collection.terminal.includes(recordStatus(repositoryRoot, record))) continue;
      assert.ok(
        protectedRefs.includes(name) || protectedRefs.includes(name.replace(/\.md$/, '')),
        `${record} is terminal and must be archived unless active_refs names it`,
      );
    }
  }
});

/** PT-019: every legacy terminal record moved exactly once, bodies intact. */
test('PT-019 archives the complete legacy terminal set exactly once', () => {
  for (const issue of legacyIssues) {
    const resolved = resolveRecord(repositoryRoot, `.arca/issue/${issue}`);
    assert.equal(resolved, `.arca/issue/archive/${issue}`);
    assert.deepEqual(
      readdirSync(at(repositoryRoot, resolved)).sort(),
      ['design.md', 'index.md', 'spec.md', 'test-plan.md', 'ubi-lang.md'],
    );
    assert.equal(recordStatus(repositoryRoot, resolved), 'integrated');
  }
  for (const residual of legacyResiduals) {
    const resolved = resolveRecord(repositoryRoot, `.arca/residual/${residual}`);
    assert.equal(resolved, `.arca/residual/archive/${residual}`);
    assert.equal(recordStatus(repositoryRoot, resolved), 'satisfied');
  }
  const archivedTickets = archivedRecords(repositoryRoot, collections[2])
    .filter((record) => /\/t-0(?:0[1-9]|1[0-6])-/.test(record));
  assert.equal(archivedTickets.length, legacyTicketCount);
  for (const ticket of archivedTickets) assert.equal(recordStatus(repositoryRoot, ticket), 'done');
});

/** PT-019: retention and census proofs resolve moved records instead of reporting loss. */
test('PT-019 preserves the recovery retention evidence independently of record location', () => {
  for (const file of retainedRecoveryIssueFiles) {
    const resolved = resolveRecord(repositoryRoot, file);
    assert.ok(existsSync(at(repositoryRoot, resolved)), `${file} must remain reachable at ${resolved}`);
  }
  const census = (collection) => liveRecords(repositoryRoot, collection).length + archivedRecords(repositoryRoot, collection).length;
  assert.ok(census(collections[1]) >= 17, 'live plus archived residual census must retain every recorded residual');
  assert.ok(census(collections[2]) >= 16, 'live plus archived ticket census must retain every recorded ticket');
});

/** PT-019: every retained route still resolves after relocation. */
test('PT-019 resolves every local Markdown route across the swept repository', () => {
  assertMarkdownLinksResolve(repositoryRoot);
});

/** PT-019: the sweep moves multi-loop terminal records and protects active and nonterminal ones. */
test('PT-019 isolated sweep relocates every loop and never touches active or nonterminal records', () => {
  const { parent, root } = seedFixture();
  try {
    const first = applySweep(root);
    assert.equal(first.moves, 6);
    assert.equal(first.logAppends, 1);
    assert.deepEqual(archivedRecords(root, collections[0]), ['.arca/issue/archive/i-101-first-loop', '.arca/issue/archive/i-102-second-loop', '.arca/issue/archive/loop-2025/i-120-nested']);
    assert.deepEqual(archivedRecords(root, collections[1]), ['.arca/residual/archive/loop-2025/residual-us-120.md', '.arca/residual/archive/residual-us-101.md', '.arca/residual/archive/residual-us-102.md']);
    assert.deepEqual(archivedRecords(root, collections[2]), ['.arca/ticket/archive/loop-2025/t-120-nested.md', '.arca/ticket/archive/t-101-first.md', '.arca/ticket/archive/t-102-second.md']);
    assert.deepEqual(liveRecords(root, collections[0]), ['.arca/issue/i-103-active-loop', '.arca/issue/i-104-pending']);
    assert.deepEqual(liveRecords(root, collections[1]), ['.arca/residual/residual-us-103.md', '.arca/residual/residual-us-104.md']);
    assert.deepEqual(liveRecords(root, collections[2]), ['.arca/ticket/t-103-active.md']);
    assert.match(read(root, '.arca/goal/spec.md'), /\(\.\.\/issue\/archive\/i-101-first-loop\/index\.md\)/);
    assert.match(read(root, '.arca/residual/archive/residual-us-101.md'), /\(\.\.\/\.\.\/issue\/archive\/i-101-first-loop\/index\.md\)/);
    assert.match(read(root, '.arca/residual/residual-us-103.md'), /\(\.\.\/issue\/i-103-active-loop\/index\.md\)/);
    assertMarkdownLinksResolve(root);
    assert.equal(nextReservedId(root, 'issue'), 121);
    assert.equal(nextReservedId(root, 'residual'), 121);
    assert.equal(nextReservedId(root, 'ticket'), 121);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

/** PT-019: repeating the sweep against unchanged state changes nothing. */
test('PT-019 isolated second sweep plans zero moves and leaves the tree unchanged', () => {
  const { parent, root } = seedFixture();
  try {
    applySweep(root);
    const digest = treeDigest(root);
    const log = read(root, '.arca/current/log.md');
    const second = applySweep(root);
    assert.deepEqual(planSweep(root), []);
    assert.equal(second.moves, 0);
    assert.equal(second.logAppends, 0);
    assert.equal(treeDigest(root), digest);
    assert.equal(read(root, '.arca/current/log.md'), log);
    assert.equal(log.split('- sweep complete').length - 1, 1);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

/** PT-019: a partially archived record is an error to repair, never a second relocation. */
test('PT-019 rejects a duplicated record instead of overwriting an archived copy', () => {
  const { parent, root } = seedFixture();
  try {
    cpSync(at(root, '.arca/ticket/t-101-first.md'), at(root, '.arca/ticket/archive/t-101-first.md'), { recursive: true });
    const before = treeDigest(root);
    assert.throws(() => applySweep(root), /must not already exist beneath its owning archive/);
    assert.equal(treeDigest(root), before);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

/** PT-019: an archive descendant at any depth still counts as a preserved record. */
test('PT-019 censuses archived descendants at every depth instead of reporting loss', () => {
  const { parent, root } = seedFixture();
  try {
    const nested = [
      ['.arca/issue/archive/loop-2025/i-120-nested', collections[0], 'integrated'],
      ['.arca/residual/archive/loop-2025/residual-us-120.md', collections[1], 'satisfied'],
      ['.arca/ticket/archive/loop-2025/t-120-nested.md', collections[2], 'done'],
    ];
    for (const [record, collection, status] of nested) {
      assert.ok(archivedRecords(root, collection).includes(record), `${record} must be counted at archive depth two`);
      assert.equal(recordStatus(root, record), status);
    }
    const before = collections.map((collection) => liveRecords(root, collection).length + archivedRecords(root, collection).length);
    applySweep(root);
    const after = collections.map((collection) => liveRecords(root, collection).length + archivedRecords(root, collection).length);
    assert.deepEqual(after, before, 'a sweep relocates records without changing any collection census');
    for (const [record, collection] of nested) {
      assert.ok(archivedRecords(root, collection).includes(record), `${record} must survive the sweep untouched`);
    }
    assertMarkdownLinksResolve(root);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
