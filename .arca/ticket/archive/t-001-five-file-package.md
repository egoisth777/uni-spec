---
ticket-id: "t-001-five-file-package"
residual-ids:
  - "residual-us-01"
behavior-refs:
  - ".arca/goal/spec.md#source-requests"
  - ".arca/goal/design.md#five-file-shape"
  - ".arca/goal/test-list.md#verification"
design-refs:
  - ".arca/goal/design.md#five-file-shape"
planned-test-refs:
  - "PT-001"
dependencies: []
status: "done"
---

# Ticket: t-001-five-file-package

## Normative standard change

Create the dedicated product root `standard/` and its front door `standard/index.md`. State that one issue folder is exactly one directory containing these five regular files and no symlinks, subdirectories, or extra entries: `index.md` (identity, provenance, status, summary, routes), `ubi-lang.md` (terms or exact absence), `spec.md` (stable source requests), `design.md` (request-mapped design or exact absence), and `test-plan.md` (source-provided verification or exact absence). State that aspects remain distinct, that `index.md` is the sole canonical source reference, and that facts route to their owning aspect without duplication.

Add `standard/issue-format.md` as the normative aspect responsibility and shape document. This slice is shape-only: it MUST NOT define CLI, API, runtime, converter, linter, package, dependency, orchestration, or product code.

## Examples and fixtures

- Shape-only conforming fixture: `standard/examples/shape-only/i-001-example-issue/` with exactly the five named files.
- Shape-only invalid fixture: `standard/examples/shape-only-extra-entry/` containing an extra entry for the negative oracle.
- Planned fixture inspection reads directory entries and file kinds; it does not execute a product implementation.

## P4 Apparent Test Plan

Public mapping from explicit goal behavior to an executable test and oracle.

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-001` | `.arca/goal/design.md#five-file-shape` | `standard/examples/shape-only/i-001-example-issue/` and `standard/examples/shape-only-extra-entry/` | `test/uni-spec/five-file-package.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical Vitest inspection observed exactly `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, `test-plan.md` as regular files and rejected the extra-entry fixture; no CLI/API/runtime was invoked. |

## P4 Runnable Test Mapping (historical; sanitized after successful final green; removed by explicit user request)

| Planned ID | Exact historical executable target | Historical Vitest function name(s) |
| ---------- | ----------------------- | ------------------------------------- |
| `PT-001` | `test/uni-spec/five-file-package.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical function names: `PT-001 accepts exactly five regular aspect files and no structural extras`; `rejects a fixture with an extra entry rather than silently ignoring it`; `keeps each aspect distinct and routes from the front door to every companion`; `makes the standard front door authoritative and keeps links resolvable` |

## P5 Hidden Test Public Coverage Manifest

Public coverage manifest entries. Every adversarial lane is covered by document inspection of the written standard and fixtures.

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | The exact five-file set and distinct responsibilities prevent regressions to extra or missing aspects. | `PT-001-H1` |
| `Input/Routing` | `covered` | The standard routes each aspect to one named file and rejects unowned entries. | `PT-001-H2` |
| `Lifecycle/Model` | `covered` | The package shape is defined independently of lifecycle status, preserving the five-file invariant across states. | `PT-001-H3` |
| `Durability/Recovery` | `covered` | A shape-only fixture and an extra-entry fixture make the observable folder invariant durable under reinspection. | `PT-001-H4` |
| `Output/Filesystem` | `covered` | The oracle checks regular-file kinds, exact names, no links, no directories, and no extras. | `PT-001-H5` |
| `Cross-Feature` | `covered` | The front door routes to four companion aspects while keeping responsibilities distinct. | `PT-001-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-001-H1` | `.arca/goal/design.md#five-file-shape` | Vary missing and extra aspect entries while preserving the contract's exact-set requirement. | `Regression` | Written standard names exactly five required regular files and rejects every changed set. | `standard-maintainer` |
| `PT-001-H2` | `.arca/goal/design.md#five-file-shape` | Inspect whether each aspect is routed to its own file rather than duplicated or merged. | `Input/Routing` | Fixture has one owner file per aspect and the standard states the routing rule. | `standard-maintainer` |
| `PT-001-H3` | `.arca/goal/design.md#five-file-shape` | Reinspect the same shape independent of pending/integrated/rejected metadata. | `Lifecycle/Model` | Five-file invariant remains unchanged across documented lifecycle examples. | `standard-maintainer` |
| `PT-001-H4` | `.arca/goal/design.md#five-file-shape` | Re-run inspection after an extra entry appears. | `Durability/Recovery` | Extra entry is observable and the expected finding identifies removal remediation. | `standard-maintainer` |
| `PT-001-H5` | `.arca/goal/design.md#five-file-shape` | Exercise symlink, subdirectory, and regular-file entry kinds. | `Output/Filesystem` | Oracle reports all non-regular or unlisted entries and accepts only the exact five regular files. | `standard-maintainer` |
| `PT-001-H6` | `.arca/goal/design.md#five-file-shape` | Check front-door routes and aspect boundaries together. | `Cross-Feature` | `index.md` links to exactly the four companions and no companion becomes an authority trace. | `standard-maintainer` |

## Post-build sanitation

P4/P5 test targets and mappings are historical only: the last green result was `106 files, 1894 passed, 22 skipped`, recorded in `.arca/current/log.md`; `test/uni-spec/` was removed by explicit user request after that successful run and is not runnable in the sanitized workspace.
