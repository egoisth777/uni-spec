# Residual: residual-us-13

```yaml
residual-id: "residual-us-13"
goal-requirement-ref: "US-13"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "HEAD (local t-012 recovery commit; SHA reported in delivery)"
concrete-evidence-refs:
  - ".arca/issue/i-002-selective-cli-recovery/spec.md#R-001"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#candidate-path-groups"
  - "historical baseline f179bc6^ = 84741704290c547d64605699d697612ac03731bf; bin/openspec.js and the 167-file src/cli/index.ts import closure were derived read-only"
  - ".arca/io/t-012-cli-runtime-recovery.json"
  - "test/t-012-cli-runtime-recovery.test.mjs PT-012_cli_runtime_smoke"
  - "node bin/openspec.js --help and --version; TypeScript build/typecheck and surviving Node test suite pass"
classification-rationale: "satisfied: the CLI entrypoint and complete 167-module source import closure were restored path-selectively from the exact baseline; clean package identity plus provisional build support installed from the recovered lockfile; PT-012 red/green, strict typecheck, build, help/version smoke, and purge-preservation checks all pass. Broader package closure and reproducibility remain explicitly deferred to t-013."
status: "satisfied"
required-test-refs:
  - "T-013"
  - "PT-012"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirements (`US-13`). Reverse source: `.arca/issue/i-002-selective-cli-recovery/spec.md` (`R-001`).
