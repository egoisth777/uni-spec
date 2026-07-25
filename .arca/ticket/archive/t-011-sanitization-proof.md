---
ticket-id: "t-011-sanitization-proof"
residual-ids:
  - "residual-us-12"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-12)"
  - ".arca/goal/test-list.md#verification (T-012)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-011"
dependencies:
  - "t-007-website-purge"
  - "t-008-openspec-purge"
  - "t-009-adjacent-residue"
  - "t-010-minimal-retention"
status: "done"
---

# Ticket: t-011-sanitization-proof

## Vertical slice

Run the final absence searches for upstream identity and deleted paths, resolve Markdown links in retained `standard/` and `.arca/`, inspect the required five-file issue shape and retained tree, and run all applicable checks. Publish one evidence record that proves both absence and preservation; do not weaken checks to obtain green.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-011` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-12`) | Post-t-010 retained tree, `.arca/`, and `standard/` | `repository-audit PT-011` | Zero unapproved upstream/deleted-path findings, all retained links resolve, required issue artifacts conform, and applicable checks pass. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Reintroduces known OpenSpec identity and confirms detection. | `PT-011-H1` |
| `Input/Routing` | covered | Resolves local Markdown routes and checks deleted destinations. | `PT-011-H2` |
| `Lifecycle/Model` | covered | Requires final proof only after all purge slices. | `PT-011-H3` |
| `Durability/Recovery` | covered | A failed check blocks closure rather than being suppressed. | `PT-011-H4` |
| `Output/Filesystem` | covered | Inspects final retained files and exact issue shapes. | `PT-011-H5` |
| `Cross-Feature` | covered | Combines identity absence, links, standard, and governance checks. | `PT-011-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-011-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Add a branded string to retained content. | `Regression` | Forbidden-identity search fails. | `purge-maintainer` |
| `PT-011-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Point a retained route at a deleted path. | `Input/Routing` | Link check fails. | `purge-maintainer` |
| `PT-011-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Run proof before dependent tickets. | `Lifecycle/Model` | Closure is rejected. | `purge-maintainer` |
| `PT-011-H4` | `.arca/goal/test-list.md#verification` | Make an applicable check fail. | `Durability/Recovery` | Failure remains visible and blocks status. | `purge-maintainer` |
| `PT-011-H5` | `.arca/goal/test-list.md#verification` | Remove one required retained artifact. | `Output/Filesystem` | Shape/allowlist proof fails. | `purge-maintainer` |
| `PT-011-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Cross-check all final evidence classes. | `Cross-Feature` | Ticket closes only with complete proof. | `purge-maintainer` |

## Completion evidence

- PT-011 red was run before the proof record existed and failed for the intended semantic reason: `.arca/io/t-011-sanitization-proof.json` was absent. The PT-011 source was ephemeral and was never committed, so this runtime evidence is not Git-recoverable and has no claimed source hash.
- PT-011 then passed 6/6; strict TypeScript passed; PT-007 through PT-010 passed 9/9; and the last pre-sanitation full suite passed 5 files and 15 tests.
- `.arca/io/t-011-sanitization-proof.json` records truthful command/result evidence, four Git-recoverable removed-test blobs with source commits and SHA-256 values, the non-recoverable PT-011 runtime note, exact final root counts, exact final `.gitignore`, and post-sanitation static verification. The executable harness was intentionally removed after that green run and is historical, not runnable in the sanitized tree.
- Post-sanitation stdlib verification passed with exact roots `.arca`, `.gitignore`, `AGENTS.md`, and `standard`; all 120 ordinary local links and 2 external links were validated, with only 22 explicitly enumerated invalid-fixture links excluded (not a broad `standard/examples/` exclusion); eight issue-shape directories conform, five conversion outputs are present, and all residual/ticket mappings are consistent.
