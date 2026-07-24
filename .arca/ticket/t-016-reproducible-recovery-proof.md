---
ticket-id: "t-016-reproducible-recovery-proof"
residual-ids:
  - "residual-us-17"
behavior-refs:
  - ".arca/goal/spec.md#integrated-selective-cli-recovery-requirements (US-17)"
  - ".arca/goal/test-list.md#verification (T-017)"
design-refs:
  - ".arca/goal/design.md#integrated-selective-cli-recovery-mapping"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#dependency-and-safety-gates"
planned-test-refs:
  - "PT-016"
dependencies:
  - "t-012-cli-runtime-recovery"
  - "t-013-package-build-closure"
  - "t-014-direct-support-closure"
  - "t-015-purge-preservation"
status: "done"
---

# Ticket: t-016-reproducible-recovery-proof

## Vertical slice

Publish the final machine-readable recovery proof: exact baseline and current revisions, deterministic goal/recovery hashes, ordered selective extraction commands, restored-vs-excluded path inventory, dependency-closure decisions, unresolved candidates, and clean install/build/CLI/test outputs. Re-run the proof from a fresh checkout and close only when independent results match; otherwise leave the residual open and cut a narrower follow-up ticket.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-016` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` (`US-17`) | Baseline object, goal bundle, path manifest, proof record, and outputs from t-012..t-015 | `recovery proof PT-016` | Fresh-checkout rerun reproduces hashes, selected/excluded counts, command order, closure decisions, and green outcomes exactly. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | ----------- | ---------- |
| `Regression` | covered | Re-run catches drift from recorded outcomes. | `PT-016-H1` |
| `Input/Routing` | covered | Reproduces path extraction and closure edges. | `PT-016-H2` |
| `Lifecycle/Model` | covered | Enforces final proof after all ordered tickets. | `PT-016-H3` |
| `Durability/Recovery` | covered | Detects non-deterministic or history-mutating commands. | `PT-016-H4` |
| `Output/Filesystem` | covered | Compares exact restored-vs-excluded inventory. | `PT-016-H5` |
| `Cross-Feature` | covered | Reconciles all runtime, package, support, and preservation evidence. | `PT-016-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ----------- | -------- | -------- | ----- |
| `PT-016-H1` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Change one recorded hash or output. | `Regression` | Independent comparison fails. | `recovery-maintainer` |
| `PT-016-H2` | `.arca/goal/design.md#integrated-selective-cli-recovery-mapping` | Reorder or broaden a restore command. | `Input/Routing` | Manifest/order check fails. | `recovery-maintainer` |
| `PT-016-H3` | `.arca/goal/test-list.md#verification` | Publish proof before prerequisites. | `Lifecycle/Model` | Dependency gate rejects closure. | `recovery-maintainer` |
| `PT-016-H4` | `.arca/issue/i-002-selective-cli-recovery/spec.md#R-005` | Use a non-reproducible or history-mutating command. | `Durability/Recovery` | Proof is rejected. | `recovery-maintainer` |
| `PT-016-H5` | `.arca/goal/test-list.md#verification` | Omit an inspected candidate from inventory. | `Output/Filesystem` | Counts/path comparison fails. | `recovery-maintainer` |
| `PT-016-H6` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Cross-check all five requirement proofs. | `Cross-Feature` | Final proof closes only with complete reconciliation. | `recovery-maintainer` |
