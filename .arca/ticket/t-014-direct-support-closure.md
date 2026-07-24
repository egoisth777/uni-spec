---
ticket-id: "t-014-direct-support-closure"
residual-ids:
  - "residual-us-15"
behavior-refs:
  - ".arca/goal/spec.md#integrated-selective-cli-recovery-requirements (US-15)"
  - ".arca/goal/test-list.md#verification (T-015)"
design-refs:
  - ".arca/goal/design.md#integrated-selective-cli-recovery-mapping"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#candidate-path-groups"
planned-test-refs:
  - "PT-014"
dependencies:
  - "t-012-cli-runtime-recovery"
  - "t-013-package-build-closure"
status: "approved"
---

# Ticket: t-014-direct-support-closure

## Vertical slice

Trace the recovered CLI's public commands and package/test references, then selectively restore directly necessary tests, fixtures/helpers, user-facing command documentation, and schemas/templates. Produce a path-level dependency-closure manifest with one edge for every restored support path and an evidence-backed exclusion or explicit question for every inspected candidate. Do not restore website publication material or unrelated upstream tests/docs/schemas.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-014` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` (`US-15`) | Reachable `test/**`, fixtures/helpers, `docs/**`, and `schemas/**` candidates from baseline | `closure manifest PT-014` | Every restored path has a direct import/script/test/public-contract edge; all excluded candidates have explicit rationale and selected tests/docs/schemas run. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Restored tests must defend recovered behavior. | `PT-014-H1` |
| `Input/Routing` | covered | Docs/schemas must match command and fixture routes. | `PT-014-H2` |
| `Lifecycle/Model` | covered | Closure is built only after runtime/package slices. | `PT-014-H3` |
| `Durability/Recovery` | covered | Manifest prevents accidental broad restoration. | `PT-014-H4` |
| `Output/Filesystem` | covered | Selected support files and excluded candidates are enumerated. | `PT-014-H5` |
| `Cross-Feature` | covered | Tests, docs, schemas, and runtime edges are cross-checked. | `PT-014-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | --------- | -------- | -------- | ----- |
| `PT-014-H1` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Remove a test required by a recovered command. | `Regression` | Coverage/target check fails. | `recovery-maintainer` |
| `PT-014-H2` | `.arca/goal/design.md#integrated-selective-cli-recovery-mapping` | Leave a docs/schema reference unresolved. | `Input/Routing` | Link/lookup check fails. | `recovery-maintainer` |
| `PT-014-H3` | `.arca/goal/test-list.md#verification` | Restore support before its runtime edge. | `Lifecycle/Model` | Dependency order fails. | `recovery-maintainer` |
| `PT-014-H4` | `.arca/issue/i-002-selective-cli-recovery/spec.md#R-003` | Add an unreferenced upstream artifact. | `Durability/Recovery` | Closure manifest rejects it. | `recovery-maintainer` |
| `PT-014-H5` | `.arca/goal/test-list.md#verification` | Omit a selected fixture or schema. | `Output/Filesystem` | Targeted tests/docs check fails. | `recovery-maintainer` |
| `PT-014-H6` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Cross-check all support edges. | `Cross-Feature` | Ticket closes only with complete manifest. | `recovery-maintainer` |
