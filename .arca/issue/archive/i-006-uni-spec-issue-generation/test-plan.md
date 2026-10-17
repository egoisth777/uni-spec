# Test plan

## Verification

Source-provided checks for the requirement records in [spec.md](./spec.md). Each check is executable against the built CLI; none requires a live network.

| Check ID | Request Refs | Procedure | Expected Evidence |
| --- | --- | --- | --- |
| C-001 | R-001, R-005 | Scaffold one package into an empty directory, then enumerate the created directory's entries and their file kinds. | Exactly five regular files named `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, `test-plan.md`; no `README.md`, no `.openspec.yaml`, no subdirectory, no symlink. |
| C-002 | R-002 | Scaffold into a parent already containing `i-001-old`, `i-003-existing`, and a malformed `i-002-`, supplying the title `Terminal archive sweep`. | The new directory is `i-004-terminal-archive-sweep`; the smallest unused positive integer is chosen across malformed candidates and rendered with at least three digits. |
| C-003 | R-002 | Scaffold with each of the titles `Loop cleanup archive sweep now`, `Sweep`, `` (empty), and `---`. Then rename the title in `index.md` and re-run status. | Slugs are `loop-cleanup-archive-sweep` (first four tokens only), `sweep-issue`, `untitled-issue`, and `untitled-issue` respectively; the frozen `issue-id` does not change after the title changes. |
| C-004 | R-001, R-003 | Run the status command against a freshly scaffolded package and against one whose `spec.md` is complete. | Status reports five aspects, never `proposal`, `specs`, or `tasks`; `design` and `test-plan` are blocked until `spec` is complete, and `index` is blocked by nothing. |
| C-005 | R-004 | Compare each generated aspect file, before any user edit, against its source in `standard/templates/issue/`. | Byte-for-byte identical apart from documented placeholder substitution; a deliberate edit to a `standard/templates/issue/` file changes the generated output or fails a drift check. |
| C-006 | R-005 | Set `status: integrated` in a package's `index.md` by hand, then re-read state through the CLI. | Reported lifecycle state is `integrated`, derived from frontmatter; no CLI-owned state inside the package contradicts it. |
| C-007 | R-006 | Lint the `L0` through `L5` fixtures in `standard/examples/` and compare against the recorded expectations in `standard/examples/lint-findings/`. | `L0` PASSes with zero findings after all seven rules evaluate; `L1` through `L5` FAIL with exactly the recorded findings, each carrying rule ID, path, line or null, observed, expected, and remediation; evaluation never stops early. |
| C-008 | R-006 | Lint a conforming package and a package with one extra entry, checking the process exit code. | Zero exit on PASS, non-zero exit on any finding. |
| C-009 | R-007 | Convert each `standard/examples/conversion-c0/source.md` through `conversion-c6/source.md` and compare with the recorded traces and the filled outputs in `standard/examples/conversion-outputs/`. | Title selection, source and document encounter order, `R-00n` assignment, and the exact absence and `undecided` sentences match the recorded outputs literally; running the same conversion twice produces identical bytes. |
| C-010 | R-008 | Diff every file under `standard/` against its pre-change baseline, and re-apply the `LINT-07` scope inspection to the five `.arca/goal/` documents. | `standard/` is byte-identical to baseline, or any diff introduces no normative requirement for a command, API, runtime, converter, linter, package, dependency, orchestration, or implementation plan; `LINT-07` records zero findings for `US-01` through `US-12`. This is an invariance check, not a word search: `standard/index.md` and `.arca/goal/design.md` legitimately contain the words `CLI`, `API`, and `runtime` in the sentences that deny executable behavior, so their presence proves nothing either way. |
| C-011 | R-009 | Run the CLI help output and the full test suite after the retirement pass. | Only the surface the reviewer approved is present; no removed command remains reachable, and no test or completion definition references a removed command. |

`C-009` covers the `deferred` [`R-007`](./spec.md) and carries no forward authority; it is retained as incoming evidence for the follow-up planning pass and rolls up into no goal check.

## Goal/Test File Traces

Updated at P1 integration. Every goal file was amended to add the separately scoped applier slice; no `US-01` through `US-20` requirement wording, decision, or ID changed.

| Goal/Test File | Status | Reverse Issue Refs |
| --- | --- | --- |
| `.arca/goal/index.md` | amended | Summary, integrated-issue route, and scope paragraph now name the separately scoped applier `US-21`-`US-26` alongside the docs-only standard ([`R-008`](./spec.md)). |
| `.arca/goal/ubi-lang.md` | amended | Added `applier`, `applier surface`, `identity allocation`, `sidecar metadata`, and `template authority`. `issue package` was not added: the existing `issue folder` term already names it ([`R-001`](./spec.md), [`R-002`](./spec.md)). |
| `.arca/goal/spec.md` | amended | New `Integrated uni-spec applier requirements` section carries `US-21` through `US-26` for the accepted records; the purpose paragraph names the one-way dependency ([`R-001`](./spec.md) through [`R-006`](./spec.md), [`R-008`](./spec.md), [`R-009`](./spec.md)). |
| `.arca/goal/design.md` | amended | New `Integrated uni-spec applier mapping` covers schema, identity, template authority, lint, boundary, and surface; the overview, `LINT-07` scope row, and docs-only boundary now exclude applier scope ([`R-001`](./spec.md) through [`R-006`](./spec.md), [`R-008`](./spec.md), [`R-009`](./spec.md)). |
| `.arca/goal/test-list.md` | amended | Added `T-021` through `T-026`, rolling up `C-001` through `C-008`, `C-010`, and `C-011`; `T-007` now explicitly ignores applier implementation. `C-009` rolls up nowhere because [`R-007`](./spec.md) is deferred. |

## Contributor Authority/Schema Traces

| Authority or Schema Artifact | Status | Integration and Reverse Refs |
| --- | --- | --- |
| `AGENTS.md` | unaffected | Routing to `.arca/index.md` is unchanged. |
| `.arca/index.md` | unaffected | Working rules already cover this work; no new phase or record type is required. |
| `schemas/spec-driven/schema.yaml` | superseded | [`R-003`](./spec.md) is accepted as replacement, not coexistence; the four-artifact schema is frozen with the rest of the root heritage and leaves in the [`R-009`](./spec.md) prune pass. |
| `standard/templates/issue/` | unaffected | Confirmed as the single template authority by accepted [`R-004`](./spec.md); its content does not change. |
| `.arca/tpl/issue/index.md` | unaffected | Noted defect, out of this issue's scope: the working blank still uses a fenced `yaml` block with a `provenance` key, while `.arca/index.md` and every real issue use byte-1 `---` frontmatter with `origin`. |
