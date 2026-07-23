---
ticket-id: "t-004-aspect-contracts"
residual-ids:
  - "residual-us-04"
behavior-refs:
  - ".arca/goal/spec.md#source-requests"
  - ".arca/goal/design.md#aspect-content-contracts"
  - ".arca/goal/test-list.md#verification"
design-refs:
  - ".arca/goal/design.md#aspect-content-contracts"
planned-test-refs:
  - "PT-004"
dependencies:
  - "t-001-five-file-package"
  - "t-002-issue-naming"
  - "t-003-index-metadata"
status: "done"
---

# Ticket: t-004-aspect-contracts

## Normative standard change

Complete `standard/issue-format.md` with every companion contract and create the remaining four canonical templates under `standard/templates/issue/`: `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`. Require `ubi-lang.md` `## Terms` with exactly `Term`/`Meaning` columns and a non-empty row, or exact `No issue-specific terms.`. Require `spec.md` `## Source requests` with exactly `Request ID`/`Source ask`/`Disposition`/`Rationale`, stable IDs, allowed dispositions, and non-empty rationales, or exact `No issue-specific requests.`. Require `design.md` `## Proposed design` with exactly `Request IDs`/`Proposal`, non-empty proposals mapped to existing request IDs, or exact `No issue-specific design proposed.`. Require `test-plan.md` `## Verification` with exact `Check ID`/`Request Refs`/`Procedure`/`Expected Evidence` columns, deterministic IDs, eligible request coverage, and exact absence declarations.

All content remains normative documentation; no product implementation, CLI/API/runtime converter or linter code was added.

## Examples and fixtures

- Remaining templates: `standard/templates/issue/ubi-lang.md`, `standard/templates/issue/spec.md`, `standard/templates/issue/design.md`, `standard/templates/issue/test-plan.md`.
- Fully conforming issue: `standard/examples/fully-conforming/i-004-cross-aspect/`.
- Invalid cross-aspect fixtures: `standard/examples/aspect-invalid/` for missing columns, empty required fields, blank tokens, bad request references, and broken local links.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-004` | `.arca/goal/design.md#aspect-content-contracts` | `standard/examples/fully-conforming/i-004-cross-aspect/`, `standard/examples/aspect-invalid/`, and `standard/templates/issue/` | `test/uni-spec/aspect-contracts.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical Vitest inspection covered all five files, exact headings/columns/absence alternatives, non-empty fields, request/check mapping, blank-token absence, and relative links. |

## P4 Runnable Test Mapping (historical; sanitized after successful final green; removed by explicit user request)

| Planned ID | Exact executable target | Historical Vitest function name(s) |
| ---------- | ----------------------- | ------------------------------------- |
| `PT-004` | `test/uni-spec/aspect-contracts.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical names: canonical templates; copied-template rejection; verification absence; four-digit IDs; complete cross-aspect issue/routes; adversarial fixtures; absence/content/reference/ID/link hole-pokes. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | The conforming issue and each invalid aspect fixture exercise the complete companion matrix. | `PT-004-H1` |
| `Input/Routing` | `covered` | Requests, design rows, checks, terms, and routes are checked for correct aspect ownership. | `PT-004-H2` |
| `Lifecycle/Model` | `covered` | Disposition and verification eligibility constrain records without inventing lifecycle behavior. | `PT-004-H3` |
| `Durability/Recovery` | `covered` | Exact absence declarations and actionable malformed fixtures preserve inspectability when source content is absent. | `PT-004-H4` |
| `Output/Filesystem` | `covered` | Five templates and one complete issue are checked at canonical paths with local links. | `PT-004-H5` |
| `Cross-Feature` | `covered` | Cross-aspect request IDs, checks, routes, and links are asserted together. | `PT-004-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-004-H1` | `.arca/goal/design.md#aspect-content-contracts` | Remove one required column or field from each companion fixture. | `Regression` | Exact table schemas, headings, and non-empty fields are required. | `standard-maintainer` |
| `PT-004-H2` | `.arca/goal/design.md#aspect-content-contracts` | Put a term, request, proposal, check, or route in the wrong aspect. | `Input/Routing` | Oracle identifies ownership violation and accepts only the prescribed route. | `standard-maintainer` |
| `PT-004-H3` | `.arca/goal/design.md#aspect-content-contracts` | Vary dispositions and verification references. | `Lifecycle/Model` | Only allowed dispositions and accepted/undecided verification mappings pass. | `standard-maintainer` |
| `PT-004-H4` | `.arca/goal/design.md#aspect-content-contracts` | Replace absent source content with each exact absence declaration or a blank token. | `Durability/Recovery` | Exact absence sentence passes; token or altered sentence fails without inferred content. | `standard-maintainer` |
| `PT-004-H5` | `.arca/goal/design.md#aspect-content-contracts` | Inspect canonical templates and fully conforming output folder. | `Output/Filesystem` | All four templates and all five example files exist at planned paths and remain distinct. | `standard-maintainer` |
| `PT-004-H6` | `.arca/goal/design.md#aspect-content-contracts` | Cross-check design request IDs, test request refs, index routes, and links. | `Cross-Feature` | Every local link resolves to one of five files and every mapping references an existing eligible request. | `standard-maintainer` |

## Post-build sanitation

P4/P5 targets and mappings are historical only: the last green result was `106 files, 1894 passed, 22 skipped`, recorded in `.arca/current/log.md`; `test/uni-spec/` was removed by explicit user request after that successful run and is not runnable in the sanitized workspace.
