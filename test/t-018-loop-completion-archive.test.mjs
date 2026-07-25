import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const goalFiles = ['index.md', 'ubi-lang.md', 'spec.md', 'design.md', 'test-list.md'];
const frozenHead = 'badbfd65c1452dd7f71d2415ac4e4e7ce4ca2d68';
const frozenBundle = '53110161fb9cabf775f9d5706a28b6987e58f3a5a738f572476c820bc64170c7';
const transients = ['dist', 'node_modules', 'coverage', 'temp', 'tmp', '.tmp'];
const recordPlan = [
  { kind: 'issue', id: 'i-101-terminal', source: '.arca/issue/i-101-terminal', destination: '.arca/issue/archive/i-101-terminal' },
  { kind: 'residual', id: 'residual-us-101', source: '.arca/residual/residual-us-101.md', destination: '.arca/residual/archive/residual-us-101.md' },
  { kind: 'ticket', id: 't-101-terminal', source: '.arca/ticket/t-101-terminal.md', destination: '.arca/ticket/archive/t-101-terminal.md' },
];

const slash = (value) => value.replaceAll(path.sep, '/');
const at = (root, repositoryPath) => path.join(root, ...repositoryPath.split('/'));
const read = (root, repositoryPath) => readFileSync(at(root, repositoryPath), 'utf8');
const write = (root, repositoryPath, content) => {
  const destination = at(root, repositoryPath);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content);
};

function filesBelow(root, repositoryPath = '') {
  const absoluteRoot = at(root, repositoryPath);
  if (!existsSync(absoluteRoot)) return [];
  const found = [];
  const visit = (absolutePath) => {
    for (const entry of readdirSync(absolutePath, { withFileTypes: true })) {
      const child = path.join(absolutePath, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile()) found.push(slash(path.relative(root, child)));
    }
  };
  visit(absoluteRoot);
  return found.sort();
}

function treeDigest(root) {
  const hash = createHash('sha256');
  for (const file of filesBelow(root)) {
    hash.update(file);
    hash.update('\0');
    hash.update(readFileSync(at(root, file)));
  }
  return hash.digest('hex');
}

function recordStatus(root, record) {
  const file = record.kind === 'issue' ? `${record.source}/index.md` : record.source;
  return read(root, file).match(/^status:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim();
}

function parseCurrent(root) {
  const current = read(root, '.arca/current/current.md');
  const scalar = (name) => current.match(new RegExp(`^${name}:\\s*["']?([^"'\\r\\n]*)["']?\\s*$`, 'm'))?.[1]?.trim() ?? '';
  const active = current.match(/^active_refs:\s*\[(.*)]\s*$/m)?.[1] ?? '';
  return {
    text: current,
    phase: scalar('phase'),
    status: scalar('status'),
    waitingOn: scalar('waiting_on'),
    activeRefs: [...active.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]),
  };
}

function lifecycleGoalDigest(root) {
  const hash = createHash('sha256');
  for (const file of goalFiles) {
    hash.update(Buffer.from(file, 'utf8'));
    hash.update(Buffer.from([0]));
    hash.update(readFileSync(at(root, `.arca/goal/${file}`)));
  }
  return hash.digest('hex');
}

