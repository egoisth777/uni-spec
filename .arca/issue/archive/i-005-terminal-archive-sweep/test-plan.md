# Test plan

## Verification

These four source checks are accepted as the component scenarios of goal check [`T-020`](../../../goal/test-list.md#verification).

| Check ID | Request Refs | Procedure | Expected Evidence |
| --- | --- | --- | --- |
| T-001 | R-001, R-002, R-003 | Enumerate the direct children of `.arca/issue/`, `.arca/residual/`, and `.arca/ticket/` after the sweep. | Each collection directly contains only nonterminal records and its reserved `archive/`; no `integrated`/`rejected` issue, `satisfied` residual, or `done` ticket remains live. |
| T-002 | R-001, R-002, R-003 | Enumerate archived descendants and compare them with the pre-sweep terminal census, including records created by earlier loops. | Every terminal record, legacy ones included, is present exactly once beneath its owning archive with its bytes preserved apart from repaired links. |
| T-003 | R-001, R-002, R-003 | Resolve every retained local Markdown link across `.arca/`, and re-run retention and census checks that name moved record paths. | Every link resolves after repair; every preservation check resolves its record at the live or archived location and reports no loss. |
| T-004 | R-001, R-002, R-003 | Seed nonterminal records alongside terminal ones, run the sweep twice against unchanged state, and compare the tree and history. | Nonterminal records are never moved; the second run performs zero moves, leaves the tree unchanged, and appends no duplicate transition. |

## Goal/Test File Traces

| Goal/Test File | Status | Reverse Issue Refs |
| --- | --- | --- |
| `.arca/goal/index.md` | updated | [`R-001`](./spec.md), [`R-002`](./spec.md), [`R-003`](./spec.md) |
| `.arca/goal/ubi-lang.md` | updated | [`R-001`](./spec.md), [`R-002`](./spec.md), [`R-003`](./spec.md) |
| `.arca/goal/spec.md` | updated | [`R-001`](./spec.md), [`R-002`](./spec.md), [`R-003`](./spec.md) |
| `.arca/goal/design.md` | updated | [`R-001`](./spec.md), [`R-002`](./spec.md), [`R-003`](./spec.md) |
| `.arca/goal/test-list.md` | updated | [`R-001`](./spec.md), [`R-002`](./spec.md), [`R-003`](./spec.md) |

## Contributor Authority/Schema Traces

| Authority or Schema Artifact | Status | Integration and Reverse Refs |
| --- | --- | --- |
| `AGENTS.md` | unaffected | Routing to `.arca/index.md` is unchanged. |
| `.arca/index.md` | updated | Working rules widen owner-archive relocation from loop-owned to every terminal record ([`R-001`](./spec.md), [`R-002`](./spec.md), [`R-003`](./spec.md)). |
