---
ticket-id: "t-005-lint-contract"
residual-ids:
  - "residual-us-06"
behavior-refs:
  - ".arca/goal/spec.md#source-requests"
  - ".arca/goal/design.md#declarative-lint-contract"
  - ".arca/goal/test-list.md#lint-state-traces-tl-06-coverage"
design-refs:
  - ".arca/goal/design.md#declarative-lint-contract"
planned-test-refs:
  - "PT-005"
dependencies:
  - "t-001-five-file-package"
  - "t-002-issue-naming"
  - "t-003-index-metadata"
  - "t-004-aspect-contracts"
status: "done"
---

# Ticket: t-005-lint-contract

## Normative standard change

Create `standard/lint.md` as a complete declarative inspection contract. Specify LINT-01 through LINT-07 for exact five-file shape, observable naming and sibling uniqueness, strict index metadata, all companion content and absence contracts, blank-token detection, local-link resolution, and docs-only scope. Require evaluation of every rule with no short-circuit. A parser failure MUST create a metadata finding while independent rules continue. Define the six finding fields exactly: rule ID, issue-relative or goal-relative path, line (or null), observed, expected, and remediation. Define PASS if and only if the complete evaluation records zero findings, and FAIL otherwise. Define all findings as actionable and preserve observed text/structure without inferred repairs.

Document L0-L5 observed-folder examples and traces in `standard/lint.md`: L0 passes all rules; L1 reports extra regular file and symlink while continuing; L2 reports duplicate YAML key and non-scalar status while continuing; L3 reports aspect columns/empty rationale/link query findings; L4 reports blank token and traversal/unresolved link; L5 reports only a forbidden requirement in a goal document while ignoring inherited workspace/OpenSpec implementation. This remains declarative: no executable product linter, CLI, API, runtime, package, dependency, or orchestration code is permitted.

## Examples and fixtures

- Written contract and traces: `standard/lint.md` sections `L0` through `L5`.
- Fixture oracle set: `standard/examples/lint-l0-pass/`, `lint-l1-shape/`, `lint-l2-metadata/`, `lint-l3-content/`, `lint-l4-links-token/`, and `lint-l5-scope/`.
- Expected finding records: `standard/examples/lint-findings/` (written JSON-like or Markdown observations only, not executable linter output).

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-005` | `.arca/goal/design.md#declarative-lint-contract` | `standard/examples/lint-l0-pass/` through `lint-l5-scope/` and `standard/examples/lint-findings/` | `test/uni-spec/lint-contract.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical Vitest inspection asserted L0 zero findings, L1-L5 finding/continuation traces, six finding fields, and no product linter execution. |

## P4 Runnable Test Mapping (historical; sanitized after successful final green; removed by explicit user request)

| Planned ID | Exact historical executable target | Historical Vitest function name(s) |
| ---------- | ----------------------- | ------------------------------------- |
| `PT-005` | `test/uni-spec/lint-contract.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical names: LINT-01..LINT-07 matrix/boundary; target paths/links/dependencies; L0 PASS; independent L1-L4 derivations; L5 issue/goal roots and US-07 detector; exact five goal-document scope inspection. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | L0-L5 fixtures cover every rule and prevent omission of an existing rule from the written matrix. | `PT-005-H1` |
| `Input/Routing` | `covered` | Findings retain observed paths and route each malformed input to the applicable rule. | `PT-005-H2` |
| `Lifecycle/Model` | `covered` | PASS/FAIL and continued evaluation semantics define complete inspection outcomes. | `PT-005-H3` |
| `Durability/Recovery` | `covered` | Parser failure continuation and complete finding records model recovery from broken metadata. | `PT-005-H4` |
| `Output/Filesystem` | `covered` | Shape, links, paths, lines, and remediation are observable output contracts. | `PT-005-H5` |
| `Cross-Feature` | `covered` | Rules combine metadata, aspects, routes, token detection, and docs-only scope. | `PT-005-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-005-H1` | `.arca/goal/design.md#declarative-lint-contract` | Remove or reorder one rule from the LINT-01 through LINT-07 matrix. | `Regression` | Written matrix still names all seven rules and L0-L5 traces exercise them. | `standard-maintainer` |
| `PT-005-H2` | `.arca/goal/design.md#declarative-lint-contract` | Feed malformed shape, metadata, content, token, link, and scope examples. | `Input/Routing` | Each finding names the applicable rule and issue/goal-relative path. | `standard-maintainer` |
| `PT-005-H3` | `.arca/goal/design.md#declarative-lint-contract` | Compare complete finding sets for PASS and FAIL folders. | `Lifecycle/Model` | PASS occurs only for zero findings; FAIL retains all findings with no short-circuit. | `standard-maintainer` |
| `PT-005-H4` | `.arca/goal/design.md#declarative-lint-contract` | Use L2 duplicate-key/non-scalar metadata and inspect independent traces. | `Durability/Recovery` | Metadata failure is recorded and LINT-01, LINT-02, LINT-04-LINT-07 continue. | `standard-maintainer` |
| `PT-005-H5` | `.arca/goal/design.md#declarative-lint-contract` | Validate line/null, observed, expected, remediation, and path fields. | `Output/Filesystem` | Every written finding has exactly six conceptual fields and actionable remediation. | `standard-maintainer` |
| `PT-005-H6` | `.arca/goal/design.md#declarative-lint-contract` | Cross-check L0-L5 examples against five-file, metadata, aspect, route, and scope contracts. | `Cross-Feature` | Written fixture oracle covers interactions and ignores inherited OpenSpec for LINT-07. | `standard-maintainer` |

## Post-build sanitation

P4/P5 targets and mappings are historical only: the last green result was `106 files, 1894 passed, 22 skipped`, recorded in `.arca/current/log.md`; `test/uni-spec/` was removed by explicit user request after that successful run and is not runnable in the sanitized workspace.
