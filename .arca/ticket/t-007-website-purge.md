---
ticket-id: "t-007-website-purge"
residual-ids:
  - "residual-us-08"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-08)"
  - ".arca/goal/test-list.md#verification (T-008)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-007"
dependencies:
  - "none"
status: "approved"
---

# Ticket: t-007-website-purge

## Vertical slice

Audit every entry under `website/`, classify each as inherited OpenSpec material or directly required by `standard/`/`.arca/`, remove the tree only when the evidence supports residue, and record the resulting tree and link checks. Do not alter `.arca/current/` while executing the slice.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-007` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-08`) | `website/` and retained `standard/`, `.arca/` | `repository-audit PT-007` | Every website entry has a recorded decision; confirmed residue is absent and retained artifacts remain reachable. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Re-audit catches a website path left behind. | `PT-007-H1` |
| `Input/Routing` | covered | Candidate classification includes links from retained trees. | `PT-007-H2` |
| `Lifecycle/Model` | covered | Evidence precedes deletion and status remains auditable. | `PT-007-H3` |
| `Durability/Recovery` | covered | Ambiguous dependency retains the path rather than guessing. | `PT-007-H4` |
| `Output/Filesystem` | covered | Final tree proves website removal or documented retention. | `PT-007-H5` |
| `Cross-Feature` | covered | Slice checks standard/.arca preservation with website absence. | `PT-007-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-007-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Leave one nested website entry. | `Regression` | Audit fails. | `purge-maintainer` |
| `PT-007-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Add a retained-tree reference to website. | `Input/Routing` | Retain or repair is required. | `purge-maintainer` |
| `PT-007-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Delete before recording classification. | `Lifecycle/Model` | Evidence gate fails. | `purge-maintainer` |
| `PT-007-H4` | `.arca/goal/design.md#integrated-sanitation-mapping` | Use an ambiguous dependency. | `Durability/Recovery` | Candidate is retained and question recorded. | `purge-maintainer` |
| `PT-007-H5` | `.arca/goal/test-list.md#verification` | Compare before/after tree. | `Output/Filesystem` | Website is absent or explicitly retained. | `purge-maintainer` |
| `PT-007-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Check standard and .arca routes after removal. | `Cross-Feature` | Retained artifacts still pass. | `purge-maintainer` |
