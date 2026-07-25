# Residual: residual-us-15

```yaml
residual-id: "residual-us-15"
goal-requirement-ref: "US-15"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-003"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#candidate-path-groups"
  - "historical baseline f179bc6^ contains test/**, docs/**, and schemas/** candidates"
  - ".arca/io/t-014-direct-support-closure.json"
  - "test/t-014-direct-support-closure.test.mjs PT-014"
classification-rationale: "satisfied: only the five spec-driven schema/template assets with direct package resolver and schemas/templates command edges were restored, plus the focused PT-014 test. All 140 inspected baseline docs/tests candidates are explicitly excluded with path-level provenance and concrete no-edge reasons; website/ and openspec/ remain hard exclusions. Isolated init/validate behavior and purge boundaries pass."
status: "satisfied"
required-test-refs:
  - "T-015"
  - "PT-014"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-15`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-003`).
