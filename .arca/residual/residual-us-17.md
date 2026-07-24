# Residual: residual-us-17

```yaml
residual-id: "residual-us-17"
goal-requirement-ref: "US-17"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-005"
  - ".arca/issue/i-002-selective-cli-recovery/test-plan.md#verification"
  - "baseline object 84741704290c547d64605699d697612ac03731bf and current HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
  - "no recovery manifest, restored-vs-excluded inventory, or runtime/build proof exists in sanitized tree"
classification-rationale: "missing: baseline and current revisions are known, but deterministic recovery hashes, ordered extraction evidence, closure decisions, inventory, and reproducible outcome records have not been produced."
status: "missing"
required-test-refs:
  - "T-017"
  - "PT-016"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-17`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-005`).
