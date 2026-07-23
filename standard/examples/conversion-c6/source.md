# C6 source record

## Source facts

- `source-ref`: legacy-a.md
- `source-ref`: inline input (no source identifier)
- `source-ref`: inline input (no source identifier)
- `input-kind`: tracker record without a source identifier
- `input-kind`: inline note without a source identifier
- `title`: Multi Source
- `term`: cache key
- `meaning`: the stable lookup key carried between source records.
- `term`: source ledger
- `meaning`: the ordered record of supplied inputs.
- `ask`: Coordinate the cache lookup across every supplied source.
- `disposition`: accepted
- `rationale`: The supplied records agree that coordinated lookup is required.
- `ask`: Confirm the cache owner before changing invalidation behavior.
- `disposition`: undecided
- `rationale`: The source leaves ownership unresolved pending confirmation.
- `ask`: Remove the legacy lookup path.
- `disposition`: rejected
- `rationale`: The source explicitly rejects removing the legacy path.
- `proposal`: Keep one ordered source ledger and route each source fact to its owning aspect.
- `proposal-request-refs`: R-001, R-002
- `verification-procedure`: enumerate five files
- `expected-evidence`: observed entry listing
- `verification-request-refs`: R-001
- `unresolved`: Which team owns cache invalidation after the sources are merged?
- `expected-output`: standard/examples/conversion-outputs/i-006-multi-source
