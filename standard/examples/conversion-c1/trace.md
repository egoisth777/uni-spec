# C1 conversion trace

## Observed source

- Three supplied inputs occur in encounter order: `legacy-a.md`, a tracker record without a source identifier, and an inline note without a source identifier.
- The tracker and inline inputs both lack IDs, so each contributes the exact source-ref literal `inline input (no source identifier)`; the two literals remain distinct and ordered.
- The cumulative source supplies title `Multi Source`, terms `cache key` and `source ledger` with separate meanings, three asks with dispositions and rationales, one proposal associated with `R-001, R-002`, and one verification associated with `R-001`.
- The source leaves cache-invalidation ownership unresolved.

## Expected written evidence

- Exact origin serialization is `legacy-a.md; inline input (no source identifier); inline input (no source identifier)` with the exact `; ` delimiter and no deduplication.
- Terms route to `ubi-lang.md`; asks route to `spec.md`; the proposal routes to `design.md` with source request associations; source verification routes to `test-plan.md` with its source request association; the unresolved fact remains in index open questions.
- Requests receive `R-001`, `R-002`, and `R-003`; the source verification receives `T-001`; Procedure is `enumerate five files` and Expected Evidence is `observed entry listing`.
- The origin is not duplicated into companion authority, and no source detail is invented.

## Inspection result

The cumulative multi-reference encoding, exact source rows, request associations, and source-grounded routes compare equal to the expected output. Reordering supplied inputs would change the trace order deterministically.
