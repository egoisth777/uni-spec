---
issue-id: "i-004-loop-cleanup-archive"
origin: "User request (verbatim): At end of each completed loop, clean all transient artifacts; move goal to current; archive completed issue/residual/ticket under archive/ within their owning folders."
status: "integrated"
---

# End-of-loop cleanup and archive lifecycle

## Summary

The three source requests are accepted cohesively as goal requirement [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement): after the final green gap recheck satisfies the Idle gate, one idempotent lifecycle removes only transient working artifacts, records the loop's frozen goal HEAD and bundle digest in current state while retaining `.arca/goal/` as the cumulative authority, and atomically archives only that loop's terminal issue, residual, and ticket records beneath their owning collections with links repaired.

## Integrated goal requirement

| Issue requirements | Goal requirement | Decision |
| :--- | :--- | :--- |
| `R-001`, `R-002`, `R-003` | [`US-19`](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement) | accepted cohesively |

The bidirectional authority map is this issue's [specification](./spec.md) ↔ the goal [specification](../../../goal/spec.md#integrated-end-of-loop-archive-lifecycle-requirement); lifecycle mechanics are mapped from the issue [design](./design.md) to the goal [design](../../../goal/design.md#integrated-end-of-loop-archive-lifecycle-mapping), and the four source checks roll up to goal check [`T-019`](../../../goal/test-list.md#verification).

## Routes

| Need | File |
| --- | --- |
| Terms | [ubi-lang.md](./ubi-lang.md) |
| Source requests | [spec.md](./spec.md) |
| Proposed design | [design.md](./design.md) |
| Verification | [test-plan.md](./test-plan.md) |
