---
ticket-id: "t-026-five-aspect-schema-status"
residual-ids:
  - "residual-us-21"
behavior-refs:
  - "../goal/spec.md#integrated-uni-spec-applier-requirements"
design-refs:
  - "../goal/design.md#integrated-uni-spec-applier-mapping"
planned-test-refs:
  - "PT-026"
dependencies: []
status: "done"
---

# Ticket: t-026-five-aspect-schema-status

Close the schema half of [`residual-us-21`](../../residual/archive/residual-us-21.md). The scaffold already writes exactly the five aspect files with no sixth entry and already derives lifecycle state from `index.md` frontmatter; what is missing is a five-aspect artifact schema owned by `cli/` and a status report in the five-aspect vocabulary.

Scope: add the schema and the status command under `cli/` only. Do not touch the frozen root heritage — [`t-029`](./t-029-heritage-freeze-prune.md) owns that.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-026-a` | [`US-21`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | temp dir, one fresh scaffold | `uni-spec issue status <dir>` | Reports five aspects; the output names `index`, `ubi-lang`, `spec`, `design`, `test-plan` and never `proposal`, `specs`, or `tasks`. |
| `PT-026-b` | [`T-021`](../../goal/test-list.md#verification) | fresh scaffold vs one whose `spec.md` is complete | status report | `index` is blocked by nothing; `design` and `test-plan` are blocked while `spec` is incomplete and unblocked once it is complete; `ubi-lang` depends on `index` only. |
| `PT-026-c` | [`US-21`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | the schema file under `cli/` | schema load | The schema declares exactly five artifacts whose `generates` values are the five aspect filenames at the package root, with no nested path and no sixth entry; the declared `requires` edges are exactly index←{spec, ubi-lang} and spec←{design, test-plan}. |
| `PT-026-d` | [`T-021`](../../goal/test-list.md#verification) | package with `status: integrated` hand-set | `uni-spec issue status` through the built binary | Reported lifecycle state is `integrated`, read from frontmatter, and no applier-owned file exists inside the package. Exercised through the binary, not the helper, closing the gap residual-us-21 records. |
| `PT-026-e` | [`US-21`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | fresh scaffold | entry enumeration after status runs | Running status writes nothing into the package: the directory still holds exactly the five regular files. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | The existing five-file and frontmatter-state assertions must keep passing once a schema mediates generation. | `PT-026-e` |
| `Input/Routing` | `covered` | Status must resolve a package given a path, a relative path, and a collection member. | `PT-026-a` |
| `Lifecycle/Model` | `covered` | The dependency graph and the blocked/unblocked transitions are the model under test. | `PT-026-b`, `PT-026-c` |
| `Durability/Recovery` | `covered` | A malformed or absent `index.md` must produce an actionable error rather than a crash or an invented state. | `PT-026-f` |
| `Output/Filesystem` | `covered` | Status is read-only; it must add no sidecar. | `PT-026-e` |
| `Cross-Feature` | `covered` | Scaffold then status must agree on the same five aspects and the same identity. | `PT-026-d` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-026-f` | [`US-21`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | State is derived from frontmatter, so unparseable frontmatter has no derived state and must not be guessed. | `Durability/Recovery` | Status on a package whose `index.md` frontmatter is unterminated exits non-zero with a message naming the file and the parse problem; it never reports a default status. | t-026 |
