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
  - ".arca/io/t-013-package-build-closure.json"
  - "test/t-013-package-build-closure.test.mjs PT-013; test/t-013-package-build-closure.vitest.test.ts"
classification-rationale: "satisfied: the retained package is private uni-spec-cli with pinned pnpm identity and openspec bin; the mechanically derived 167-module closure has exactly 10 external runtime packages, matching package.json and the regenerated lock importer. Unreachable Changesets, lint, UI, and typescript-eslint inheritance was removed; strict build/typecheck, frozen install, configured test runner, PT-012/PT-013, CLI help/version, and purge checks pass."
status: "satisfied"
required-test-refs:
  - "T-014"
  - "PT-013"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-14`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-002`).
