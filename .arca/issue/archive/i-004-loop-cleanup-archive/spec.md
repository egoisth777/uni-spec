# Specification

## Source requests

All three incoming requests are `accepted` as one end-of-loop lifecycle requirement; none is `rejected`, `duplicate`, `deferred`, or `undecided`.

| Request ID | Source ask | Disposition | Rationale | Accepted Forward Authority Refs |
| --- | --- | --- | --- | --- |
| R-001 | At the end of each completed loop, clean all transient artifacts. | accepted | Cleanup is safe and repeatable when limited to reproducible working products and coupled to explicit preservation of permanent authority, source, executable tests, evidence, and append-only history. | Goal [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement); [lifecycle mapping](../../../goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping); check [`T-019`](../../../goal/test-list.md#verification) |
| R-002 | At the end of each completed loop, move the completed goal to current. | accepted | Recording the loop's frozen goal HEAD and ordered bundle digest in current state satisfies promotion without physically relocating `.arca/goal/`, preserving the cumulative authority and hundreds of stable repository links. | Goal [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement); [lifecycle mapping](../../../goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping); check [`T-019`](../../../goal/test-list.md#verification) |
| R-003 | At the end of each completed loop, archive completed issue, residual, and ticket records under an `archive/` directory within each record's owning collection. | accepted | Terminal-only, loop-owned, atomic relocation with link repair, live-scan exclusions, and archived-ID reservation preserves history without hiding active work or permitting identifier reuse. | Goal [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement); [lifecycle mapping](../../../goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping); check [`T-019`](../../../goal/test-list.md#verification) |
