---
ticket-id: "t-003-index-metadata"
residual-ids:
  - "residual-us-03"
behavior-refs:
  - ".arca/goal/spec.md#source-requests"
  - ".arca/goal/design.md#index-identity-and-frontmatter"
  - ".arca/goal/test-list.md#verification"
design-refs:
  - ".arca/goal/design.md#index-identity-and-frontmatter"
planned-test-refs:
  - "PT-003"
dependencies:
  - "t-001-five-file-package"
status: "done"
---

# Ticket: t-003-index-metadata

## Normative standard change

Add the index metadata contract to `standard/issue-format.md` and create the canonical blank-free template at `standard/templates/issue/index.md`. The file MUST begin at byte 1 with an exact `---` line and close frontmatter with a later exact `---` line. The enclosed YAML MUST be strict and parseable, contain exactly one scalar each of `issue-id`, `origin`, and `status`, and contain no other keys or duplicate keys. `issue-id` MUST equal the full containing directory name, `origin` MUST be non-empty and preserve the actual source reference, and `status` MUST be exactly `pending`, `integrated`, or `rejected`. After frontmatter, require a non-empty source-grounded `## Summary` or the exact absence sentence `No source-grounded summary available.`, followed by a `## Routes` table with exactly `Need` and `File` columns and relative links to all four companions. The template MUST describe placeholders only as concrete-writing guidance and contain no unresolved double-brace token in a product example.

This ticket is declarative and MUST NOT add a parser, validator, CLI, API, runtime, converter, linter, package, dependency, or orchestration code.

## Examples and fixtures

- Canonical template: `standard/templates/issue/index.md`.
- Valid byte/metadata example: `standard/examples/index-metadata-valid/`.
- Invalid examples: `standard/examples/index-metadata-invalid/duplicate-key.md`, `non-scalar-status.md`, `wrong-identity.md`, and `leading-byte.md`.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-003` | `.arca/goal/design.md#index-identity-and-frontmatter` | `standard/templates/issue/index.md`, `standard/examples/index-metadata-valid/`, `standard/examples/index-metadata-invalid/` | `test/uni-spec/index-metadata.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical Vitest inspection asserted byte-1 delimiters, strict scalar keys, origin/status/identity, summary/routes, and each invalid fixture. |

## P4 Runnable Test Mapping (historical; sanitized after successful final green; removed by explicit user request)

| Planned ID | Exact executable target | Historical Vitest function name(s) |
| ---------- | ----------------------- | ------------------------------------- |
| `PT-003` | `test/uni-spec/index-metadata.test.ts` (sanitized after successful final green; removed by explicit user request) | Historical names: canonical template/valid metadata; CRLF delimiters; invalid fixtures; delimiter/YAML/identity/origin/status/routes hole-pokes; front-door routing. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | Valid and invalid metadata examples lock down the complete frontmatter contract. | `PT-003-H1` |
| `Input/Routing` | `covered` | Origin and route destinations are explicit index routing fields. | `PT-003-H2` |
| `Lifecycle/Model` | `covered` | Status enum and identity matching model issue lifecycle without implementation. | `PT-003-H3` |
| `Durability/Recovery` | `covered` | Byte-level and duplicate-key cases catch corruption that text-only checks could miss. | `PT-003-H4` |
| `Output/Filesystem` | `covered` | Template path, directory identity, and relative route outputs are inspected. | `PT-003-H5` |
| `Cross-Feature` | `covered` | Index routes connect the five-file shape and all companion aspect contracts. | `PT-003-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-003-H1` | `.arca/goal/design.md#index-identity-and-frontmatter` | Mutate delimiters, key count, scalar values, and summary. | `Regression` | Only exact valid metadata passes; every listed mutation yields an actionable expected failure. | `standard-maintainer` |
| `PT-003-H2` | `.arca/goal/design.md#index-identity-and-frontmatter` | Change origin or one of four route destinations. | `Input/Routing` | Origin remains non-empty source reference and routes resolve relatively to each companion. | `standard-maintainer` |
| `PT-003-H3` | `.arca/goal/design.md#index-identity-and-frontmatter` | Try each allowed status and a disallowed status. | `Lifecycle/Model` | `pending`, `integrated`, and `rejected` are accepted; all other values are rejected. | `standard-maintainer` |
| `PT-003-H4` | `.arca/goal/design.md#index-identity-and-frontmatter` | Add a leading byte, duplicate key, or non-scalar value. | `Durability/Recovery` | Byte-1, parser, duplicate-key, and scalar oracles identify the exact malformed condition. | `standard-maintainer` |
| `PT-003-H5` | `.arca/goal/design.md#index-identity-and-frontmatter` | Compare template and valid issue paths. | `Output/Filesystem` | Canonical template exists at the specified path and valid issue identity matches its containing folder. | `standard-maintainer` |
| `PT-003-H6` | `.arca/goal/design.md#index-identity-and-frontmatter` | Resolve all four routes while checking companion requirements. | `Cross-Feature` | Routes resolve to exactly the four files required by the package contract. | `standard-maintainer` |

## P4/P5 evidence (historical)

- Historical P4 red and P5 specific-green runs completed before sanitation; the final historical result was `106 files, 1894 passed, 22 skipped`, recorded in append-only `.arca/current/log.md`.
- Product evidence: `standard/issue-format.md` and `standard/index.md` define byte-1 strict YAML metadata, identity/origin/status constraints, summary and four routes, and template routing; `standard/templates/issue/index.md`, `standard/examples/index-metadata-valid/`, and all four approved invalid fixtures provide documentary evidence. No parser, validator, CLI, API, runtime, converter, linter, package, dependency, or orchestration code was added.

## Post-build sanitation

P4/P5 targets and mappings are historical only; `test/uni-spec/` was removed by explicit user request after successful final green and is not runnable in the sanitized workspace.
