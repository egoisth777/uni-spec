import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRootUrl = pathToFileURL(`${path.join(root, 'src')}${path.sep}`).href;

// Exercise the TypeScript source APIs without requiring a checked-in or prebuilt dist/ tree.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.startsWith(sourceRootUrl) && specifier.endsWith('.js')) {
      const sourceUrl = new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL);
      if (existsSync(fileURLToPath(sourceUrl))) {
        return { shortCircuit: true, url: sourceUrl.href };
      }
    }
    return nextResolve(specifier, context);
  },
});

const [
  { generateSkillContent, getSkillTemplates, getCommandContents },
  { generateCommands },
  { claudeAdapter },
  { ohMyPiAdapter },
  archive,
  bulkArchive,
  onboard,
] =
  await Promise.all([
    import('../src/core/shared/skill-generation.ts'),
    import('../src/core/command-generation/generator.ts'),
    import('../src/core/command-generation/adapters/claude.ts'),
    import('../src/core/command-generation/adapters/oh-my-pi.ts'),
    import('../src/core/templates/workflows/archive-change.ts'),
    import('../src/core/templates/workflows/bulk-archive-change.ts'),
    import('../src/core/templates/workflows/onboard.ts'),
  ]);

const skillTemplate = {
  name: 'pt-017-shell-guidance',
  description: 'Exercise platform shell guidance.',
  instructions: 'Run `openspec status` and report the result.',
  license: 'MIT',
  compatibility: 'Requires openspec CLI.',
  metadata: { author: 'openspec', version: '1.0' },
};

const commandContent = {
  id: 'pt-017-shell-guidance',
  name: 'PT-017 shell guidance',
  description: 'Exercise platform shell guidance.',
  category: 'Verification',
  tags: ['verification'],
  body: '**Input**: shell operation\n\nRun `openspec status` and report the result.',
};

const windowsOrdinary = { platform: 'win32' };
const windowsRetry = { platform: 'win32', retryAfterFailure: true };
const unixReason = 'the requested verification depends on POSIX shell expansion';
const windowsUnixRequired = { platform: 'win32', unixRequiredReason: unixReason };
const linuxOrdinary = { platform: 'linux' };

const workflowIds = [
  'explore',
  'new',
  'continue',
  'apply',
  'update',
  'ff',
  'sync',
  'archive',
  'bulk-archive',
  'verify',
  'onboard',
  'propose',
];
const aggregateFenceRegressionIds = [
  'explore',
  'new',
  'continue',
  'apply',
  'update',
  'ff',
  'sync',
  'verify',
  'propose',
];

function generateOutputs(context) {
  return {
    skill: generateSkillContent(skillTemplate, '0.0.0-pt-017', undefined, context),
    claude: claudeAdapter.formatFile(commandContent, context),
    omp: ohMyPiAdapter.formatFile(commandContent, context),
  };
}

function generateAggregateOutputs(context) {
  const skillEntries = getSkillTemplates(undefined, context);
  const commandContents = getCommandContents(undefined, context);
  const claudeCommands = generateCommands(commandContents, claudeAdapter, context);
  const ompCommands = generateCommands(commandContents, ohMyPiAdapter, context);

  return {
    skills: new Map(skillEntries.map(({ template, workflowId }) => [
      workflowId,
      generateSkillContent(template, '0.0.0-pt-017', undefined, context),
    ])),
    claude: new Map(commandContents.map((content, index) => [content.id, claudeCommands[index].fileContent])),
    omp: new Map(commandContents.map((content, index) => [content.id, ompCommands[index].fileContent])),
  };
}

function allowedTools(output) {
  return output.match(/^allowed-tools:\s*(.+)$/m)?.[1] ?? null;
}

