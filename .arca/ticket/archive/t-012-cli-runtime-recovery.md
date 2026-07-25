---
ticket-id: "t-012-cli-runtime-recovery"
residual-ids:
  - "residual-us-13"
behavior-refs:
  - ".arca/goal/spec.md#integrated-selective-cli-recovery-requirements (US-13)"
  - ".arca/goal/test-list.md#verification (T-013)"
design-refs:
  - ".arca/goal/design.md#integrated-selective-cli-recovery-mapping"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#candidate-path-groups"
planned-test-refs:
  - "PT-012"
dependencies:
  - "none"
status: "done"
---

# Ticket: t-012-cli-runtime-recovery

## Vertical slice

From `f179bc6^` (`84741704290c547d64605699d697612ac03731bf`), selectively restore `bin/openspec.js` and the complete source import closure rooted at `src/cli/index.ts`; clean any upstream-only identity encountered, compile the closure, and smoke the non-destructive `--help` and `--version` entrypoint commands. Record every restored and excluded path. Do not restore `website/` or `openspec/`, rewrite history, or add unrelated source.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-012` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` (`US-13`) | Baseline `bin/openspec.js` and reachable `src/**`; retained `.arca/`, `standard/` | `CLI smoke PT-012` | Selected entrypoint resolves, TypeScript compiles, `--help`/`--version` emit expected output, and purged trees remain absent. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects missing or altered recovered entrypoint/source behavior. | `PT-012-H1` |
| `Input/Routing` | covered | Exercises command routing from the bin entrypoint. | `PT-012-H2` |
| `Lifecycle/Model` | covered | Requires source closure before dependent support tickets. | `PT-012-H3` |
| `Durability/Recovery` | covered | Rejects broad revert/reset and incomplete extraction. | `PT-012-H4` |
| `Output/Filesystem` | covered | Checks executable resolution and selected path inventory. | `PT-012-H5` |
| `Cross-Feature` | covered | Combines CLI output with purge preservation. | `PT-012-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | -------- | ----- |
| `PT-012-H1` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Omit a reachable source module. | `Regression` | Build or smoke check fails. | `recovery-maintainer` |
| `PT-012-H2` | `.arca/goal/design.md#integrated-selective-cli-recovery-mapping` | Route a command through the recovered bin. | `Input/Routing` | Expected command output appears. | `recovery-maintainer` |
| `PT-012-H3` | `.arca/goal/test-list.md#verification` | Start runtime before source closure is complete. | `Lifecycle/Model` | Ticket remains open. | `recovery-maintainer` |
| `PT-012-H4` | `.arca/issue/i-002-selective-cli-recovery/spec.md#R-001` | Attempt a full-tree revert. | `Durability/Recovery` | History/purge guard fails. | `recovery-maintainer` |
| `PT-012-H5` | `.arca/goal/test-list.md#verification` | Leave the entrypoint or a selected file absent. | `Output/Filesystem` | Inventory/build fails. | `recovery-maintainer` |
| `PT-012-H6` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Combine CLI smoke with absence checks. | `Cross-Feature` | Slice closes only with both proofs. | `recovery-maintainer` |

## P5 Evidence

PT-012 maps to `PT-012_cli_runtime_smoke` in `test/t-012-cli-runtime-recovery.test.mjs`. The static relative-import BFS rooted at `src/cli/index.ts` resolved 167 source modules (the baseline has 171; the four unreachable modules remain excluded), plus `bin/openspec.js`. The machine-readable restored/excluded/provenance inventory is `.arca/io/t-012-cli-runtime-recovery.json`.

The test-first red run was `node --test test/t-012-cli-runtime-recovery.test.mjs` and failed only because `bin/openspec.js` was absent (`MODULE_NOT_FOUND`). After path-selective restoration, `corepack pnpm install --frozen-lockfile`, `corepack pnpm run build`, `corepack pnpm exec tsc --noEmit`, `node --test test/t-012-cli-runtime-recovery.test.mjs`, and `corepack pnpm test` passed. `node bin/openspec.js --help` emitted `Usage: openspec` and the expected description; `node bin/openspec.js --version` emitted `0.1.0`. `website/` and `openspec/` remain absent.

Package/build support is provisional: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, and `build.js` were restored; package identity and scripts were cleaned to `uni-spec-cli`, while the frozen baseline dependency importer remains for this smoke. Broader package-closure cleanup and reproducibility are deferred to t-013.
