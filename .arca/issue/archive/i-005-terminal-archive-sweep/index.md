---
issue-id: "i-005-terminal-archive-sweep"
origin: "User request (verbatim): clean-up the runtime artifacts by moving integrated issues to archive/, all implemented tickets to archive, and do the same thing to residuals."
status: "integrated"
---

# Terminal archive sweep

## Summary

The three source requests are accepted cohesively as goal requirement [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement): the completion lifecycle selects records by terminal status alone, so every `integrated` or `rejected` issue, `satisfied` residual, and `done` ticket — including records left live by earlier loops — moves beneath its owning archive, and each live collection keeps only nonterminal records and its reserved `archive/`.

## Integrated goal requirement

| Issue requirements | Goal requirement | Decision |
| :--- | :--- | :--- |
| `R-001`, `R-002`, `R-003` | [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement) | accepted cohesively |

The bidirectional authority map is this issue's [specification](./spec.md) ↔ the goal [specification](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement); sweep mechanics are mapped from the issue [design](./design.md) to the goal [design](../../../goal/design.md#integrated-repository-wide-terminal-archive-mapping), and the four source checks roll up to goal check [`T-020`](../../../goal/test-list.md#verification).

## Routes

| Need | File |
| --- | --- |
| Terms | [ubi-lang.md](./ubi-lang.md) |
| Source requests | [spec.md](./spec.md) |
| Proposed design | [design.md](./design.md) |
| Verification | [test-plan.md](./test-plan.md) |
