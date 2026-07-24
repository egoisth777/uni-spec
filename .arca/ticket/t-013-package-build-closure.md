---
ticket-id: "t-013-package-build-closure"
residual-ids:
  - "residual-us-14"
behavior-refs:
  - ".arca/goal/spec.md#integrated-selective-cli-recovery-requirements (US-14)"
  - ".arca/goal/test-list.md#verification (T-014)"
design-refs:
  - ".arca/goal/design.md#integrated-selective-cli-recovery-mapping"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#dependency-and-safety-gates"
planned-test-refs:
  - "PT-013"
dependencies:
  - "t-012-cli-runtime-recovery"
status: "running"
---

# Ticket: t-013-package-build-closure

## Vertical slice

Restore the package/build closure required by the recovered runtime: package metadata and lock data, TypeScript/Vitest configuration, build entrypoint, and only reached package scripts. Rewrite package identity and scripts for the retained uni-spec repository, remove upstream release/site hooks, then prove clean install, build, and configured test-runner startup. Preserve the t-012 path inventory and purge exclusions.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-013` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` (`US-14`) | `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `build.js`, reached scripts | `package/build PT-013` | Clean install/build/test-runner commands agree with metadata and complete without upstream identity or unreached script dependencies. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Catches package or compiler regressions in the runtime slice. | `PT-013-H1` |
| `Input/Routing` | covered | Validates package scripts route to selected tools. | `PT-013-H2` |
| `Lifecycle/Model` | covered | Enforces dependency order after runtime recovery. | `PT-013-H3` |
| `Durability/Recovery` | covered | Detects lock/config drift and non-reproducible install. | `PT-013-H4` |
| `Output/Filesystem` | covered | Checks build output and selected support paths. | `PT-013-H5` |
| `Cross-Feature` | covered | Combines package identity, build, and CLI execution. | `PT-013-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | -------- | ----- |
| `PT-013-H1` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Remove a compiler option required by source. | `Regression` | Build fails. | `recovery-maintainer` |
| `PT-013-H2` | `.arca/goal/design.md#integrated-selective-cli-recovery-mapping` | Point a script at an excluded tool. | `Input/Routing` | Script fails or manifest rejects edge. | `recovery-maintainer` |
| `PT-013-H3` | `.arca/goal/test-list.md#verification` | Run package checks before t-012. | `Lifecycle/Model` | Order gate rejects closure. | `recovery-maintainer` |
| `PT-013-H4` | `.arca/issue/i-002-selective-cli-recovery/spec.md#R-002` | Change lock data without package evidence. | `Durability/Recovery` | Reproducibility check fails. | `recovery-maintainer` |
| `PT-013-H5` | `.arca/goal/test-list.md#verification` | Omit build output or required config. | `Output/Filesystem` | Build proof fails. | `recovery-maintainer` |
| `PT-013-H6` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Combine clean metadata and CLI smoke. | `Cross-Feature` | Ticket closes only with both. | `recovery-maintainer` |
