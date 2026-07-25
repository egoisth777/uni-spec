---
ticket-id: "t-018-loop-completion-archive"
residual-ids:
  - "residual-us-19"
behavior-refs:
  - ".arca/goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement (US-19)"
  - ".arca/goal/test-list.md#verification (T-019)"
design-refs:
  - ".arca/goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping"
  - ".arca/issue/archive/i-004-loop-cleanup-archive/design.md#proposed-design"
planned-test-refs:
  - "PT-018"
dependencies:
  - "t-017-windows-powershell-guidance"
status: "done"
---

# Ticket: t-018-loop-completion-archive

## Vertical slice

Complete one self-hosting end-of-loop lifecycle for the two just-completed repository loops. Extend `.arca/index.md` with the archive governance needed to make completion safe and repeatable, then, only after the P4 test is written and the final gap recheck is green, remove transient generated state, retain `.arca/goal/` as the cumulative current authority while recording the completed loop's exact frozen goal revision in current state, and atomically relocate the terminal i-003/i-004, residual-us-18/residual-us-19, and t-017/t-018 records into reserved owning archives with every affected authority link repaired. The second unchanged completion pass must be a no-op.

## Scope and implementation boundaries

- Update `.arca/index.md` governance to reserve only the direct `.arca/issue/archive/`, `.arca/residual/archive/`, and `.arca/ticket/archive/` directories; exclude each archive and all descendants from live issue shape, gap, and ticket-work scans; continue to reserve identifiers found in archived descendants; define terminal eligibility as `integrated|rejected` issues, `satisfied` residuals, and `done` tickets; forbid archiving active or nonterminal records; and require the final green gap recheck plus Idle gate before one atomic, idempotent completion lifecycle.
- Define current-goal promotion as recording the completed loop's exact frozen goal Git HEAD and ordered filename-NUL-content goal-bundle SHA-256 in `.arca/current/current.md`, while `.arca/goal/` remains the cumulative current authority and stable front door. Preserve source, executable tests, `.arca/io/` evidence, permanent verification artifacts, and append-only `.arca/current/log.md`; remove only reproducible generated output, installed dependencies, caches, temporary fixtures, and equivalent transient products.
- After P4, close this ticket and residual as terminal and relocate exactly `.arca/issue/i-003-windows-powershell-preference/`, `.arca/issue/i-004-loop-cleanup-archive/`, `.arca/residual/residual-us-18.md`, `.arca/residual/residual-us-19.md`, `.arca/ticket/t-017-windows-powershell-guidance.md`, and `.arca/ticket/t-018-loop-completion-archive.md` beneath their owning `archive/` directories as one logical operation. Repair all affected live and archived local authority links before considering the operation complete.
- Do not retroactively relocate i-001/i-002, residual-us-01 through residual-us-17, or t-001 through t-016. Do not move `.arca/goal/`, delete permanent evidence or history, add a lifecycle runtime/command, modify product source, or broaden cleanup beyond transient reproducible state.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-018` | `.arca/goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement` (`US-19`) and `.arca/goal/test-list.md#verification` (`T-019`) | The repository's completed i-003 and i-004 loops plus an isolated archive-aware lifecycle fixture containing representative transient and permanent paths, terminal and nonterminal records, cross-record links, and archived-ID collisions | `test/t-018-loop-completion-archive.test.mjs` | Before P5, focused assertions fail because archive governance and owning archives are absent. After one completion pass, only transient state is absent; permanent authority/source/tests/evidence/history remain; current records the frozen US-19 HEAD and ordered bundle digest while `.arca/goal/` remains authoritative; exactly the six named terminal records are in owning archives; live scans exclude archive descendants; archived IDs remain allocated; active/nonterminal and legacy records remain live; every local authority link resolves. A second unchanged pass leaves the tree, current record, and lifecycle log unchanged. |

## Planned verification commands

Run from PowerShell (`pwsh`):

```powershell
node --test test/t-018-loop-completion-archive.test.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm run build
corepack pnpm test
```

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects reappearance of transient products, physical goal relocation, legacy migration, or loss of retained authority/evidence/history. | `PT-018-H1` |
| `Input/Routing` | covered | Exercises live and archived collection routing, terminal eligibility, archive exclusion, and identifier allocation with collisions. | `PT-018-H2` |
| `Lifecycle/Model` | covered | Enforces the final-green-gap and Idle gates, the terminal-only rule, the exact six-record operation, and rejection of active/nonterminal archival. | `PT-018-H3` |
| `Durability/Recovery` | covered | Repeats the unchanged lifecycle and compares the tree, current revision, and append-only transition history. | `PT-018-H4` |
| `Output/Filesystem` | covered | Enumerates live/archive trees, retained and removed paths, owning archive placement, and every repaired local link. | `PT-018-H5` |
| `Cross-Feature` | covered | Reconciles cleanup, goal promotion, archive governance, record statuses, bidirectional authority links, and permanent P4/P5 evidence. | `PT-018-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-018-H1` | `.arca/goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement` | Seed transient products beside permanent source, tests, `.arca/io/`, goal authority, and history, and include legacy terminal records outside the two selected loops. | `Regression` | Only transient products disappear; permanent and legacy records remain; `.arca/goal/` is not moved. | `repository-governance-maintainer` |
| `PT-018-H2` | `.arca/goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping` | Scan all three collections with archive descendants and duplicate next-ID candidates. | `Input/Routing` | Live work excludes archive descendants, while allocation still treats every archived ID as reserved. | `repository-governance-maintainer` |
| `PT-018-H3` | `.arca/goal/test-list.md#verification` | Attempt completion before the Idle gate and include active/nonterminal records beside the six eligible terminal records. | `Lifecycle/Model` | Premature completion is rejected; active/nonterminal records remain live; only the selected terminal set is archived after the gate. | `repository-governance-maintainer` |
| `PT-018-H4` | `.arca/goal/test-list.md#verification` | Apply the completed lifecycle a second time to unchanged state. | `Durability/Recovery` | Tree and current revision are byte-identical and no duplicate lifecycle log transition appears. | `repository-governance-maintainer` |
| `PT-018-H5` | `.arca/issue/archive/i-004-loop-cleanup-archive/spec.md#source-requests` | Enumerate every retained, removed, live, and archived path and resolve local Markdown destinations after relocation. | `Output/Filesystem` | All six records exist only in their owning archives, all protected paths remain, all affected links resolve, and no retroactive migration occurred. | `repository-governance-maintainer` |
| `PT-018-H6` | `.arca/goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping` | Cross-check cleanup classification, current-goal revision, terminal statuses, archive routing, IDs, and authority links as one lifecycle. | `Cross-Feature` | The lifecycle passes only when every component agrees on one atomic completed state. | `repository-governance-maintainer` |


