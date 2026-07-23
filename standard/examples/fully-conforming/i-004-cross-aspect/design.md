# Design

The proposed structure maps accepted and rejected source context to distinct artifact responsibilities; verification eligibility is enforced separately in the [test plan](./test-plan.md).

## Proposed design

| Request IDs | Proposal |
| --- | --- |
| R-001, R-003 | Keep one exact contract table in each companion file, while allowing rejected source records to remain visible only as design context. |
| R-002 | Record verification checks by deterministic encounter-order IDs and preserve an exact no-source statement when eligible requests lack evidence. |
