# Residual: residual-us-11

```yaml
residual-id: "residual-us-11"
goal-requirement-ref: "US-11"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "P5 t-011-sanitization-proof final retained-tree correction; repository history records the immutable revision"
concrete-evidence-refs:
  - ".arca/io/t-011-sanitization-proof.json (final exact-root counts, retained support, and .gitignore evidence)"
  - ".arca/io/t-010-minimal-retention.json (historical PT-010 allowlist and pre-sanitation support decisions)"
  - ".arca/ (governance and working records; retained authority)"
  - "standard/ (normative uni-spec content; retained authority)"
  - "AGENTS.md (required contributor routing to .arca/index.md)"
  - ".gitignore (final privacy-only .arca-private/ rule)"
  - "test/AGENTS.md (explicitly absent before temporary test support was removed)"
classification-rationale: "satisfied: the final checkout has exactly the allowlisted roots .arca, standard, AGENTS.md, and .gitignore (177 tracked files: .arca 48, standard 127, and one each for AGENTS.md/.gitignore); no temporary test/package support remains, and .arca-private/ is retained only as an ignored privacy boundary."
status: "satisfied"
required-test-refs:
  - "T-011"
  - "PT-010"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-11`). Reverse source: `.arca/issue/i-001-purge-sanitization/spec.md` (`R-004`).
