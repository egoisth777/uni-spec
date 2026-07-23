# C6 comparison oracle

This is a documentary source-to-output comparison; it is not converter output.

## Literal source facts and output comparisons

| Source fact | Output location | Comparison |
| --- | --- | --- |
| `legacy-a.md`; `inline input (no source identifier)`; `inline input (no source identifier)` | `index.md` origin | `legacy-a.md; inline input (no source identifier); inline input (no source identifier)` in encounter order, without deduplication. |
| `cache key` / `the stable lookup key carried between source records.` | `ubi-lang.md` | Exact Term and Meaning cells match the source row. |
| `source ledger` / `the ordered record of supplied inputs.` | `ubi-lang.md` | Exact Term and Meaning cells match the source row. |
| `R-001` / `Coordinate the cache lookup across every supplied source.` / `accepted` / `The supplied records agree that coordinated lookup is required.` | `spec.md` | Exact ordered request row, including source-grounded rationale. |
| `R-002` / `Confirm the cache owner before changing invalidation behavior.` / `undecided` / `The source leaves ownership unresolved pending confirmation.` | `spec.md` | Exact ordered request row, including source-grounded rationale. |
| `R-003` / `Remove the legacy lookup path.` / `rejected` / `The source explicitly rejects removing the legacy path.` | `spec.md` | Exact ordered request row, including source-grounded rationale. |
| `R-001, R-002` / `Keep one ordered source ledger and route each source fact to its owning aspect.` | `design.md` | Exact Request IDs association and proposal cells match the source. |
| `R-001` / `enumerate five files` / `observed entry listing` | `test-plan.md` T-001 | Exact Request Refs, Procedure, and Expected Evidence cells match the source. |
| No verification source fact for `R-002`; `R-003` is rejected | `test-plan.md` | Exact uncovered statement names R-002; R-003 is omitted from the test plan. |

## Expected routes and identity

Terms route to `ubi-lang.md`; asks route to `spec.md`; proposal `R-001, R-002` routes to `design.md`; source verification `R-001` routes to `test-plan.md`; summary/open questions route to `index.md`. Request associations are copied from source rows, not inferred. Origin is the sole source-reference serialization and is not duplicated in companions. The output folder is `i-006-multi-source`, and its index status is `pending`.

## Complete post-write lint observation

[`conversion-lint-observations.md`](../conversion-lint-observations.md) records each of the five output folders against LINT-01 through LINT-07, with specific observed evidence, zero findings, and PASS only after all rules were evaluated. A post-lint failure would instead be recorded as a complete finding report and would not be called complete.
