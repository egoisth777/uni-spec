# Residual: residual-us-12

```yaml
residual-id: "residual-us-12"
goal-requirement-ref: "US-12"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0"
concrete-evidence-refs:
  - "website/ and openspec/ (present, so deleted-path absence is not yet proven)"
  - "README.md, package.json, src/, scripts/, docs/, .github/ (OpenSpec identity and references remain)"
  - ".arca/issue/i-001-purge-sanitization/spec.md (R-005)"
  - ".arca/issue/i-001-purge-sanitization/test-plan.md (T-004, T-005, T-006)"
classification-rationale: "missing: no post-purge absence search, retained-link resolution, five-file inspection, or green applicable-check record exists for this issue; current evidence shows the purge has not happened."
status: "missing"
required-test-refs:
  - "T-012"
  - "PT-011"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-12`). Reverse source: `.arca/issue/i-001-purge-sanitization/spec.md` (`R-005`).
