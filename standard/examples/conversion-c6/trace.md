# C6 conversion trace

## Observed source

- Three supplied inputs occur in encounter order: `legacy-a.md`, a tracker record without a source identifier, and an inline note without a source identifier.
- The tracker and inline inputs both lack IDs, so each contributes the exact source-ref literal `inline input (no source identifier)`; the two literals remain distinct and ordered.
- Three asks occur in encounter order: coordinated lookup accepted, cache-owner confirmation undecided, and legacy-path removal rejected.
- The source supplies two terms with separate meanings, one design proposal associated with `R-001, R-002`, and one verification pair associated with `R-001`.

## Expected written evidence

- Requests are assigned `R-001`, `R-002`, and `R-003` in encounter order and preserve accepted, undecided, and rejected dispositions with their source rationales.
- The source verification receives `T-001` in verification encounter order, with Procedure exactly `enumerate five files` and Expected Evidence exactly `observed entry listing`.
- `test-plan.md` contains only the source-provided check for R-001, appends exactly `No source verification provided for request IDs: R-002; source provides none.`, and omits rejected R-003 from the test plan.
- Origin is exactly `legacy-a.md; inline input (no source identifier); inline input (no source identifier)`, and source references appear only in index frontmatter.

## Inspection result

The written comparison records literal source-to-output facts, exact rows and associations, dispositions, statuses, origins, and complete post-write lint observation. Conversion is complete only after that observation is complete.
