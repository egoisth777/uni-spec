---
ticket-id: "t-019-terminal-archive-sweep"
residual-ids:
  - "residual-us-20"
behavior-refs:
  - ".arca/goal/spec.md#integrated-repository-wide-terminal-archive-requirement (US-20)"
  - ".arca/goal/test-list.md#verification (T-020)"
design-refs:
  - ".arca/goal/design.md#integrated-repository-wide-terminal-archive-mapping"
  - ".arca/issue/i-005-terminal-archive-sweep/design.md#proposed-design"
planned-test-refs:
  - "PT-019"
dependencies:
  - "t-018-loop-completion-archive"
status: "done"
---

# Ticket: t-019-terminal-archive-sweep

## Vertical slice

Widen the completion lifecycle from loop-owned relocation to a terminal-status sweep, then run that sweep once against this repository: every `integrated` issue, `satisfied` residual, and `done` ticket left live by earlier loops moves beneath its owning archive with links repaired, and the retention proofs that name those records become location-independent so the sweep is never observable as loss.

## Scope and implementation boundaries

- Update `.arca/index.md` so archive selection is by terminal status alone across every collection and loop, so each live collection directly holds only nonterminal records plus its reserved `archive/`, and so retention, preservation, and census checks resolve records at their live-or-archived location. Keep the existing terminal-eligibility, Idle-gate, atomicity, idempotency, link-repair, archive-aware-scan, and archived-ID-reservation terms unchanged.
- Relocate as one logical operation: `.arca/issue/i-001-purge-sanitization/`, `.arca/issue/i-002-selective-cli-recovery/`, `.arca/residual/residual-us-01.md` through `.arca/residual/residual-us-17.md`, and `.arca/ticket/t-001-five-file-package.md` through `.arca/ticket/t-016-reproducible-recovery-proof.md`. Repair every affected local Markdown link in the moved records, in `.arca/goal/`, and in any other retained document before the operation counts as complete.
- Make `test/t-015-purge-preservation.test.mjs` archive-aware: retained `.arca` record routes resolve live or archived, and residual/ticket censuses count live plus archived records. Update the recorded frozen-revision constants in `test/t-018-loop-completion-archive.test.mjs` to this loop's P2 values. Change no evidence JSON under `.arca/io/`.
- Do not move `.arca/goal/`, `.arca/tpl/`, `.arca/current/`, or `.arca/io/`. Do not archive `i-005`, `residual-us-20`, or this ticket while they are active; they are swept by this loop's own completion lifecycle after the final green gap recheck. Do not delete any record, add a lifecycle runtime or command, or modify product source under `src/`.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-019` | `.arca/goal/spec.md#integrated-repository-wide-terminal-archive-requirement` (`US-20`) and `.arca/goal/test-list.md#verification` (`T-020`) | The real repository collections after the sweep, plus an isolated multi-loop fixture holding legacy terminal records, nonterminal records, an `active_refs` record, and cross-record links | `test/t-019-terminal-archive-sweep.test.mjs` | Before P5 the assertions fail because governance still selects loop-owned records and every legacy terminal record is live. After P5: no live collection directly contains a terminal record; the exact legacy set exists once beneath its owning archive; every `.arca` link and heading fragment resolves; nonterminal and `active_refs` records never move; a second unchanged sweep plans zero moves and appends no duplicate transition; and retention/census checks resolve moved records at their archived location. |

## Planned verification commands

Run from PowerShell (`pwsh`):

```powershell
node --test test/t-019-terminal-archive-sweep.test.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm run build
corepack pnpm test
```

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects a reappearing live terminal record, a record deleted rather than moved, or a retention proof that reads archival as loss. | `PT-019-H1` |
| `Input/Routing` | covered | Exercises mixed terminal and nonterminal input across all three collections, including legacy loops and `active_refs` protection. | `PT-019-H2` |
| `Lifecycle/Model` | covered | Enforces terminal-status-only selection, the live collection remainder, and the unchanged US-19 gates. | `PT-019-H3` |
| `Durability/Recovery` | covered | Repeats the sweep against unchanged state and compares tree, statuses, and append-only history. | `PT-019-H4` |
| `Output/Filesystem` | covered | Enumerates live and archived trees, byte preservation apart from repaired links, and every resolved local link. | `PT-019-H5` |
| `Cross-Feature` | covered | Reconciles the sweep with US-19 cleanup/promotion, archive-aware scans, ID reservation, and the historical purge/recovery proofs. | `PT-019-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-019-H1` | `.arca/goal/spec.md#integrated-repository-wide-terminal-archive-requirement` | A sweep that loses or hides a record would violate location-independent preservation. | `Regression` | Pre-sweep terminal census equals the archived census; every swept record resolves at exactly one location. | `arca-maintainer` |
| `PT-019-H2` | `.arca/goal/spec.md#integrated-repository-wide-terminal-archive-requirement` | Selection is by status, and active work must be protected. | `Input/Routing` | Fixture nonterminal and `active_refs` records stay live while every terminal record moves. | `arca-maintainer` |
| `PT-019-H3` | `.arca/goal/design.md#integrated-repository-wide-terminal-archive-mapping` | The live collection remainder is the observable form of terminal-only selection. | `Lifecycle/Model` | Direct children of each collection are nonterminal records plus `archive/` only. | `arca-maintainer` |
| `PT-019-H4` | `.arca/goal/test-list.md#verification` | Idempotency is required for a repeatable lifecycle. | `Durability/Recovery` | Second unchanged sweep plans zero moves, leaves the tree digest equal, and appends no duplicate transition. | `arca-maintainer` |
| `PT-019-H5` | `.arca/goal/spec.md#integrated-repository-wide-terminal-archive-requirement` | Relocation must repair links without rewriting content. | `Output/Filesystem` | Every `.arca` link and heading fragment resolves; moved record bytes differ only in repaired link targets. | `arca-maintainer` |
| `PT-019-H6` | `.arca/goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement` | The sweep must not break the earlier purge, recovery, and lifecycle proofs. | `Cross-Feature` | Archive-aware `PT-015` retention and census checks and `PT-018` lifecycle checks stay green after the sweep. | `arca-maintainer` |

## P5 evidence

| Claim | Evidence |
| --- | --- |
| Governance selects by terminal status alone | `.arca/index.md#end-of-loop-cleanup-and-owner-archives` replaces loop-owned relocation with a terminal-status sweep and adds the live collection remainder plus live-or-archived resolution. |
| The legacy set moved as one operation | 35 records relocated — `i-001`, `i-002`, `residual-us-01`..`residual-us-17`, `t-001`..`t-016` — with 7 documents link-repaired; `.arca/issue/`, `.arca/residual/`, and `.arca/ticket/` now hold only this loop's active records plus `archive/`. |
| Nothing was lost | `PT-019` resolves every governed record at exactly one location, `PT-015` resolves retained recovery files live-or-archived and censuses live plus archived records, and every local Markdown link and heading fragment across `.arca/` resolves. |
| Frozen evidence untouched | `.arca/io/*.json` and `.arca/current/log.md` keep their original wording; only Markdown links were repaired. |
| Verification | `node --test test/*.test.mjs` 46/46, `vitest` 1/1, `tsc --noEmit` clean, `node build.js` clean. |
