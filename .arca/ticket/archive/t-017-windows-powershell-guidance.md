---
ticket-id: "t-017-windows-powershell-guidance"
residual-ids:
  - "residual-us-18"
behavior-refs:
  - ".arca/goal/spec.md#integrated-windows-shell-guidance-requirement (US-18)"
  - ".arca/goal/test-list.md#verification (T-018)"
design-refs:
  - ".arca/goal/design.md#integrated-windows-shell-guidance-mapping"
  - ".arca/issue/archive/i-003-windows-powershell-preference/design.md#proposed-design"
planned-test-refs:
  - "PT-017"
dependencies:
  - "none"
status: "done"
---

# Ticket: t-017-windows-powershell-guidance

## Vertical slice

Add one platform-aware shell-guidance policy used by skill generation and every command adapter: when the target platform is Windows, generated command and shell-tool guidance selects `pwsh` and PowerShell-native syntax for ordinary operations and for retries after a failed shell attempt. Bash is neither the Windows default nor a fallback; it is selected only when the requested operation explicitly requires a Bash/Unix environment, and the generated guidance states that reason. Apply the policy to shared allowed-tool output, generated skills, Claude command frontmatter, and Oh My Pi command formatting without branching on model identity. Convert affected archive, bulk-archive, and onboarding Windows examples from Bash/POSIX-first guidance (`bash` fences, `mkdir -p`, `mv`) to executable PowerShell-native guidance, while retaining an explicitly reasoned Bash example only where the operation itself requires Bash/Unix.

## Scope and implementation boundaries

- Centralize the platform decision in shared command/skill generation so adapters consume one Windows policy rather than duplicating model-specific conditions.
- Update `src/core/shared/allowed-tools.ts`, `src/core/shared/skill-generation.ts`, `src/core/command-generation/adapters/claude.ts`, and `src/core/command-generation/adapters/oh-my-pi.ts` only as needed to route and render the shared policy.
- Update affected Windows-facing examples in `src/core/templates/workflows/archive-change.ts`, `src/core/templates/workflows/bulk-archive-change.ts`, and `src/core/templates/workflows/onboard.ts` so ordinary Windows paths use PowerShell-native commands and fences.
- Preserve non-Windows behavior and existing adapter output unrelated to shell selection. Do not add model-name checks, runtime shell execution, retry orchestration, package changes, or unrelated template rewrites.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-017` | `.arca/goal/spec.md#integrated-windows-shell-guidance-requirement` (`US-18`) and `.arca/goal/test-list.md#verification` (`T-018`) | Generated skill plus Claude and Oh My Pi command outputs for Windows normal, failed-attempt retry, and explicit Bash/Unix-required scenarios; archive, bulk-archive, and onboarding templates; a non-Windows control | `test/t-017-windows-powershell-guidance.test.mjs` | Ordinary Windows output and post-failure guidance select `pwsh`, use PowerShell-native syntax, and contain no default/fallback Bash allowance; an explicit Bash/Unix-required case may select Bash only while emitting its reason; affected Windows examples are PowerShell-native; no model-identity branch appears; the non-Windows control remains compatible. |

## Planned verification commands

Run from PowerShell (`pwsh`):

