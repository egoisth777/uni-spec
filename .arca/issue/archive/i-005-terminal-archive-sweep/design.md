# Design

## Proposed design

| Request IDs | Proposal |
| --- | --- |
| R-001, R-002, R-003 | Apply goal [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement): widen the completion lifecycle's selection set from the completed loop's terminal records to every terminal record in every collection, keeping the existing terminal-only eligibility, atomic all-or-nothing relocation, link repair and validation, archive-aware live scans, and archived-identifier reservation unchanged. |
| R-001, R-002, R-003 | Apply goal [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement): after a sweep, `.arca/issue/`, `.arca/residual/`, and `.arca/ticket/` directly contain only nonterminal records plus their reserved `archive/`. |
| R-001, R-002, R-003 | Apply goal [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement): every retention or preservation check that names a record path resolves it at its live or archived location, and every collection census counts live and archived records together, so a sweep is never observable as deletion. |

This file is incoming evidence. Integrated mechanics remain authoritative only in the accepted forward authority.
