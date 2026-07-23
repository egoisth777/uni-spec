---
ticket-id: "t-009-adjacent-residue"
residual-ids:
  - "residual-us-10"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-10)"
  - ".arca/goal/test-list.md#verification (T-010)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-009"
dependencies:
  - "t-007-website-purge"
  - "t-008-openspec-purge"
status: "approved"
---

# Ticket: t-009-adjacent-residue

## Vertical slice

Inventory every listed adjacent path and upstream identity occurrence, classify each as purge or retain with a direct dependency reason, then apply the safe classification and verify no unclassified residue remains. This slice includes package/release metadata, assets, bin/build/scripts, docs, integrations, source/tests, and schemas.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-009` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-10`) | Root candidate inventory and retained trees | `repository-audit PT-009` | Every observed candidate has exactly one purge/retain decision and rationale; no OpenSpec identity remains outside recorded evidence. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Repeated identity search catches missed residue. | `PT-009-H1` |
| `Input/Routing` | covered | Candidate paths and retained references are cross-checked. | `PT-009-H2` |
| `Lifecycle/Model` | covered | Classification is recorded before mutation. | `PT-009-H3` |
| `Durability/Recovery` | covered | Broken/dead tooling is classified from observed evidence, not assumed. | `PT-009-H4` |
| `Output/Filesystem` | covered | Inventory and final tree are compared. | `PT-009-H5` |
| `Cross-Feature` | covered | Package, docs, source, tests, and schemas are assessed together. | `PT-009-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-009-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Leave one branded asset or URL. | `Regression` | Search fails. | `purge-maintainer` |
| `PT-009-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Retained link points to a candidate. | `Input/Routing` | Link/dependency decision is required. | `purge-maintainer` |
| `PT-009-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Delete an ambiguous support file first. | `Lifecycle/Model` | Classification gate fails. | `purge-maintainer` |
| `PT-009-H4` | `.arca/goal/design.md#integrated-issue-requirements` | Remove only a dead entry point but retain its caller. | `Durability/Recovery` | Dependency evidence blocks unsafe change. | `purge-maintainer` |
| `PT-009-H5` | `.arca/goal/test-list.md#verification` | Compare all listed roots and files. | `Output/Filesystem` | Inventory is complete. | `purge-maintainer` |
| `PT-009-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Check package, CI, docs, and source classifications together. | `Cross-Feature` | Decisions are consistent. | `purge-maintainer` |
