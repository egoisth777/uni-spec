# Design

## Proposed design

| Request IDs | Proposal |
| --- | --- |
| R-001 | Apply goal [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement): after the final green gap recheck satisfies the Idle gate, remove only reproducible generated output, installed dependencies, caches, temporary fixtures, and equivalent transient working products; preserve authority, source, executable tests, evidence, nonterminal records, and append-only history. |
| R-002 | Apply goal [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement): record the completed loop's exact frozen goal Git HEAD and ordered filename-NUL-content goal-bundle SHA-256 in `.arca/current/current.md`, retaining `.arca/goal/` as the cumulative current authority and stable front door rather than physically relocating it. |
| R-003 | Apply goal [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement): reserve each owning collection's `archive/`, atomically move only loop-owned terminal records with affected links repaired, exclude archive descendants from live shape/gap/ticket scans while retaining their IDs in allocation, and never archive active or nonterminal records. |
