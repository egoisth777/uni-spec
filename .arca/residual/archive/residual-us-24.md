# Residual: residual-us-24

```yaml
residual-id: "residual-us-24"
goal-requirement-ref: "US-24"
frozen-goal-bundle-revision: "HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 25f314c369993de023e820b531542a47a8c6d4293e6f1af53f88fe5b660cc312"
implementation-revision: "t-027 P5 working tree on HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; cli/ tsc clean and vitest 83/83, root node --test 46/47 with only the t-029-owned PT-013 red."
concrete-evidence-refs:
  - "cli/src/core/issue/lint.ts LINT-03 - the metadata parser now rejects unmatched quoted scalars, inline collection shapes, and tab-indented nested metadata; the `origin: \"unterminated` case that previously returned PASS is now a finding"
  - "cli/src/core/issue/lint.ts LINT-04 - every unresolved request reference in a test-plan row is reported, so a mixed row such as `R-001, R-999` fails on R-999 instead of passing because R-001 resolved"
  - "cli/src/core/issue/lint.ts LINT-06 - destinations resolve against the observed regular files and their kinds rather than the static five-name list, so a link to a spec.md that is actually a symlink records a finding, and an extra observed regular file is not a valid destination"
  - "cli/src/core/issue/lint.ts LINT-07 - each candidate requirement is attributed to its US-nn identifier; only US-01..US-12 are reported, US-13..US-26 are ignored, the unlabelled requirement fallback the L5 fixture needs is preserved, and an absent or unreadable goal root is an explicit observation instead of silence"
  - "cli/src/core/issue/lint.ts - the L5 remediation text now matches standard/examples/lint-findings/l5.json; the implementation was changed rather than the published standard"
  - "cli/test/t-023-issue-lint.vitest.test.ts - the trace oracle now deep-compares ordered findings across all six fields instead of only asserting expected and remediation are non-empty"
  - "cli/test/t-027-lint-rule-fidelity.vitest.test.ts - PT-027-a through PT-027-i, including PT-027-d which pins the two probe cases: `US-01: Implement a linter.` fires and `US-21 requires a linter.` does not"
  - "Verification run: cli/ vitest 83/83 across 7 files, of which 12 are PT-027; root node --test 46/47"
classification-rationale: "satisfied: all five proven defects are fixed and each is pinned by a test that fails against the old behavior. The global contract US-24 shares with the standard is unchanged and still proven - all seven rules evaluate in order with no short-circuit, findings carry exactly the six fields, PASS requires zero findings, and the exit code stays coupled to the findings. The strengthened trace oracle means a future divergence from the published examples cannot pass silently, which was the hole that let the L5 remediation drift in the first place."
status: "satisfied"
required-test-refs:
  - "T-024"
  - "PT-027"
```

Forward authority: [`US-24`](../../goal/spec.md#integrated-uni-spec-applier-requirements); [applier mapping](../../goal/design.md#integrated-uni-spec-applier-mapping); check [`T-024`](../../goal/test-list.md#verification). Reverse source: [`R-006`](../../issue/archive/i-006-uni-spec-issue-generation/spec.md#source-requests). Closed by [`t-027`](../../ticket/archive/t-027-lint-rule-fidelity.md).