function assertWindowsPwshPolicy(output, label) {
  assert.match(output, /\bpwsh\b/i, `${label} must select pwsh on Windows`);
  assert.match(output, /PowerShell-native/i, `${label} must require PowerShell-native syntax`);
  assert.match(
    output,
    /(?:do not|never)[^\n]*(?:fall back|fallback)[^\n]*Bash|Bash[^\n]*(?:is not|must not|never)[^\n]*(?:fall back|fallback)/i,
    `${label} must make the no-Bash-fallback rule visible`,
  );
  const tools = allowedTools(output);
  if (tools !== null) {
    assert.doesNotMatch(tools, /\bBash\s*\(/i, `${label} must not pre-approve Bash on Windows`);
    assert.match(tools, /pwsh/i, `${label} must pre-approve pwsh on Windows`);
  }
}

function assertPowerShellWorkflow(output, label) {
  assert.match(output, /```(?:powershell|pwsh)\b/i, `${label} must use a PowerShell fence`);
  assert.doesNotMatch(output, /```bash\b/i, `${label} must not present ordinary Windows work in a Bash fence`);
  assert.doesNotMatch(output, /^\s*mkdir\s+-p\b/im, `${label} must not use POSIX mkdir -p`);
  assert.doesNotMatch(output, /^\s*mv\s+/im, `${label} must not use POSIX mv`);
}

function shellBlocks(output, language) {
  return [...output.matchAll(new RegExp(`\`\`\`${language}\\b[^\\n]*\\n([\\s\\S]*?)\`\`\``, 'gi'))].map(
    (match) => match[1],
  );
}

/** PT-017: ordinary Windows generation selects pwsh consistently across outputs. */
test('PT-017 ordinary Windows skill, Claude, and OMP outputs select pwsh without Bash allowance', () => {
  const outputs = generateOutputs(windowsOrdinary);
  for (const [label, output] of Object.entries(outputs)) assertWindowsPwshPolicy(output, label);

  assert.equal(allowedTools(outputs.skill), allowedTools(outputs.claude), 'shared allowed-tool policy must agree');
});

/** PT-017: a failed shell attempt does not change the Windows platform choice. */
test('PT-017 Windows retry guidance preserves pwsh and forbids Bash fallback', () => {
  const outputs = generateOutputs(windowsRetry);
  for (const [label, output] of Object.entries(outputs)) {
    assertWindowsPwshPolicy(output, label);
    assert.match(output, /(?:failed|failure)[^\n]*retry|retry[^\n]*(?:failed|failure)/i, `${label} must explain failed-attempt retry behavior`);
  }
});

/** PT-017: Bash is available only for an explicit Unix requirement with its reason emitted. */
test('PT-017 explicit Bash or Unix requirement selects Bash only with a visible reason', () => {
  const outputs = generateOutputs(windowsUnixRequired);
  for (const [label, output] of Object.entries(outputs)) {
    assert.match(output, /\bBash\b/, `${label} must select Bash for the explicit Unix-required exception`);
    assert.match(output, new RegExp(unixReason, 'i'), `${label} must emit the exception reason`);
    assert.match(output, /(?:select|use)[^\n]*Bash|Bash[^\n]*(?:selected|required)/i, `${label} must make selection explicit`);
  }
});

/** PT-017: existing non-Windows Bash-compatible output remains available. */
test('PT-017 non-Windows generation remains Bash-compatible', () => {
  const outputs = generateOutputs(linuxOrdinary);
  assert.match(allowedTools(outputs.skill) ?? '', /Bash\(openspec:\*\)/);
  assert.equal(allowedTools(outputs.skill), allowedTools(outputs.claude));
  assert.doesNotMatch(outputs.omp, /Windows[^\n]*(?:pwsh|PowerShell)/i);
  assert.match(outputs.omp, /Run `openspec status`/);
});

/** PT-017 review repair: production aggregation renders every workflow with one Windows policy. */
test('PT-017 real aggregate generation renders every Windows workflow for skill, Claude, and OMP', () => {
  const outputs = generateAggregateOutputs(windowsOrdinary);

  for (const [kind, generated] of Object.entries(outputs)) {
    assert.deepEqual([...generated.keys()], workflowIds, `${kind} must generate every production workflow`);
    for (const workflowId of workflowIds) {
      const output = generated.get(workflowId);
      assertWindowsPwshPolicy(output, `${kind} ${workflowId}`);
      assertPowerShellWorkflow(output, `${kind} ${workflowId}`);
    }
  }

  for (const workflowId of aggregateFenceRegressionIds) {
    assert.doesNotMatch(outputs.skills.get(workflowId), /```bash\b/i);
    assert.doesNotMatch(outputs.claude.get(workflowId), /```bash\b/i);
    assert.doesNotMatch(outputs.omp.get(workflowId), /```bash\b/i);
  }
});

/** PT-017 syntax follow-up: PowerShell must not parse placeholder arguments as redirection tokens. */
test('PT-017 Windows PowerShell blocks quote angle-bracket arguments while Linux stays Bash-compatible', () => {
  const windowsOutputs = generateAggregateOutputs(windowsOrdinary);
  const linuxOutputs = generateAggregateOutputs(linuxOrdinary);
  const unquotedAngleArgument = /(?:^|[ \t])<[a-z][a-z0-9-]*>(?=[ \t\r\n]|$)/im;

  for (const [kind, generated] of Object.entries(windowsOutputs)) {
    for (const [workflowId, output] of generated) {
      const blocks = shellBlocks(output, '(?:powershell|pwsh)');
      assert.ok(blocks.length > 0, `${kind} ${workflowId} must contain a PowerShell block`);
      for (const block of blocks) {
        assert.doesNotMatch(
          block,
          unquotedAngleArgument,
          `${kind} ${workflowId} must quote angle-bracket arguments for PowerShell`,
        );
      }
    }
  }

  for (const [kind, generated] of Object.entries(linuxOutputs)) {
    for (const [workflowId, output] of generated) {
      assert.match(output, /```bash\b/i, `${kind} ${workflowId} must retain its Linux Bash block`);
      assert.doesNotMatch(output, /```(?:powershell|pwsh)\b/i, `${kind} ${workflowId} must not gain PowerShell syntax on Linux`);
    }
  }
});

/** PT-017 review repair: aggregate context drives both outer policy and inner workflow fences. */
test('PT-017 aggregate context consistently preserves explicit Unix exceptions and Linux Bash output', () => {
  const unixOutputs = generateAggregateOutputs(windowsUnixRequired);
  const linuxOutputs = generateAggregateOutputs(linuxOrdinary);

  for (const [kind, generated] of Object.entries(unixOutputs)) {
    for (const [workflowId, output] of generated) {
      assert.match(output, new RegExp(unixReason, 'i'), `${kind} ${workflowId} must emit the Unix exception reason`);
      assert.match(output, /```bash\b/i, `${kind} ${workflowId} must retain a Bash fence for the explicit exception`);
      assert.doesNotMatch(output, /```(?:powershell|pwsh)\b/i, `${kind} ${workflowId} must not disagree with the Bash exception`);
    }
  }

  for (const [kind, generated] of Object.entries(linuxOutputs)) {
    for (const [workflowId, output] of generated) {
      assert.match(output, /```bash\b/i, `${kind} ${workflowId} must remain Bash-compatible on Linux`);
      assert.doesNotMatch(output, /```(?:powershell|pwsh)\b/i, `${kind} ${workflowId} must preserve POSIX fences`);
    }
  }
});

/** PT-017: affected archive and onboarding examples are executable PowerShell guidance. */
test('PT-017 archive, bulk-archive, and onboarding Windows examples are PowerShell-native', () => {
  const workflows = {
    'archive skill': archive.getArchiveChangeSkillTemplate(windowsOrdinary).instructions,
    'archive command': archive.getOpsxArchiveCommandTemplate(windowsOrdinary).content,
    'bulk archive skill': bulkArchive.getBulkArchiveChangeSkillTemplate(windowsOrdinary).instructions,
    'bulk archive command': bulkArchive.getOpsxBulkArchiveCommandTemplate(windowsOrdinary).content,
    'onboard skill': onboard.getOnboardSkillTemplate(windowsOrdinary).instructions,
    'onboard command': onboard.getOpsxOnboardCommandTemplate(windowsOrdinary).content,
  };

  for (const [label, output] of Object.entries(workflows)) assertPowerShellWorkflow(output, label);
  for (const [label, output] of Object.entries(workflows).filter(([name]) => name.startsWith('archive') || name.startsWith('bulk'))) {
    assert.match(output, /\bNew-Item\b/i, `${label} must create the archive directory with PowerShell`);
    assert.match(output, /\bMove-Item\b/i, `${label} must move the change with PowerShell`);
  }
  for (const [label, output] of Object.entries(workflows).filter(([name]) => name.startsWith('onboard'))) {
    assert.match(output, /^\s*if \(Get-Command openspec\b/im, `${label} must make the Windows CLI check executable`);
    assert.match(output, /\$LASTEXITCODE/, `${label} must use the PowerShell exit-code check`);
  }
});

/** PT-017: shell selection is stable and independent of reported model identities. */
test('PT-017 repeated generation has no gpt-sol or gpt-luna identity branch', () => {
  const first = generateOutputs(windowsOrdinary);
  assert.deepEqual(generateOutputs(windowsOrdinary), first, 'repeated generation must preserve shell selection');
  assert.deepEqual(generateOutputs({ ...windowsOrdinary, modelIdentity: 'gpt-sol' }), first);
  assert.deepEqual(generateOutputs({ ...windowsOrdinary, modelIdentity: 'gpt-luna' }), first);

  const affectedSources = [
    'src/core/shared/allowed-tools.ts',
    'src/core/shared/skill-generation.ts',
    'src/core/command-generation/adapters/claude.ts',
    'src/core/command-generation/adapters/oh-my-pi.ts',
    'src/core/templates/workflows/archive-change.ts',
    'src/core/templates/workflows/bulk-archive-change.ts',
    'src/core/templates/workflows/onboard.ts',
  ];
  const source = affectedSources.map((file) => readFileSync(path.join(root, file), 'utf8')).join('\n');
  assert.doesNotMatch(source, /gpt-(?:sol|luna)/i);
});
