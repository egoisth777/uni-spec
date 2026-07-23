# Specification

The source asks are recorded here; the [design](./design.md) and [verification](./test-plan.md) files reference these stable IDs.

## Source requests

| Request ID | Source ask | Disposition | Rationale |
| --- | --- | --- | --- |
| R-001 | Require each companion aspect to declare its exact heading, columns, and absence alternative. | accepted | Exact ownership makes inspection deterministic without adding runtime behavior. |
| R-002 | Require source verification to map only to accepted or undecided requests and preserve uncovered IDs explicitly. | undecided | The source has not settled whether every eligible request has supplied evidence. |
| R-003 | Permit a design proposal to mention a rejected source request for traceability. | rejected | Rejected requests remain source records but cannot become verification inputs. |