## P5 Verification Evidence

- Initial PowerShell final-gap oracle recheck reproduced the intended P4 state: focused PT-018 ran 7 tests, passed 2, and failed 5 only on absent archive governance/directories, six still-live selected records, non-Idle current, and the six pending deterministic moves.
- `.arca/index.md` now reserves exactly the three owner archives, recursively excludes archive descendants from live scans while reserving their IDs, enforces terminal/active/Idle gates, defines all-or-none idempotent relocation and transient-only cleanup, preserves permanent artifacts and cumulative `.arca/goal/` authority, and distinguishes post-freeze link normalization from requirement semantics.
- The validated logical operation moved exactly i-003 and i-004, residual-us-18 and residual-us-19, and t-017 and t-018 from their live paths to the corresponding owner archives; PowerShell archive shape/status/legacy checks passed and the focused affected-link resolver reported no broken Markdown destination.
- The initial full-suite attempt after the required install/build exposed a P5 test-seam conflict: 37/38 Node tests passed and only PT-018's root `dist/` absence assertion failed because the verification build had just created it. PT-018 was corrected without weakening cleanup: `dist/` and `node_modules/` must be governance-classified and Git-untracked during verification, while the external post-verification check still requires their actual removal; `coverage/`, `temp/`, `tmp/`, and `.tmp/` remain directly required absent.
- PowerShell `corepack pnpm exec tsc --noEmit` passed with no diagnostics; `corepack pnpm run build` passed.
- PowerShell `corepack pnpm test` passed all 38/38 Node tests, including PT-017 and PT-018, and the 1/1 Vitest test with verification dependencies and build output present.
- Post-verification PowerShell cleanup removed the initially absent `dist/` and `node_modules/`, confirmed all six governed root transient paths absent, and confirmed `src/`, `test/` including PT-017/PT-018, `.arca/io/`, `.arca/goal/`, `standard/`, and append-only history retained.
- Final focused PT-018 passed 7/7 in the cleaned tree, including repaired links and a deterministic unchanged second pass with zero moves and exactly one completion transition.
- The current P2 semantic freeze remains HEAD `badbfd65c1452dd7f71d2415ac4e4e7ce4ca2d68` plus bundle `38312184d3553bf193e3c1bfd302d689ce3884f1e36d2bfa0399eece0b58ed3e`; the separately recomputed post-freeze link-normalized goal bundle is `ed09003ff1f6478b68d2f95cc3a40082dcaf8c8ef7a97eda90bdae07593f0097`.

## P5 Review Repair Evidence

- Independent review reopened this same archived ticket and residual in place. Expanded PT-018 ran red before the routing fix: 5/7 passed; only the missing overview/table/Mermaid/worked completion route and deliberately cleared reopened `output_revision` failed.
- The isolated fixture seeds all six governed transient roots; permanent source, executable test, and `.arca/io/` evidence; terminal, nonterminal, and active records; current and five-file goal state; cross-record links; owner archives; and archived identifier collisions. Test-local lifecycle execution rejects premature and active attempts without any tree mutation, performs one validated staged all-or-none pass, repairs links, appends once, and returns zero moves with byte-identical current/log/tree on the second pass.
- PT-018 independently recomputes current link-normalized goal filename-NUL-content SHA-256 `ed09003ff1f6478b68d2f95cc3a40082dcaf8c8ef7a97eda90bdae07593f0097` while retaining the P2 HEAD/bundle marker, resolves local Markdown links across all real retained `.arca/**/*.md` including live legacy records, and excludes only tokenized non-real blank-template destinations.
- Focused PT-018 passed 7/7; historical PT-015/PT-016 passed 14/14; TypeScript `--noEmit` and build passed; ordinary full `pnpm test` passed 38/38 Node plus 1/1 Vitest while its own install/build products existed.
- Verification-generated `node_modules/` and `dist/` were removed. PowerShell with `UNI_SPEC_FINAL_CLEAN_TREE=1` then passed PT-018 7/7 and directly required actual absence of `dist/`, `node_modules/`, `coverage/`, `temp/`, `tmp/`, and `.tmp/`; the fixture proves those removals independently in ordinary suite mode.