# Design

## Observed starting point

| Concern | Where it lives today | What it produces |
| --- | --- | --- |
| Scaffold | `src/commands/workflow/new-change.ts` → `src/utils/change-utils.ts` | `openspec/changes/<name>/` with `.openspec.yaml` and `README.md` |
| Artifact model | `src/core/artifact-graph/` (`graph.ts`, `state.ts`, `resolver.ts`, `instruction-loader.ts`) | four `spec-driven` artifacts with a dependency graph |
| Schema source | `schemas/spec-driven/schema.yaml` and its four templates, resolved by `src/core/artifact-graph/resolver.ts` | `proposal`, `specs`, `design`, `tasks` |
| Sidecar state | `src/core/change-metadata/schema.ts` | `.openspec.yaml` written **inside** the change folder |
| Standard | `standard/` plus `standard/templates/issue/` | five aspect files, applied by hand |

The artifact-graph machinery is schema-driven and largely reusable. The incompatibility is concentrated in the schema definition, the identity rule, and the in-folder sidecar.

## Proposed design

| Request IDs | Proposal |
| --- | --- |
| R-001 | Add `schemas/uni-spec/schema.yaml` declaring exactly five artifacts whose `generates` values are the five aspect filenames at the package root, with no nested path and no generated sixth entry. Point the scaffold command at it and delete the `README.md` write, so a freshly created package passes the package boundary in `standard/issue-format.md` immediately rather than after manual cleanup. |
| R-001, R-003 | Express the aspect dependency order in the schema: `index` requires nothing, `spec` requires `index`, `ubi-lang` requires `index`, `design` requires `spec`, `test-plan` requires `spec`. `status` then reports `n/5` in uni-spec vocabulary through the existing `src/core/artifact-graph/state.ts` without new machinery. |
| R-002 | Implement identity allocation as one pure function over the parent directory listing: match sibling directories against `i-<digits>-`, including malformed candidates such as `i-001-old`, take the smallest unused positive integer, render it with at least three digits, and reject `000`. Derive the slug by lowercasing, replacing non-`[a-z0-9]` runs with `-`, trimming, taking the first four tokens, substituting `untitled-issue` for zero tokens and appending `issue` to a single token. Write `issue-id` into the `index.md` frontmatter at creation and never recompute it. |
| R-004 | Resolve aspect templates from the shipped `standard/templates/issue/` directory rather than copying them under `schemas/`. If build-time embedding is preferred for a published binary, add a test that fails when an embedded template diverges byte-for-byte from its `standard/templates/issue/` source. |
| R-005 | Drop `.openspec.yaml` from the package. Derive lifecycle state from the `index.md` frontmatter keys `issue-id`, `origin`, and `status`, which the standard already requires to be strict, byte-1, and parseable. Any operational state the CLI still needs lives beside the collection, never inside a package. |
| R-006 | Add `uni-spec lint <path>` implementing `LINT-01` through `LINT-07` exactly as written in `standard/lint.md`: evaluate every rule even after a finding, emit findings with rule ID, issue-relative path, line or null, observed, expected, and remediation, PASS only at zero findings, and exit non-zero on any finding. The existing `validate` command is the natural host if its OpenSpec semantics are retired under `R-009`. |
| R-007 | If accepted rather than deferred, implement `C0`–`C6` from `standard/conversion.md` as a separate pure conversion stage that emits an in-memory package, then reuse the `R-001` writer. Keep the deterministic ordering rules and the exact absence and `undecided` sentences as literal constants under test, since they are the parts an implementer paraphrases by accident. |
| R-008 | Add no command, runtime, or plan requirement to any file under `standard/`. The dependency runs one way: the CLI depends on the standard, and the standard neither depends on nor requires the CLI. The standard's existing CLI, API, and runtime references are the sentences that **deny** executable scope — in `standard/index.md`, `issue-format.md`, `lint.md`, and `conversion.md` — and those references enforce the separation, so they stay. `LINT-07` is scoped to the goal documents and already ignores workspace implementation, so a one-way dependency keeps the docs-only boundary intact. |
| R-009 | Recommended, subject to review: rename the binary to `uni-spec`, keep `lint` and the scaffold, and remove `change`, `archive`, `spec`, `store`, `workset`, `view`, `doctor`, and `context` together with their tests and completions in one deletion ticket, so the surface matches the product instead of its ancestor. Telemetry (`posthog-node`) reports to the upstream project and should go with them. |

## Sequencing

`R-002` and `R-004` are pure functions with no CLI coupling and can be built and tested first. `R-001`, `R-003`, and `R-005` form the scaffold slice. `R-006` is independent of the scaffold and can be built in parallel. `R-007` is the only large slice and is the natural deferral. `R-009` is a deletion pass and should come last so it does not churn code the earlier slices touch.

## Risk

The recovered CLI has no test coverage for the OpenSpec command surface in this repository: `test/` currently holds only `t-012` through `t-019`, which cover CLI recovery, purge, and archive governance, not command behavior. Any transformation of `src/` is therefore unguarded by regression tests today, so each accepted requirement needs its own tests written before its code, per P4.

This file is incoming evidence. Integrated mechanics remain authoritative only in the accepted forward authority.
