---
ticket-id: "t-015-purge-preservation"
residual-ids:
  - "residual-us-16"
behavior-refs:
  - ".arca/goal/spec.md#integrated-selective-cli-recovery-requirements (US-16)"
  - ".arca/goal/test-list.md#verification (T-016)"
design-refs:
  - ".arca/goal/design.md#integrated-selective-cli-recovery-mapping"
  - ".arca/issue/i-002-selective-cli-recovery/design.md#dependency-and-safety-gates"
planned-test-refs:
  - "PT-015"
dependencies:
  - "t-012-cli-runtime-recovery"
  - "t-013-package-build-closure"
  - "t-014-direct-support-closure"
status: "running"
---

# Ticket: t-015-purge-preservation

## Vertical slice

Run the preservation gate after the selected runtime/package/support slices: prove `website/` and `openspec/` remain absent, compare retained `.arca/`, `standard/`, and `AGENTS.md` against the pre-recovery inventory, verify prior issue/residual/ticket records remain reachable, and append only a new state line. Reject any revert/reset, history rewrite, or accidental governance/standard change.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-015` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` (`US-16`) | Purge inventory, `.arca/`, `standard/`, `AGENTS.md`, `.arca/current/log.md` | `preservation audit PT-015` | Purged trees are absent, retained governance/standard/history are present and unchanged except allowed additions, and log growth is append-only. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects reintroduced purge candidates. | `PT-015-H1` |
| `Input/Routing` | covered | Verifies retained governance and standard routes. | `PT-015-H2` |
| `Lifecycle/Model` | covered | Preservation follows all restoration dependencies. | `PT-015-H3` |
| `Durability/Recovery` | covered | Detects history rewrites and non-append-only state. | `PT-015-H4` |
| `Output/Filesystem` | covered | Checks exact retained and excluded roots. | `PT-015-H5` |
| `Cross-Feature` | covered | Combines recovery with purge and governance proof. | `PT-015-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | --------- | -------- | -------- | ----- |
| `PT-015-H1` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Restore one `website/` or `openspec/` path. | `Regression` | Presence check fails. | `recovery-maintainer` |
| `PT-015-H2` | `.arca/goal/design.md#integrated-selective-cli-recovery-mapping` | Break a retained standard/governance route. | `Input/Routing` | Link/inventory check fails. | `recovery-maintainer` |
| `PT-015-H3` | `.arca/goal/test-list.md#verification` | Run preservation before support closure. | `Lifecycle/Model` | Order gate rejects result. | `recovery-maintainer` |
| `PT-015-H4` | `.arca/issue/i-002-selective-cli-recovery/spec.md#R-004` | Rewrite or truncate `current/log.md`. | `Durability/Recovery` | Append-only proof fails. | `recovery-maintainer` |
| `PT-015-H5` | `.arca/goal/test-list.md#verification` | Remove a retained governance artifact. | `Output/Filesystem` | Preservation audit fails. | `recovery-maintainer` |
| `PT-015-H6` | `.arca/goal/spec.md#integrated-selective-cli-recovery-requirements` | Combine absence and retained-tree checks. | `Cross-Feature` | Ticket closes only with complete proof. | `recovery-maintainer` |
