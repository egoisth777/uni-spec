# Residual: residual-us-23

```yaml
residual-id: "residual-us-23"
goal-requirement-ref: "US-23"
frozen-goal-bundle-revision: "HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 25f314c369993de023e820b531542a47a8c6d4293e6f1af53f88fe5b660cc312"
implementation-revision: "Uncommitted working tree on HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504 with the P1 fold-in applied; cli/ vitest 64/64 green."
concrete-evidence-refs:
  - "cli/src/core/templates.ts:21-35 (aspect templates are resolved and read from standard/templates/issue/<file> at runtime)"
  - "cli/src/core/issue/scaffold.ts:210-215 (every aspect is generated from that runtime read)"
  - "cli/src/core/issue/scaffold.ts:77-97 and :153-182 (the four non-index aspects are copied unchanged; index changes are restricted to documented placeholder substitutions)"
  - "cli/ inventory holds no second Markdown template copy: cli/src has only cli.ts, commands/issue.ts, core/issue/{collection,identity,lint,scaffold}.ts, and core/templates.ts"
  - "cli/test/t-021-issue-scaffold.vitest.test.ts:141-208 (byte-for-byte identity of the four unchanged aspects and only documented index substitutions) and :211-225 (a required index-template change raises TemplateDriftError)"
  - "Verification run: cli/ vitest 64/64 green, including the 14 t-021 scaffold checks"
classification-rationale: "satisfied: standard/templates/issue/ is the single template authority at runtime, so generated output is byte-identical to its source apart from documented substitution, and an edit to a standard template changes the next generation by construction rather than by a synchronization step. No template is embedded, so US-23's conditional embedded-drift clause has nothing to guard; the equivalent protection already exists as TemplateDriftError, which fails when the index template stops carrying a substitution the generator requires. T-023's three procedures are each covered by a passing test."
status: "satisfied"
required-test-refs:
  - "T-023"
```

Forward authority: [`US-23`](../../goal/spec.md#integrated-uni-spec-applier-requirements); [applier mapping](../../goal/design.md#integrated-uni-spec-applier-mapping); check [`T-023`](../../goal/test-list.md#verification). Reverse source: [`R-004`](../../issue/archive/i-006-uni-spec-issue-generation/spec.md#source-requests).