```powershell
node --test test/t-017-windows-powershell-guidance.test.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm run build
corepack pnpm test
```

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects restoration of Bash as a Windows default or failure fallback. | `PT-017-H1` |
| `Input/Routing` | covered | Exercises Windows normal, retry, and explicit Bash/Unix-required routing through shared generation and both adapters. | `PT-017-H2` |
| `Lifecycle/Model` | covered | Proves retry guidance preserves the Windows platform choice and does not branch on model identity. | `PT-017-H3` |
| `Durability/Recovery` | covered | Re-generates outputs to ensure the platform policy remains stable across repeated generation. | `PT-017-H4` |
| `Output/Filesystem` | covered | Generates and inspects every production workflow body for skill, Claude, and Oh My Pi under explicit Windows context. | `PT-017-H5` |
| `Cross-Feature` | covered | Reconciles aggregate context, shared allowed tools, skill generation, Claude, Oh My Pi, explicit Unix exceptions, and Linux compatibility under one policy. | `PT-017-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-017-H1` | `.arca/goal/spec.md#integrated-windows-shell-guidance-requirement` | Reintroduce a shared `Bash(...)` allowance into ordinary Windows output. | `Regression` | Windows default/fallback assertion fails. | `command-generation-maintainer` |
| `PT-017-H2` | `.arca/goal/test-list.md#verification` | Route the same ordinary, failed-attempt, and explicit Unix-required inputs through generated skills and both adapters. | `Input/Routing` | Only the explicitly Unix-required case may select Bash, with its reason visible. | `command-generation-maintainer` |
| `PT-017-H3` | `.arca/goal/design.md#integrated-windows-shell-guidance-mapping` | Vary model-identifying metadata while holding platform and operation constant. | `Lifecycle/Model` | Output is identical in shell choice and retry guidance. | `command-generation-maintainer` |
| `PT-017-H4` | `.arca/goal/test-list.md#verification` | Generate each Windows case repeatedly. | `Durability/Recovery` | Repeated output preserves the same platform decision and exception reason. | `command-generation-maintainer` |
| `PT-017-H5` | `.arca/goal/spec.md#integrated-windows-shell-guidance-requirement` | Generate all 12 real `getSkillTemplates()` and `getCommandContents()` workflow bodies through skill, Claude, and Oh My Pi production renderers on explicit `win32`. | `Output/Filesystem` | Every ordinary Windows body contains a PowerShell fence and no Bash fence; archive and onboarding syntax remains PowerShell-native. | `workflow-template-maintainer` |
| `PT-017-H6` | `.arca/goal/design.md#integrated-windows-shell-guidance-mapping` | Drive aggregate templates and outer renderers with one shared Windows, explicit Unix-exception, or Linux context. | `Cross-Feature` | Inner fences and outer allowed-tool/guidance policy agree; explicit Unix reasons and Linux Bash compatibility are preserved. | `command-generation-maintainer` |

## P5 Verification Evidence

- Intentional PowerShell red run after the review tests: 8 tests ran, 6 passed and 2 failed on the expected aggregate `explore` Windows Bash fence and archive explicit-Unix inner/outer context disagreement.
- PowerShell `node --test test/t-017-windows-powershell-guidance.test.mjs`: passed 8/8; real aggregate generation covers all 12 workflows through generated skill, Claude, and Oh My Pi bodies on explicit Windows, explicit Unix-exception, and Linux contexts.
- PowerShell `node --test test/t-015-purge-preservation.test.mjs test/t-016-reproducible-recovery-proof.test.mjs`: passed 14/14; both tests assert the recorded freeze marker is `planningParent`, hash the first child commit containing the independently frozen working-tree bundle, and retain the prior evidence, append-only, and count assertions.
- PowerShell `corepack pnpm exec tsc --noEmit`: passed with no diagnostics.
- PowerShell `corepack pnpm run build`: passed.
- PowerShell `corepack pnpm test`: passed 30/30 Node tests and 1/1 Vitest test.
- Built-output generation smoke passed all 12 workflows across skill, Claude, and Oh My Pi for explicit Windows, Linux, and reasoned Unix-exception contexts; actual win32 default aggregates equaled explicit win32 aggregates.
- PowerShell `git diff --check`: passed.
- Review confirmed the nine regressed portable workflow command groups (`explore`, `new`, `continue`, `apply`, `update`, `ff`, `sync`, `verify`, and `propose`) contain only cross-shell-compatible `openspec` invocations, so the centralized fence renderer selects PowerShell on ordinary Windows without altering POSIX snippets on non-Windows.
- Syntax follow-up intentional red: focused PT-017 ran 9 tests with 8 passing and 1 failing on the unquoted `<first-artifact-id>` argument in generated Windows `new`; its Linux preservation assertions passed.
- Syntax follow-up green: quoted `<first-artifact-id>` and `<artifact-id>` arguments in both skill and command variants of `new`, `continue`, `update`, `ff`, and `propose`; focused PT-017 passed 9/9.
- PowerShell parser smoke accepted 62 generated PowerShell blocks from all 36 built Windows skill, Claude, and Oh My Pi workflow outputs.
- Syntax follow-up verification passed TypeScript noEmit, build, the full 31/31 Node plus 1/1 Vitest suite, and `git diff --check`; initially absent `node_modules` and `dist` plus the temporary parser smoke were removed.
