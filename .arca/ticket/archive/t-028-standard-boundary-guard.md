---
ticket-id: "t-028-standard-boundary-guard"
residual-ids:
  - "residual-us-25"
behavior-refs:
  - "../goal/spec.md#integrated-uni-spec-applier-requirements"
design-refs:
  - "../goal/design.md#docs-only-boundary"
planned-test-refs:
  - "PT-028"
dependencies:
  - "t-027-lint-rule-fidelity"
status: "done"
---

# Ticket: t-028-standard-boundary-guard

Close [`residual-us-25`](../../residual/archive/residual-us-25.md). The docs-only boundary holds today, but only by hand: no check fails when a future slice writes a normative implementation requirement into `standard/`, and the zero-findings evidence rests on the scope-blind LINT-07 that [`t-027`](./t-027-lint-rule-fidelity.md) repairs first.

Scope: one executable guard. Two obligations:

1. **`standard/` invariance.** Pin the documentary content of `standard/` so any later change is deliberate and reviewed. Record a per-file digest manifest as frozen evidence under `.arca/io/`, and fail when a file's digest moves without the manifest being updated in the same change. This is a change-detector, not a prose classifier: it makes an unreviewed normative addition impossible to land silently, which is what US-25 actually needs.
2. **Scope re-inspection.** Re-apply the corrected LINT-07 to the five `.arca/goal/` documents and require zero findings for `US-01`..`US-12`, keeping the existing guard that proves the goal really does contain `CLI`, `runtime`, and `dependency`, so a zero result is never vacuous.

Ordered after `t-027` because obligation 2 is only meaningful once LINT-07 attributes requirements to their `US-nn` ID.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-028-a` | [`US-25`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | `.arca/io/standard-boundary-manifest.json` | digest comparison over `standard/` | Every file under `standard/` appears exactly once in the manifest with a matching digest; a file present on disk but absent from the manifest, or vice versa, fails. |
| `PT-028-b` | [`US-25`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | temp copy of `standard/` with one document edited | the same guard | The guard fails and names the changed file, proving it is a real detector rather than a self-satisfying recomputation. |
| `PT-028-c` | [`T-025`](../../goal/test-list.md#verification) | the five real `.arca/goal/` documents | corrected LINT-07 | Zero findings for `US-01`..`US-12`. |
| `PT-028-d` | [`T-025`](../../goal/test-list.md#verification) | the five real `.arca/goal/` documents | word-presence guard | The corpus still contains `CLI`, `runtime`, and `dependency`, so `PT-028-c` is not passing on absence. |
| `PT-028-e` | [`US-25`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | synthetic goal doc adding a converter requirement under `US-05` | corrected LINT-07 | Exactly one finding, goal-relative path, proving the invariance check would catch a real regression into the docs-only range. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | The guard must not fire on the current tree, or it is noise from day one. | `PT-028-a` |
| `Input/Routing` | `covered` | The manifest must cover every file kind under `standard/`, not just Markdown. | `PT-028-f` |
| `Lifecycle/Model` | `covered` | Scope attribution across the full `US-01`..`US-26` range is the model. | `PT-028-c`, `PT-028-e` |
| `Durability/Recovery` | `covered` | A missing or corrupt manifest must fail loudly, not skip. | `PT-028-g` |
| `Output/Filesystem` | `covered` | The guard is read-only over `standard/`. | `PT-028-b` |
| `Cross-Feature` | `not-applicable` | This ticket adds no product surface; the applier's behavior is unchanged by it, and cross-feature interaction is already covered where the applier reads `standard/templates/issue/` under `residual-us-23`. | none |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-028-f` | [`US-25`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | The boundary covers every `standard/` document, and its JSON fixtures and templates carry normative expectations too. | `Input/Routing` | The manifest includes the `.json` traces and the `templates/issue/` files, and adding a new file under `standard/` without manifesting it fails the guard. | t-028 |
| `PT-028-g` | [`US-25`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | A guard that silently passes when its own evidence is missing proves nothing. | `Durability/Recovery` | With the manifest deleted or unparseable, the guard fails with a message naming the manifest; it never reports success. | t-028 |
