# Residual: residual-us-16

```yaml
residual-id: "residual-us-16"
goal-requirement-ref: "US-16"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-004"
  - ".arca/current/current.md"
  - ".arca/current/log.md (sanitized purge and governance history)"
  - "current tree inspection: website/ and openspec/ absent; .arca/, standard/, AGENTS.md present"
classification-rationale: "partial: the prior purge and governance preservation are evidenced, but no recovery change has yet demonstrated that selective restoration leaves those exclusions and append-only state intact."
status: "partial"
required-test-refs:
  - "T-016"
  - "PT-015"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-16`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-004`).
