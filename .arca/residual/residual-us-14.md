# Residual: residual-us-14

```yaml
residual-id: "residual-us-14"
goal-requirement-ref: "US-14"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-002"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#candidate-path-groups"
  - "historical baseline f179bc6^ package.json, pnpm-lock.yaml, tsconfig.json, vitest.config.ts, and build.js"
  - "sanitized current tree has no package/dependency/build closure"
classification-rationale: "missing: the baseline package/build artifacts were inspected read-only, but current metadata and lock/build support are absent and no clean install, build, or test-run proof exists."
status: "missing"
required-test-refs:
  - "T-014"
  - "PT-013"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-14`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-002`).
