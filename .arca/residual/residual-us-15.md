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
  - "sanitized current tree has no recovered test/docs/schema closure manifest"
classification-rationale: "missing: no directly necessary tests, fixtures, docs, schemas, or path-level dependency-closure evidence is present for the recovered CLI because recovery has not started."
status: "missing"
required-test-refs:
  - "T-015"
  - "PT-014"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-15`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-003`).
