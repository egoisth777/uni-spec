# Residual: residual-us-11

```yaml
residual-id: "residual-us-11"
goal-requirement-ref: "US-11"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "P5 t-010-minimal-retention retention commit; repository history records the immutable revision"
concrete-evidence-refs:
  - ".arca/io/t-010-minimal-retention.json (explicit allowlist, exclusions, and path evidence)"
  - "test/minimal-retention.test.ts (PT-010; exact retained-root and support assertions)"
  - ".arca/ (governance and working records; retained authority)"
  - "standard/ (normative uni-spec content; retained authority)"
  - "AGENTS.md (required contributor routing to .arca/index.md)"
  - ".gitignore (minimized local-support sanitation rules)"
  - "package.json, tsconfig.json, vitest.config.ts, test/ (temporary PT-007..PT-010/t-011 support)"
  - "test/AGENTS.md (explicitly absent; no test-specific routing rule)"
classification-rationale: "satisfied: the post-t-009 tree is compared to an explicit allowlist; required roots remain, every temporary support root has direct test evidence, root guidance is concrete, test/AGENTS.md is explicitly absent, and ignored node_modules is excluded from the deliverable."
status: "satisfied"
required-test-refs:
  - "T-011"
  - "PT-010"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-11`). Reverse source: `.arca/issue/i-001-purge-sanitization/spec.md` (`R-004`).
