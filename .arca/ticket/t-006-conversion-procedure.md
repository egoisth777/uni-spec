---
ticket-id: "t-006-conversion-procedure"
residual-ids:
  - "residual-us-05"
behavior-refs:
  - ".arca/goal/spec.md#source-requests"
  - ".arca/goal/design.md#declarative-conversion"
  - ".arca/goal/test-list.md#conversion-state-traces-tl-05-coverage"
design-refs:
  - ".arca/goal/design.md#declarative-conversion"
planned-test-refs:
  - "PT-006"
dependencies:
  - "t-001-five-file-package"
  - "t-002-issue-naming"
  - "t-003-index-metadata"
  - "t-004-aspect-contracts"
  - "t-005-lint-contract"
status: "done"
---

# Ticket: t-006-conversion-procedure

## Normative standard change

Create `standard/conversion.md` as a written, deterministic procedure for C0-C6. Define C0 collection of one or many legacy documents, tracker records, inline inputs, or broken folders in supplied-input then document order. Serialize the sole canonical `index.md` `origin` exactly: preserve source references in encounter order; serialize one reference as-is; serialize multiple references joined by the exact delimiter `; `; if there are no source references, serialize exactly `inline input (no source identifier)`. Define C1 source routing without duplicated authority. Define C2 title fallback from the first non-empty sentence of the first source ask; when neither a non-empty supplied title nor any non-empty sentence in source asks exists, select the exact title `Untitled issue`. Define C3 exact absence declarations and no invented content, including the requestless fallback slug `untitled-issue`. Define C4 smallest unused positive number including malformed sibling candidates and frozen identity. Define C5 first non-empty supplied title after trim/collapse and frozen later title changes. Define C6 source-provided disposition/rationale preservation, `R-001`-style encounter IDs, exact undecided fallback, source-only verification checks, and a post-write complete lint evaluation. Every newly converted `index.md` MUST have frontmatter `status: pending` (the quoted YAML scalar `status: "pending"` is equivalent) before any later lifecycle change.

The procedure MUST require deterministic source-grounded routing: terms to `ubi-lang.md`, asks/evidence to `spec.md`, proposals to `design.md`, source verification to `test-plan.md`, and summary/open questions to `index.md`. It MUST state that conversion completes only after a conforming five-file folder or a complete finding report, and that lint traces are written observations. It MUST explicitly forbid a product converter, CLI/API/runtime, linter implementation, package, dependency, orchestration, apply/archive action, or implementation code.

## Examples and fixtures

- Procedure and traces: `standard/conversion.md` sections `C0` through `C6`.
- Source fixtures: `standard/examples/conversion-c0/` through `conversion-c6/`; the cumulative `standard/examples/conversion-c1/` fixture includes `legacy-a.md`, an unidentified tracker record, and an unidentified inline input, with expected exact origin `legacy-a.md; inline input (no source identifier); inline input (no source identifier)`.
- C3 requestless fixture: `standard/examples/conversion-c3/` has neither a non-empty supplied title nor a non-empty sentence in any source ask; expected output `standard/examples/conversion-outputs/i-007-untitled-issue/` has slug `untitled-issue`, `issue-id` equal to `i-007-untitled-issue`, and new-index `status: pending`.
- Output examples: `standard/examples/conversion-outputs/` with source-grounded five-file folders, exact origin serialization, no blank template tokens, and written post-write lint traces.
- C6 comparison oracle: `standard/examples/conversion-c6/comparison.md` compares expected source facts, routes, IDs, dispositions, statuses, origins, and lint trace; no executable converter output is required.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-006` | `.arca/goal/design.md#declarative-conversion` | `standard/examples/conversion-c0/` through `conversion-c6/`, `standard/examples/conversion-outputs/`, and `standard/examples/conversion-c6/comparison.md` | `test/uni-spec/conversion-procedure.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical Vitest comparison asserted deterministic C0-C6 observations, exact origin joining, requestless fallback, pending status, and no blank tokens without invoking a converter or linter product. |

