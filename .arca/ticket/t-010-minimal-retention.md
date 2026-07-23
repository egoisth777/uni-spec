---
ticket-id: "t-010-minimal-retention"
residual-ids:
  - "residual-us-11"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-11)"
  - ".arca/goal/test-list.md#verification (T-011)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-010"
dependencies:
  - "t-007-website-purge"
  - "t-008-openspec-purge"
  - "t-009-adjacent-residue"
status: "approved"
---

# Ticket: t-010-minimal-retention

## Vertical slice

Apply the minimal-retention criterion to the resulting checkout: preserve `.arca/`, `standard/`, `AGENTS.md`, and only directly evidenced support; decide the empty root `AGENTS.md`, `test/AGENTS.md`, and shared config explicitly, then prove every retained path has a reason and every required route remains present.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-010` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-11`) | Post-t-009 root tree and retained artifact set | `repository-audit PT-010` | Allowlist comparison has no unexplained retained path and all required governance/standard records remain. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects required `.arca/` or `standard/` removal. | `PT-010-H1` |
| `Input/Routing` | covered | Direct links and support dependencies justify exceptions. | `PT-010-H2` |
| `Lifecycle/Model` | covered | Retention decisions are explicit and reviewable. | `PT-010-H3` |
| `Durability/Recovery` | covered | Ambiguous paths are retained pending evidence, not guessed away. | `PT-010-H4` |
| `Output/Filesystem` | covered | Allowlist/tree comparison is observable. | `PT-010-H5` |
| `Cross-Feature` | covered | Governance, standard, templates, and examples are checked together. | `PT-010-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-010-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Remove a required goal file. | `Regression` | Allowlist check fails. | `purge-maintainer` |
| `PT-010-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Retain a support file without dependency evidence. | `Input/Routing` | Retention check fails. | `purge-maintainer` |
| `PT-010-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Change retention after verification. | `Lifecycle/Model` | Decision trail fails. | `purge-maintainer` |
| `PT-010-H4` | `.arca/goal/spec.md#integrated-issue-requirements` | Encounter an ambiguous `AGENTS.md`. | `Durability/Recovery` | Preserve and record question. | `purge-maintainer` |
| `PT-010-H5` | `.arca/goal/test-list.md#verification` | Compare expected allowlist with actual tree. | `Output/Filesystem` | Exact required set remains. | `purge-maintainer` |
| `PT-010-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Validate routes after support pruning. | `Cross-Feature` | Links and standard checks remain green. | `purge-maintainer` |
