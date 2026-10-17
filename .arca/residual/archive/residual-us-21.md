# Residual: residual-us-21

```yaml
residual-id: "residual-us-21"
goal-requirement-ref: "US-21"
frozen-goal-bundle-revision: "HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 25f314c369993de023e820b531542a47a8c6d4293e6f1af53f88fe5b660cc312"
implementation-revision: "t-026 P5 working tree on HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; cli/ tsc clean and vitest 83/83, root node --test 46/47 with only the t-029-owned PT-013 red."
concrete-evidence-refs:
  - "cli/schemas/uni-spec/schema.yaml - five artifacts index, ubi-lang, spec, design, test-plan; each generates its aspect filename at the package root with no nested path and no sixth entry; requires edges are exactly index:[] , ubi-lang:[index], spec:[index], design:[spec], test-plan:[spec]"
  - "cli/src/core/issue/status.ts - read-only status model reporting the five aspects, n/5 progress, and dependency blocking"
  - "cli/src/commands/issue.ts - `uni-spec issue status [target]` registered alongside `new` and `lint`, with absolute, relative, and collection-member target routing"
  - "cli/src/core/issue/scaffold.ts - lifecycle reads reject unterminated, missing, or unreadable index frontmatter with an actionable filename and problem instead of inventing a status"
  - "cli/test/t-026-five-aspect-schema-status.vitest.test.ts - PT-026-a five-aspect vocabulary with no proposal/specs/tasks; PT-026-b index unblocked and design/test-plan blocked until spec is complete; PT-026-c schema shape and edges; PT-026-d integrated status read through the built cli/bin/uni-spec.js rather than the helper; PT-026-e status writes nothing into the package; PT-026-f malformed frontmatter exits non-zero naming the file"
  - "Verification run: cli/ npx tsc -p tsconfig.json clean, cli/ vitest 83/83 across 7 files, root node --test 46/47"
classification-rationale: "satisfied: the schema half that was absent now exists inside cli/ and declares exactly the five aspects with the dependency order US-21 states, and the status command reports n/5 in five-aspect vocabulary with design and test-plan gated on spec. The package-boundary and frontmatter-state halves that were already implemented remain proven, and the gap where lifecycle state was only exercised through a helper is closed by driving PT-026-d through the built binary. All three of T-021's procedures now have a passing executable check."
status: "satisfied"
required-test-refs:
  - "T-021"
  - "PT-026"
```

Forward authority: [`US-21`](../../goal/spec.md#integrated-uni-spec-applier-requirements); [applier mapping](../../goal/design.md#integrated-uni-spec-applier-mapping); check [`T-021`](../../goal/test-list.md#verification). Reverse sources: [`R-001`, `R-003`, `R-005`](../../issue/archive/i-006-uni-spec-issue-generation/spec.md#source-requests). Closed by [`t-026`](../../ticket/archive/t-026-five-aspect-schema-status.md).
