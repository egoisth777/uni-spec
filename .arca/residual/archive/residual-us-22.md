# Residual: residual-us-22

```yaml
residual-id: "residual-us-22"
goal-requirement-ref: "US-22"
frozen-goal-bundle-revision: "HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 25f314c369993de023e820b531542a47a8c6d4293e6f1af53f88fe5b660cc312"
implementation-revision: "Uncommitted working tree on HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504 with the P1 fold-in applied; cli/ vitest 64/64 green."
concrete-evidence-refs:
  - "cli/src/core/issue/identity.ts:46 (candidate pattern ^i-([0-9]+)- matches malformed remainders) and :152-170 (every positive parsed value is reserved; i-000-* parses to zero and is not reserved)"
  - "cli/src/core/issue/identity.ts:172-189 (smallest unused positive integer, rendered with at least three digits)"
  - "cli/src/core/issue/identity.ts:129-145 (lowercase, maximal non-ASCII-alphanumeric runs to hyphens, trim, first four tokens, untitled-issue for zero tokens, -issue appended to one token)"
  - "cli/src/core/issue/identity.ts:218-248 (only sibling directories of the target parent are inspected)"
  - "cli/src/core/issue/scaffold.ts:205-206 and :168-171 (the allocated issueId is both the directory name and the index.md issue-id, written once)"
  - "cli/test/t-020-issue-identity.vitest.test.ts:30-65 (malformed i-001-old and i-002-, number gaps, zero rejection, wide rendering), :77-125 (slug edge cases), :200-228 (identity frozen against a later title change)"
  - "Verification run: cli/ vitest 64/64 green, including all 23 t-020 identity checks"
classification-rationale: "satisfied: every clause of US-22 has a direct implementation and an executable check. Allocation reserves malformed candidates, rejects zero, pads to at least three digits, and picks the smallest unused positive integer; the slug algorithm implements all four normalization steps plus both fallbacks; and identity is written once into the directory name and index.md issue-id and survives a later title change. T-022's three procedures - the seeded sibling collection, the four title cases, and the post-creation title change - are each covered by a passing test."
status: "satisfied"
required-test-refs:
  - "T-022"
```

Forward authority: [`US-22`](../../goal/spec.md#integrated-uni-spec-applier-requirements); [applier mapping](../../goal/design.md#integrated-uni-spec-applier-mapping); check [`T-022`](../../goal/test-list.md#verification). Reverse source: [`R-002`](../../issue/archive/i-006-uni-spec-issue-generation/spec.md#source-requests).
