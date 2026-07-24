# Residual: residual-us-17

```yaml
residual-id: "residual-us-17"
goal-requirement-ref: "US-17"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-005"
  - ".arca/issue/i-002-selective-cli-recovery/test-plan.md#verification"
  - "baseline object 84741704290c547d64605699d697612ac03731bf and current recovery cutoff 0f7d91032ef1aedefbcaeda36cb7189916277286"
  - ".arca/io/t-016-reproducible-recovery-proof.json"
  - "test/t-016-reproducible-recovery-proof.test.mjs (PT-016), including exact goal SHA-256 and repository-enforced LF attribute checks"
classification-rationale: "satisfied: PT-016 records deterministic recovery hashes, ordered extraction evidence, closure decisions, exact restored/excluded inventory counts, repository-enforced LF checkout, and reproducible install/build/test/CLI outcomes."
status: "satisfied"
required-test-refs:
  - "T-017"
  - "PT-016"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-17`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-005`).
