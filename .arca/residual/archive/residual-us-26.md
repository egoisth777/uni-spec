# Residual: residual-us-26

```yaml
residual-id: "residual-us-26"
goal-requirement-ref: "US-26"
frozen-goal-bundle-revision: "HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 25f314c369993de023e820b531542a47a8c6d4293e6f1af53f88fe5b660cc312"
implementation-revision: "t-029 P5 working tree on HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; root tsc clean, root build clean, root node --test 52/52, cli/ tsc clean and vitest 91/91."
concrete-evidence-refs:
  - "Removed from the frozen root heritage: src/commands/issue.ts, src/core/issue/identity.ts, src/core/issue/lint.ts, src/core/issue/scaffold.ts, schemas/uni-spec/schema.yaml, the registerIssueCommand import and its invocation in src/cli/index.ts, and the four duplicate root tests t-020-issue-identity, t-021-issue-scaffold, t-023-issue-lint, and t-024-lint-exit-scope"
  - "test/t-029-heritage-freeze.test.mjs - PT-029-a no applier source outside cli/ and no root source importing the applier core or referencing registerIssueCommand; PT-029-b no issue route reachable from the root CLI, matched on command-registration and registry-entry shape; PT-029-c the applier binary exposes issue new, lint, and status, exposes none of change/workset/doctor/telemetry, and its only bin name is uni-spec; PT-029-d no applier test name exists in both test/ and cli/test/ and no root test name is applier-shaped; PT-029-f the guard's predicates are exercised directly, so a newly added duplicate falls inside their domain"
  - ".arca/io/t-013-package-build-closure.json - restored to its committed baseline of 167 source modules and 80 external references; the removals returned src/ to exactly that recorded state, and PT-013 passes again with no evidence edited to fit"
  - "PT-029-h deletion gate discharged before any removal: root and cli copies of t-020 were byte-identical; t-021 and t-024 had no root-only assertion; t-023's eight root-only assertions were six weak per-field non-emptiness checks that the cli copy's full six-field deep equality strictly subsumes, plus two invariants that hold independently of the trace - every finding's ruleId is a known LINT_RULE_ID, and line is null or positive - which were carried over into cli/test/t-023-issue-lint.vitest.test.ts before deletion"
  - "PT-029-g regression proof: root npx tsc --noEmit clean, node build.js clean, root node --test 52/52, cli/ npx tsc clean, cli/ vitest 91/91"
classification-rationale: "satisfied: the violation was the reverse of the one US-26 anticipated - the cli/ surface was already correct, and the frozen root heritage had gained applier sources, a schema, a registered command, and a diverging duplicate test suite. All of that is removed and the freeze is now guarded by a detector rather than a snapshot, so a future applier addition at the root fails a check instead of passing unnoticed. The recovery requirements US-13 through US-17 are unharmed: the heritage still compiles, builds, and passes its whole suite. Removing the inherited change, archive, spec, store, workset, view, doctor, context, and telemetry commands stays out of scope, because US-26 gates that prune on cli/ fully replacing the heritage, which has not happened."
status: "satisfied"
required-test-refs:
  - "T-026"
  - "PT-029"
```

Forward authority: [`US-26`](../../goal/spec.md#integrated-uni-spec-applier-requirements); [applier mapping](../../goal/design.md#integrated-uni-spec-applier-mapping); check [`T-026`](../../goal/test-list.md#verification). Reverse source: [`R-009`](../../issue/archive/i-006-uni-spec-issue-generation/spec.md#source-requests). Closed by [`t-029`](../../ticket/archive/t-029-heritage-freeze-prune.md).
