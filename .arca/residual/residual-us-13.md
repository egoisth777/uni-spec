# Residual: residual-us-13

```yaml
residual-id: "residual-us-13"
goal-requirement-ref: "US-13"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-001"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#candidate-path-groups"
  - "historical baseline f179bc6^ = 84741704290c547d64605699d697612ac03731bf; bin/openspec.js and src/** exist there"
  - "sanitized current tree has no package.json, bin/, or src/ CLI closure"
classification-rationale: "missing: the frozen sanitized tree contains no runnable CLI/runtime closure; baseline entrypoint and source imports were inspected read-only but no selective restoration or smoke proof exists."
status: "missing"
required-test-refs:
  - "T-013"
  - "PT-012"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-13`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-001`).
