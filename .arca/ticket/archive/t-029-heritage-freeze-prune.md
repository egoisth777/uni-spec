---
ticket-id: "t-029-heritage-freeze-prune"
residual-ids:
  - "residual-us-26"
behavior-refs:
  - "../goal/spec.md#integrated-uni-spec-applier-requirements"
design-refs:
  - "../goal/design.md#integrated-uni-spec-applier-mapping"
planned-test-refs:
  - "PT-029"
dependencies:
  - "t-026-five-aspect-schema-status"
  - "t-027-lint-rule-fidelity"
  - "t-028-standard-boundary-guard"
status: "done"
---

# Ticket: t-029-heritage-freeze-prune

Close [`residual-us-26`](../../residual/archive/residual-us-26.md). The `cli/` surface is already correct. The violation is the reverse of the one anticipated: the frozen root heritage *gained* applier work.

Remove from the root heritage the applier duplicates that should never have landed there:

- `src/commands/issue.ts`, `src/core/issue/identity.ts`, `src/core/issue/lint.ts`, `src/core/issue/scaffold.ts`
- `schemas/uni-spec/schema.yaml` (the schema belongs to `cli/`, delivered by [`t-026`](./t-026-five-aspect-schema-status.md))
- the `registerIssueCommand` import at `src/cli/index.ts:26` and its invocation at `:353`
- the duplicate root tests `test/t-020-issue-identity.vitest.test.ts`, `t-021-issue-scaffold`, `t-023-issue-lint`, `t-024-lint-exit-scope`, whose authoritative copies live in `cli/test/` and have already diverged (`cli/test` additionally holds `t-025-issue-collection-lint`)

Before deleting a root test, confirm `cli/test/` covers its assertions; carry over anything that is not duplicated.

Then add the freeze guard that residual-us-26 records as absent, and refresh `.arca/io/t-013-package-build-closure.json` — the removals return `src/` to its recorded module count, which is what makes PT-013 red today.

Ordered last: it deletes code and tests the earlier tickets must not be churning, per the prune-last clause in [`US-26`](../../goal/spec.md#integrated-uni-spec-applier-requirements).

**Out of scope:** removing `change`, `archive`, `spec`, `store`, `workset`, `view`, `doctor`, `context`, and telemetry. US-26 gates that on `cli/` fully replacing the heritage, which has not happened. This ticket restores the freeze; it is not the prune pass for the inherited surface.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-029-a` | [`US-26`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | repository tree | path enumeration | No applier source exists outside `cli/`: `src/core/issue/`, `src/commands/issue.ts`, and `schemas/uni-spec/` are absent. |
| `PT-029-b` | [`T-026`](../../goal/test-list.md#verification) | `src/cli/index.ts` | source inspection and built help | The root CLI registers no `issue` command and no `registerIssueCommand` reference remains. |
| `PT-029-c` | [`T-026`](../../goal/test-list.md#verification) | `cli/bin/uni-spec.js` | built binary `--help` | The applier exposes exactly `issue new` and `issue lint`, plus the status command from `t-026`, and the binary name is `uni-spec`. |
| `PT-029-d` | [`US-26`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | `test/` and `cli/test/` | test-file enumeration | Each applier test name exists exactly once across the repository; no root/`cli` duplicate pair remains. |
| `PT-029-e` | [`US-13`](../../goal/spec.md#integrated-selective-cli-recovery-requirements) | `.arca/io/t-013-package-build-closure.json` | PT-013 | The recorded source-module count and external-import map match `src/` again, and PT-013 passes. |
| `PT-029-f` | [`US-26`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | repository tree | freeze guard | The guard fails when a new applier-shaped source, schema, or command is added under the root heritage, proving it is a detector rather than a snapshot. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | Deleting root sources must not break the recovered heritage that `US-13`..`US-17` still require to build and run. | `PT-029-g` |
| `Input/Routing` | `covered` | Retired root routes must not stay reachable through an alias or completion definition. | `PT-029-b` |
| `Lifecycle/Model` | `covered` | The freeze is the model: terminal for new work, still present until the real prune pass. | `PT-029-f` |
| `Durability/Recovery` | `covered` | Deleting a duplicate must not delete coverage. | `PT-029-h` |
| `Output/Filesystem` | `covered` | The dependency-closure evidence must match the tree after removal. | `PT-029-e` |
| `Cross-Feature` | `covered` | The whole suite, both packages, must be green afterwards. | `PT-029-g` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-029-g` | [`US-13`](../../goal/spec.md#integrated-selective-cli-recovery-requirements) | The heritage is frozen, not broken; recovery requirements still demand it compiles and runs. | `Regression` | After removal, `tsc --noEmit` and the build are clean, the root suite is fully green, and the `cli/` suite is fully green. | t-029 |
| `PT-029-h` | [`US-24`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | A duplicate may have drifted into holding a unique assertion. | `Durability/Recovery` | For every assertion in a deleted root applier test, an equivalent assertion exists in `cli/test/`; the mapping is recorded in the ticket before deletion. | t-029 |
