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
status: "done"
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

## P5 disposition and proof

PT-009 is `test/adjacent-residue.test.ts` and passed 3/3 after the red inventory run. The complete machine-readable inventory is `.arca/io/t-009-adjacent-residue.json`: 35 observed root candidates plus 507 nested tracked entries (542 candidates total), 359 purged, and 183 retained, with one category, decision, evidence, and rationale per candidate. Category counts are assets 1, configuration 57, documentation 136, identity 2, integrations 3, schemas 1, source 224, tests 113, and tooling 5. Purged candidates include inherited identity, branded assets, executable source/runtime, schemas, documentation, CI/release/integration configuration, generated output, and obsolete tests. Retained candidates are `.arca/`, `standard/`, root `AGENTS.md`, `.gitignore`, and temporary Vitest support (`package.json`, `tsconfig.json`, `vitest.config.ts`, `node_modules/`, and the three purge tests) explicitly deferred to t-010.

The retained package manifest is now private `uni-spec` test infrastructure; stale upstream package, release, and runtime references are removed. PT-007, PT-008, and PT-009 pass together (6 tests), and the full retained suite is green (3 files, 6 passed). No operational upstream identity remains in the retained package/config or standard surfaces; historical/provenance mentions remain only in `.arca/` evidence and the purge-test assertions.

Residual `US-10` is satisfied. The next approved ticket is `t-010-minimal-retention`.
