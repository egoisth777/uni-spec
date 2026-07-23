---
ticket-id: "t-002-issue-naming"
residual-ids:
  - "residual-us-02"
behavior-refs:
  - ".arca/goal/spec.md#source-requests"
  - ".arca/goal/design.md#naming"
  - ".arca/goal/test-list.md#verification"
  - ".arca/goal/test-list.md#conversion-state-traces-tl-05-coverage"
design-refs:
  - ".arca/goal/design.md#naming"
planned-test-refs:
  - "PT-002"
dependencies:
  - "t-001-five-file-package"
status: "done"
---

# Ticket: t-002-issue-naming

## Normative standard change

Extend `standard/issue-format.md` with the naming and allocation contract. An issue directory MUST be `i-<nnn>-<slug>`: a positive ASCII decimal number rendered with at least three digits (`000` is invalid), followed by two to four lowercase ASCII-alphanumeric slug components separated by single hyphens. Normalize each supplied title by trimming and collapsing whitespace, choose the first non-empty title in source encounter order, then lowercase that selected title BEFORE replacing each maximal non-`[a-z0-9]` run (characters outside ASCII `[a-z0-9]`) with hyphens. Trim hyphens, split into non-empty tokens, and take four tokens; use `untitled-issue` for zero tokens and append `issue` for one token. The mixed-case title `Hello World` MUST therefore produce `hello-world` (lowercasing precedes replacement, rather than merely checking a final lowercase regex). The selected number is the smallest unused positive integer among every direct-child directory of the target parent beginning `i-<digits>-`, including malformed remainders such as `i-001-old`; render it with at least three digits. Freeze both folder identity and `index.md` `issue-id` after creation. The standard MUST distinguish creation-time derivation from later observable lint checks and MUST remain declarative.

## Examples and fixtures

- C4 fixture: `standard/examples/naming-c4/` with supplied title `Original issue` and siblings `i-001-old` and `i-003-existing`, expected allocation `i-002-original-issue`, followed by a changed supplied title that leaves identity frozen.
- C5 fixture: `standard/examples/naming-c5/` with an empty title, then mixed-case `Hello World`, then a later non-empty title; expected first non-empty selection and slug `hello-world`, not merely a final-regex validity check.
- Invalid-name fixtures: `standard/examples/naming-invalid/` for zero, too-short slug, uppercase, and sibling collision.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-002` | `.arca/goal/design.md#naming` | `standard/examples/naming-c4/`, `standard/examples/naming-c5/`, `standard/examples/naming-invalid/` | `test/uni-spec/issue-naming.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical Vitest inspection asserted C4 allocation, C5 first non-empty mixed-case title and frozen identity, blank-token rejection, and no conversion or product call. |

## P4 Runnable Test Mapping (historical; sanitized after successful final green; removed by explicit user request)

| Planned ID | Exact historical executable target | Historical Vitest function name(s) |
| ---------- | ----------------------- | ------------------------------------- |
| `PT-002` | `test/uni-spec/issue-naming.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical function names: syntax/positivity; normalization and token bounds; first-title encounter order; input/document visitation; malformed-sibling reservation; identity freeze; C4/C5 traces; invalid-name fixtures; documentary/no-allocator boundary. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | Examples pin all slug, padding, positivity, reservation, and freeze invariants, including the lowercase-before-replacement ordering. | `PT-002-H1` |
| `Input/Routing` | `covered` | Source encounter order and first non-empty title selection are explicit routing inputs, with a mixed-case title oracle. | `PT-002-H2` |
| `Lifecycle/Model` | `covered` | Creation identity is frozen while later inspection only observes syntax and uniqueness. | `PT-002-H3` |
| `Durability/Recovery` | `covered` | C4/C5 traces preserve identity across later title input and malformed siblings. | `PT-002-H4` |
| `Output/Filesystem` | `covered` | Expected output names and parent sibling allocation are asserted from written fixtures. | `PT-002-H5` |
| `Cross-Feature` | `covered` | Folder name and index identity are checked together with five-file shape. | `PT-002-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-002-H1` | `.arca/goal/design.md#naming` | Try `000`, uppercase, malformed component counts, and collisions. | `Regression` | Invalid names are documented as failing the exact pattern or positive/unique-number rule, with no blank slug tokens. | `standard-maintainer` |
| `PT-002-H2` | `.arca/goal/design.md#naming` | Present an empty title, then mixed-case `Hello World`, then a later non-empty title in encounter order. | `Input/Routing` | The first normalized non-empty title is lowercased before replacement and supplies exactly `hello-world`; later titles cannot win. | `standard-maintainer` |
| `PT-002-H3` | `.arca/goal/design.md#naming` | Compare creation trace with later lint observation. | `Lifecycle/Model` | Creation derives and freezes identity; lint claims only observable syntax and sibling uniqueness. | `standard-maintainer` |
| `PT-002-H4` | `.arca/goal/test-list.md#conversion-state-traces-tl-05-coverage` | Replay C4 with malformed sibling and changed title. | `Durability/Recovery` | Number 2 and original slug remain stable in folder and index examples. | `standard-maintainer` |
| `PT-002-H5` | `.arca/goal/design.md#naming` | Inspect rendered directory and sibling collection examples. | `Output/Filesystem` | Number is at least three digits and smallest unused positive value. | `standard-maintainer` |
| `PT-002-H6` | `.arca/goal/design.md#naming` | Pair name identity with the five-file package's index identity. | `Cross-Feature` | Folder name, index `issue-id`, and shape examples agree exactly. | `standard-maintainer` |

## P4/P5 evidence (historical)

- Historical P4 red and P5 specific-green runs completed before sanitation; the final historical result was `106 files, 1894 passed, 22 skipped`, recorded in append-only `.arca/current/log.md`.
- Product evidence: `standard/issue-format.md` and `standard/index.md` define the naming/allocation/freeze contract; C4, C5, and invalid-name documentary fixtures are linked under `standard/examples/`. No CLI, API, runtime allocator, converter, linter, package, dependency, or product implementation was added.

## Post-build sanitation

P4/P5 targets and mappings are historical only; `test/uni-spec/` was removed by explicit user request after successful final green and is not runnable in the sanitized workspace.
