---
ticket-id: "t-008-openspec-purge"
residual-ids:
  - "residual-us-09"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-09)"
  - ".arca/goal/test-list.md#verification (T-009)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-008"
dependencies:
  - "t-007-website-purge"
status: "approved"
---

# Ticket: t-008-openspec-purge

## Vertical slice

Enumerate `openspec/` and each named child, search retained trees for dependencies, remove only confirmed upstream workflow residue, and record a post-change tree and link check. Preserve `.arca/` and `standard/` authority.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-008` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-09`) | `openspec/` plus `.arca/`, `standard/` | `repository-audit PT-008` | Each named child has evidence and the approved residue disposition; no unapproved OpenSpec tree remains. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects any named child left after purge. | `PT-008-H1` |
| `Input/Routing` | covered | Searches retained-tree dependencies before deletion. | `PT-008-H2` |
| `Lifecycle/Model` | covered | Enforces audit then mutation order. | `PT-008-H3` |
| `Durability/Recovery` | covered | Ambiguous dependencies remain retained with a question. | `PT-008-H4` |
| `Output/Filesystem` | covered | Final tree and links are inspected. | `PT-008-H5` |
| `Cross-Feature` | covered | Confirms standard and governance survive. | `PT-008-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-008-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Leave `openspec/config.yaml`. | `Regression` | Audit fails. | `purge-maintainer` |
| `PT-008-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Add a dependency from standard. | `Input/Routing` | Retention decision is required. | `purge-maintainer` |
| `PT-008-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Mutate before complete inventory. | `Lifecycle/Model` | Ticket fails. | `purge-maintainer` |
| `PT-008-H4` | `.arca/goal/design.md#integrated-sanitation-mapping` | Simulate unreadable candidate. | `Durability/Recovery` | Evidence gap blocks deletion. | `purge-maintainer` |
| `PT-008-H5` | `.arca/goal/test-list.md#verification` | Compare all named child paths. | `Output/Filesystem` | No unapproved candidate remains. | `purge-maintainer` |
| `PT-008-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Run retained-artifact inspection. | `Cross-Feature` | Authority remains valid. | `purge-maintainer` |
