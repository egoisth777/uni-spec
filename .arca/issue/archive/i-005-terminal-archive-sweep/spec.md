# Specification

## Source requests

All three incoming requests are `accepted` as one repository-wide sweep requirement; none is `rejected`, `duplicate`, `deferred`, or `undecided`.

| Request ID | Source ask | Disposition | Rationale | Accepted Forward Authority Refs |
| --- | --- | --- | --- | --- |
| R-001 | Move every integrated issue into `.arca/issue/archive/`, not only the completed loop's. | accepted | Issue status `integrated` is already the terminal eligibility condition; restricting relocation to one loop leaves earlier terminal records live for no lifecycle reason. | Goal [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement); [sweep mapping](../../../goal/design.md#integrated-repository-wide-terminal-archive-mapping); check [`T-020`](../../../goal/test-list.md#verification) |
| R-002 | Move every implemented ticket into `.arca/ticket/archive/`. | accepted | Ticket status `done` is terminal, and a live ticket collection that lists finished work misreports what remains to be built. | Goal [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement); [sweep mapping](../../../goal/design.md#integrated-repository-wide-terminal-archive-mapping); check [`T-020`](../../../goal/test-list.md#verification) |
| R-003 | Move every satisfied residual into `.arca/residual/archive/`. | accepted | Residual status `satisfied` is terminal, and the live gap scan only needs `missing` or `partial` records to decide the next loop. | Goal [`US-20`](../../../goal/spec.md#integrated-repository-wide-terminal-archive-requirement); [sweep mapping](../../../goal/design.md#integrated-repository-wide-terminal-archive-mapping); check [`T-020`](../../../goal/test-list.md#verification) |