## P4 Runnable Test Mapping (historical; sanitized after successful final green; removed by explicit user request)

| Planned ID | Exact historical executable target | Historical Vitest function name(s) |
| ---------- | ----------------------- | ------------------------------------- |
| `PT-006` | `test/uni-spec/conversion-procedure.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical names: C0-C6 source/trace mapping; encounter order/IDs/routes/origins/fallbacks; slug derivation/C4/C5 freeze; T-001 assignment/C6 no-invention gaps; output PASS by lint rule. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | C0-C6 each pin a conversion rule and expected source-grounded output, including fallback slug, pending status, and exact origin serialization. | `PT-006-H1` |
| `Input/Routing` | `covered` | Encounter order, title fallback, origin serialization, and aspect routing are explicit comparison inputs. | `PT-006-H2` |
| `Lifecycle/Model` | `covered` | Identity freeze, pending initial status, dispositions, request IDs, and completion-after-lint define procedure state transitions. | `PT-006-H3` |
| `Durability/Recovery` | `covered` | Broken folders and parser failures remain evidence while outputs receive complete lint traces; requestless C3 still yields `untitled-issue`. | `PT-006-H4` |
| `Output/Filesystem` | `covered` | Expected five-file outputs, exact origin strings, route paths, pending statuses, and post-write traces are compared on disk. | `PT-006-H5` |
| `Cross-Feature` | `covered` | Conversion output is checked against package, naming, metadata, aspect, and lint contracts together. | `PT-006-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-006-H1` | `.arca/goal/design.md#declarative-conversion` | Omit or reorder a C0-C6 trace while retaining other traces. | `Regression` | Procedure and comparison oracle require every C0-C6 state in order, with no blank template tokens. | `standard-maintainer` |
| `PT-006-H2` | `.arca/goal/design.md#declarative-conversion` | Vary source order, empty titles, identifiers, and source document order, including three refs in the multi-source fixture. | `Input/Routing` | Origin preserves encounter order, uses one ref as-is, joins multiple refs with exact `; `, uses exact no-ref literal, and title/aspect routes match exactly. | `standard-maintainer` |
| `PT-006-H3` | `.arca/goal/design.md#declarative-conversion` | Apply C4/C5 title and sibling changes after creation; vary disposition completeness and inspect a newly written index. | `Lifecycle/Model` | Folder/index identity stays frozen; every new index starts with `status: pending`; invalid or partial disposition becomes exact undecided fallback. | `standard-maintainer` |
| `PT-006-H4` | `.arca/goal/design.md#declarative-conversion` | Use broken input and a requestless C3 source with no title and no non-empty ask sentence; record parser-independent post-write inspection. | `Durability/Recovery` | Broken source is not authority; requestless output slug is exactly `untitled-issue`, output retains questions and complete lint trace, and no blank tokens appear. | `standard-maintainer` |
| `PT-006-H5` | `.arca/goal/design.md#declarative-conversion` | Compare each expected output path, five-file listing, frontmatter, and multi-source origin to the source trace. | `Output/Filesystem` | Written output contains exactly the planned files, canonical routes, exact joined origin, `status: pending` for each newly converted index, and source-grounded trace artifacts. | `standard-maintainer` |
| `PT-006-H6` | `.arca/goal/design.md#declarative-conversion` | Cross-check conversion result with completed package, naming, metadata, aspect, and lint standards. | `Cross-Feature` | Comparison passes only when all upstream contracts and post-write lint semantics agree. | `standard-maintainer` |

## Post-build sanitation

P4/P5 targets and mappings are historical only: the last green result was `106 files, 1894 passed, 22 skipped`, recorded in `.arca/current/log.md`; `test/uni-spec/` was removed by explicit user request after that successful run and is not runnable in the sanitized workspace.