function independentGoalDigest(root) {
  const pieces = [];
  for (const filename of goalFiles) {
    pieces.push(Buffer.from(filename));
    pieces.push(Buffer.alloc(1));
    pieces.push(readFileSync(at(root, `.arca/goal/${filename}`)));
  }
  return createHash('sha256').update(Buffer.concat(pieces)).digest('hex');
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
      const fragment = decodeURIComponent(rawFragment);
      const headings = readFileSync(destination, 'utf8')
        .split(/\r?\n/)
        .filter((line) => /^#{1,6}\s+/.test(line))
        .map((line) => line.replace(/^#{1,6}\s+/, '').toLowerCase()
          .replace(/<[^>]+>/g, '').replace(/[`*_]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '')
          .trim().replace(/\s+/g, '-'));
      assert.ok(headings.includes(fragment.toLowerCase()), `${source} link ${rawTarget} heading must resolve`);
    }
  }
}

function mapMovedPath(repositoryPath) {
  for (const record of recordPlan) {
    if (repositoryPath === record.source || repositoryPath.startsWith(`${record.source}/`)) {
      return record.destination + repositoryPath.slice(record.source.length);
    }
  }
  return repositoryPath;
}

function repairedMarkdown(root, oldSource, finalSource) {
  const text = read(root, oldSource);
  return text.replace(/(!?(?:\[[^\]]*\]))\(([^)]+)\)/g, (whole, label, rawTarget) => {
    const cleanTarget = rawTarget.trim().replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:|#)/i.test(cleanTarget)) return whole;
    const [rawFile, rawFragment] = cleanTarget.split('#', 2);
    const oldTarget = slash(path.relative(root, path.resolve(path.dirname(at(root, oldSource)), decodeURIComponent(rawFile))));
    const finalTarget = mapMovedPath(oldTarget);
    let relativeTarget = slash(path.relative(path.dirname(finalSource), finalTarget));
    if (!relativeTarget.startsWith('.')) relativeTarget = `./${relativeTarget}`;
    return `${label}(${relativeTarget}${rawFragment ? `#${rawFragment}` : ''})`;
  });
}

function applyLifecycle(root) {
  const current = parseCurrent(root);
  const incompleteResiduals = readdirSync(at(root, '.arca/residual'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .filter((entry) => /^status:\s*["']?(?:missing|partial)["']?\s*$/m.test(read(root, `.arca/residual/${entry.name}`)));
  assert.equal(incompleteResiduals.length, 0, 'final gap recheck must be green');
  assert.equal(current.phase, 'Idle', 'completion requires the Idle phase gate');
  assert.equal(current.status, 'idle', 'completion requires idle status');
  assert.equal(current.waitingOn, '', 'completion requires empty waiting_on');
  assert.deepEqual(current.activeRefs, [], 'completion rejects active records');

  const states = recordPlan.map((record) => ({
    record,
    sourceExists: existsSync(at(root, record.source)),
    destinationExists: existsSync(at(root, record.destination)),
  }));
  for (const state of states) {
    assert.notEqual(state.sourceExists, state.destinationExists, `${state.record.id} must exist at exactly one lifecycle location`);
  }
  const sourceCount = states.filter((state) => state.sourceExists).length;
  assert.ok(sourceCount === 0 || sourceCount === recordPlan.length, 'mixed partial archive state is forbidden');
  for (const { record, sourceExists } of states) {
    if (!sourceExists) continue;
    const terminal = { issue: ['integrated', 'rejected'], residual: ['satisfied'], ticket: ['done'] }[record.kind];
    assert.ok(terminal.includes(recordStatus(root, record)), `${record.id} must be terminal before archival`);
  }

  if (sourceCount === 0) return { moves: 0, logAppends: 0, digest: lifecycleGoalDigest(root) };

  const stageParent = mkdtempSync(path.join(path.dirname(root), '.completion-stage-'));
  const stage = path.join(stageParent, 'tree');
  cpSync(root, stage, { recursive: true });
  try {
    const markdown = filesBelow(stage, '.arca').filter((file) => file.endsWith('.md'));
    const rewrites = new Map(markdown.map((oldSource) => [mapMovedPath(oldSource), repairedMarkdown(stage, oldSource, mapMovedPath(oldSource))]));
    for (const transient of transients) rmSync(at(stage, transient), { recursive: true, force: true });
    for (const record of recordPlan) {
      mkdirSync(path.dirname(at(stage, record.destination)), { recursive: true });
      renameSync(at(stage, record.source), at(stage, record.destination));
    }
    for (const [destination, content] of rewrites) write(stage, destination, content);

    const digest = lifecycleGoalDigest(stage);
    const stagedCurrent = read(stage, '.arca/current/current.md');
    assert.match(stagedCurrent, new RegExp(`goal_revision:.*${frozenHead}.*${frozenBundle}`));
    write(stage, '.arca/current/current.md', stagedCurrent.replace(/^output_revision:.*$/m, `output_revision: "link-normalized goal filename-NUL-content SHA-256 ${digest}"`));
    const logPath = '.arca/current/log.md';
    const log = read(stage, logPath);
    const transition = 'completion lifecycle complete';
    assert.equal(log.split(transition).length - 1, 0, 'fixture begins before its completion transition');
    write(stage, logPath, `${log.trimEnd()}\n2026-07-24 - Phase Idle - ${transition}\n`);
    assertMarkdownLinksResolve(stage);

    const backup = `${root}.pre-completion`;
    renameSync(root, backup);
    try {
      renameSync(stage, root);
      rmSync(backup, { recursive: true, force: true });
    } catch (error) {
      if (!existsSync(root)) renameSync(backup, root);
      throw error;
    }
    return { moves: recordPlan.length, logAppends: 1, digest };
  } finally {
    rmSync(stageParent, { recursive: true, force: true });
  }
}

function issueDocument(id, status, links) {
  return `---\nissue-id: "${id}"\norigin: "fixture"\nstatus: "${status}"\n---\n\n# Issue ${id}\n\n${links}\n`;
}

function seedIssue(root, id, status, links = '') {
  write(root, `.arca/issue/${id}/index.md`, issueDocument(id, status, links));
  for (const file of ['ubi-lang.md', 'spec.md', 'design.md', 'test-plan.md']) {
    write(root, `.arca/issue/${id}/${file}`, `# ${file}\n\nFixture content.\n`);
  }
}

function seedFixture() {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'uni-spec-t018-'));
  const root = path.join(parent, 'repository');
  mkdirSync(root);
  for (const [index, file] of goalFiles.entries()) {
    const body = file === 'spec.md'
      ? '# Goal spec\n\n[Terminal issue](../issue/i-101-terminal/index.md)\n'
      : `# Goal ${index}\n\nPermanent authority.\n`;
    write(root, `.arca/goal/${file}`, body);
  }
  write(root, '.arca/current/current.md', `phase: "P5"\nstatus: "running"\ngoal_revision: "HEAD ${frozenHead}; filename-NUL-content SHA-256 ${frozenBundle}"\ninput_revision: "green recheck pending Idle gate"\noutput_revision: ""\nactive_refs: [".arca/issue/i-101-terminal"]\nwaiting_on: ""\n`);
  write(root, '.arca/current/log.md', '2026-07-24 - Phase P5 - fixture ready\n');
  write(root, '.arca/io/evidence.json', '{"permanent":true}\n');
  write(root, 'src/permanent.ts', 'export const permanent = true;\n');
  write(root, 'test/permanent.test.mjs', 'export const permanentTest = true;\n');
  write(root, '.arca/tpl/current.md', '# Template\n\n[Token]({{path/to/current}})\n');
  for (const transient of transients) write(root, `${transient}/generated.txt`, 'transient\n');

  seedIssue(root, 'i-101-terminal', 'integrated', '[Residual](../../residual/residual-us-101.md)');
  seedIssue(root, 'i-102-nonterminal', 'pending', '[Terminal issue](../i-101-terminal/index.md)');
  seedIssue(root, 'archive/i-109-reserved', 'rejected');
  write(root, '.arca/residual/residual-us-101.md', '# Residual 101\n\nstatus: "satisfied"\n\n[Ticket](../ticket/t-101-terminal.md)\n[Issue](../issue/i-101-terminal/index.md)\n');
  write(root, '.arca/residual/residual-us-102.md', '# Residual 102\n\nstatus: "partial"\n\n[Issue](../issue/i-102-nonterminal/index.md)\n');
  write(root, '.arca/residual/archive/residual-us-109.md', '# Reserved residual\n\nstatus: "satisfied"\n');
  write(root, '.arca/ticket/t-101-terminal.md', '# Ticket 101\n\nstatus: "done"\n\n[Residual](../residual/residual-us-101.md)\n');
  write(root, '.arca/ticket/t-102-nonterminal.md', '# Ticket 102\n\nstatus: "approved"\n\n[Residual](../residual/residual-us-102.md)\n');
  write(root, '.arca/ticket/archive/t-109-reserved.md', '# Reserved ticket\n\nstatus: "done"\n');
  return { parent, root };
}

function liveScans(root) {
  const directDirectories = (repositoryPath) => readdirSync(at(root, repositoryPath), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'archive').map((entry) => entry.name).sort();
  const directMarkdown = (repositoryPath) => readdirSync(at(root, repositoryPath), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => entry.name).sort();
  return {
    issues: directDirectories('.arca/issue'),
    residuals: directMarkdown('.arca/residual'),
    tickets: directMarkdown('.arca/ticket'),
  };
}

function nextReservedId(root, kind) {
  const pattern = kind === 'issue' ? /(?:^|\/)(i-(\d+)-[^/]+)(?:\/|$)/g
    : kind === 'residual' ? /(?:^|\/)(residual-us-(\d+)\.md)$/g
      : /(?:^|\/)(t-(\d+)-[^/]+\.md)$/g;
  const values = [];
  for (const file of filesBelow(root, '.arca')) {
    for (const match of file.matchAll(pattern)) values.push(Number(match[2]));
  }
  return Math.max(...values) + 1;
}

/** PT-018: the documented repository route invokes completion after the green Idle gate. */
test('PT-018 routes the overview, step table, Mermaid flow, and worked example through completion before rest', () => {
  const governance = read(repositoryRoot, '.arca/index.md');
  assert.match(governance, /last ticket[\s\S]{0,500}gap check[\s\S]{0,500}Idle gate[\s\S]{0,500}(?:completion lifecycle|end-of-loop cleanup)[\s\S]{0,300}(?:remain|return)[^\n]*Idle/i);
  const p5Row = governance.split('\n').find((line) => line.includes('**P5**')) ?? '';
  assert.match(p5Row, /Idle gate.*completion lifecycle.*(?:rest|remain Idle)/i);
  assert.match(governance, /P2\s*-->\|nothing missing\|\s*GATE[\s\S]{0,300}GATE\s*-->\s*COMPLETE[\s\S]{0,300}COMPLETE\s*-->\s*IDLE/);
  const worked = governance.slice(governance.indexOf('# Worked example'));
  assert.match(worked, /gap (?:check|recheck)[\s\S]{0,300}Idle gate[\s\S]{0,300}completion lifecycle[\s\S]{0,300}(?:remain|rest)[^\n]*Idle/i);
});

/** PT-018: the fixture rejects every precondition failure without partial filesystem mutation. */
test('PT-018 isolated lifecycle rejects premature and active attempts with no partial mutation', () => {
  const fixture = seedFixture();
  try {
    const beforePremature = treeDigest(fixture.root);
    assert.throws(() => applyLifecycle(fixture.root), /final gap recheck must be green/);
    assert.equal(treeDigest(fixture.root), beforePremature);

    write(fixture.root, '.arca/residual/residual-us-102.md', read(fixture.root, '.arca/residual/residual-us-102.md').replace('status: "partial"', 'status: "satisfied"'));
    write(fixture.root, '.arca/current/current.md', read(fixture.root, '.arca/current/current.md').replace('phase: "P5"', 'phase: "Idle"').replace('status: "running"', 'status: "idle"'));
    const beforeActive = treeDigest(fixture.root);
    assert.throws(() => applyLifecycle(fixture.root), /completion rejects active records/);
    assert.equal(treeDigest(fixture.root), beforeActive);
    for (const record of recordPlan) assert.ok(existsSync(at(fixture.root, record.source)));
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

/** PT-018: one valid pass performs cleanup, promotion, archive/link repair, scans, and allocation. */
test('PT-018 isolated lifecycle first pass executes the complete atomic contract', () => {
  const fixture = seedFixture();
  try {
    write(fixture.root, '.arca/residual/residual-us-102.md', read(fixture.root, '.arca/residual/residual-us-102.md').replace('status: "partial"', 'status: "satisfied"'));
    write(fixture.root, '.arca/current/current.md', read(fixture.root, '.arca/current/current.md')
      .replace('phase: "P5"', 'phase: "Idle"').replace('status: "running"', 'status: "idle"')
      .replace('active_refs: [".arca/issue/i-101-terminal"]', 'active_refs: []'));
    const protectedFiles = ['src/permanent.ts', 'test/permanent.test.mjs', '.arca/io/evidence.json'];
    const protectedBytes = new Map(protectedFiles.map((file) => [file, readFileSync(at(fixture.root, file))]));

    const result = applyLifecycle(fixture.root);
    assert.deepEqual(result, { moves: 3, logAppends: 1, digest: independentGoalDigest(fixture.root) });
    for (const transient of transients) assert.ok(!existsSync(at(fixture.root, transient)), `${transient} must be removed in the fixture`);
    for (const [file, bytes] of protectedBytes) assert.deepEqual(readFileSync(at(fixture.root, file)), bytes, `${file} must be preserved byte-for-byte`);
    for (const record of recordPlan) {
      assert.ok(!existsSync(at(fixture.root, record.source)));
      assert.ok(existsSync(at(fixture.root, record.destination)));
    }
    assert.deepEqual(liveScans(fixture.root), {
      issues: ['i-102-nonterminal'],
      residuals: ['residual-us-102.md'],
      tickets: ['t-102-nonterminal.md'],
    });
    assert.deepEqual(readdirSync(at(fixture.root, '.arca/issue/i-102-nonterminal')).sort(), ['design.md', 'index.md', 'spec.md', 'test-plan.md', 'ubi-lang.md']);
    assert.equal(nextReservedId(fixture.root, 'issue'), 110);
    assert.equal(nextReservedId(fixture.root, 'residual'), 110);
    assert.equal(nextReservedId(fixture.root, 'ticket'), 110);
    const current = read(fixture.root, '.arca/current/current.md');
    assert.match(current, new RegExp(`goal_revision:.*${frozenHead}.*${frozenBundle}`));
    assert.match(current, new RegExp(`output_revision:.*${independentGoalDigest(fixture.root)}`));
    assert.equal(read(fixture.root, '.arca/current/log.md').split('completion lifecycle complete').length - 1, 1);
    assertMarkdownLinksResolve(fixture.root);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

/** PT-018: an unchanged second pass is a strict no-op. */
test('PT-018 isolated lifecycle second pass returns zero moves and no log or tree change', () => {
  const fixture = seedFixture();
  try {
    write(fixture.root, '.arca/residual/residual-us-102.md', read(fixture.root, '.arca/residual/residual-us-102.md').replace('status: "partial"', 'status: "satisfied"'));
    write(fixture.root, '.arca/current/current.md', read(fixture.root, '.arca/current/current.md')
      .replace('phase: "P5"', 'phase: "Idle"').replace('status: "running"', 'status: "idle"')
      .replace('active_refs: [".arca/issue/i-101-terminal"]', 'active_refs: []'));
    applyLifecycle(fixture.root);
    const beforeTree = treeDigest(fixture.root);
    const beforeLog = readFileSync(at(fixture.root, '.arca/current/log.md'));
    const beforeCurrent = readFileSync(at(fixture.root, '.arca/current/current.md'));
    const second = applyLifecycle(fixture.root);
    assert.deepEqual(second, { moves: 0, logAppends: 0, digest: independentGoalDigest(fixture.root) });
    assert.equal(treeDigest(fixture.root), beforeTree);
    assert.deepEqual(readFileSync(at(fixture.root, '.arca/current/log.md')), beforeLog);
    assert.deepEqual(readFileSync(at(fixture.root, '.arca/current/current.md')), beforeCurrent);
  } finally {
    rmSync(fixture.parent, { recursive: true, force: true });
  }
});

/** PT-018: the live repository retains the P2 marker and independently matches normalized output bytes. */
test('PT-018 independently verifies current goal digest while retaining the frozen P2 marker', () => {
  const current = read(repositoryRoot, '.arca/current/current.md');
  assert.match(current, new RegExp(`goal_revision:.*HEAD ${frozenHead}.*${frozenBundle}`));
  const outputDigest = current.match(/output_revision:.*SHA-256\s+([a-f0-9]{64})/i)?.[1];
  assert.equal(outputDigest, independentGoalDigest(repositoryRoot));
});

/** PT-018: every real retained Arca Markdown route resolves, including live legacy records. */
test('PT-018 resolves local Markdown links across every retained real .arca document', () => {
  assertMarkdownLinksResolve(repositoryRoot);
});

/** PT-018: CI/final verification can demand an actually clean repository root. */
test('PT-018 explicit final-clean mode requires every governed root transient to be absent', () => {
  const governance = read(repositoryRoot, '.arca/index.md');
  assert.match(governance, /Cleanup removes only transient[\s\S]{0,500}(?:generated output|installed dependencies)/i);
  if (process.env.UNI_SPEC_FINAL_CLEAN_TREE !== '1') return;
  for (const transient of transients) {
    assert.ok(!existsSync(at(repositoryRoot, transient)), `${transient}/ must be absent when UNI_SPEC_FINAL_CLEAN_TREE=1`);
  }
});
