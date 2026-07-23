# Residual: residual-us-10

```yaml
residual-id: "residual-us-10"
goal-requirement-ref: "US-10"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0"
concrete-evidence-refs:
  - "package.json, README.md, README_OLD.md, CHANGELOG.md, MAINTAINERS.md, assets/, bin/openspec.js"
  - ".agents/skills/release-openspec/, .changeset/, .devcontainer/, .github/, docs/, scripts/, src/, test/, schemas/spec-driven/, build.js, flake.nix, flake.lock"
  - ".arca/issue/i-001-purge-sanitization/spec.md (R-003)"
  - ".arca/issue/i-001-purge-sanitization/test-plan.md (T-002)"
classification-rationale: "partial: the repository contains broad upstream identity, implementation, documentation, integration, and release residue; the inventory is evidenced but classification and dependency-safe mutation remain unfinished."
status: "partial"
required-test-refs:
  - "T-010"
  - "PT-009"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-10`). Reverse source: `.arca/issue/i-001-purge-sanitization/spec.md` (`R-003`).
