# Residual: residual-us-11

```yaml
residual-id: "residual-us-11"
goal-requirement-ref: "US-11"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0"
concrete-evidence-refs:
  - ".arca/ (governance and working records; retained authority)"
  - "standard/ (normative uni-spec content; retained authority)"
  - "AGENTS.md (required contributor rules; retained, currently empty)"
  - ".arca/issue/i-001-purge-sanitization/spec.md (R-004)"
  - ".arca/issue/i-001-purge-sanitization/test-plan.md (T-003)"
classification-rationale: "partial: the intended allowlist is identified, but the checkout still contains many unclassified supporting paths and the empty root AGENTS.md and test/AGENTS.md require explicit retention decisions."
status: "partial"
required-test-refs:
  - "T-011"
  - "PT-010"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-11`). Reverse source: `.arca/issue/i-001-purge-sanitization/spec.md` (`R-004`).
