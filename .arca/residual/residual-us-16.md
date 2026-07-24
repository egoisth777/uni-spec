# Residual: residual-us-16

```yaml
residual-id: "residual-us-16"
goal-requirement-ref: "US-16"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-004"
  - ".arca/current/current.md"
  - ".arca/current/log.md (append-only preservation history)"
  - ".arca/io/t-015-purge-preservation.json"
  - "test/t-015-purge-preservation.test.mjs (PT-015)"
  - "current tree inspection: website/ and openspec/ absent; .arca/, standard/, AGENTS.md present"
classification-rationale: "satisfied: PT-015 proves the recovered runtime/package/support slices preserve the repository-root purge boundaries, retained governance/standard/history routes, frozen goal bytes/hash, and append-only current state."
status: "satisfied"
required-test-refs:
  - "T-016"
  - "PT-015"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-16`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-004`).
