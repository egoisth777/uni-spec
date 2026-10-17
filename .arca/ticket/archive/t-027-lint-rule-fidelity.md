---
ticket-id: "t-027-lint-rule-fidelity"
residual-ids:
  - "residual-us-24"
behavior-refs:
  - "../goal/spec.md#integrated-uni-spec-applier-requirements"
design-refs:
  - "../goal/design.md#declarative-lint-contract"
planned-test-refs:
  - "PT-027"
dependencies: []
status: "done"
---

# Ticket: t-027-lint-rule-fidelity

Close [`residual-us-24`](../../residual/archive/residual-us-24.md). The global lint contract already holds — all seven rules always evaluate, findings carry the six fields, PASS is zero-findings-only, exit codes are correct. Four rules are unfaithful to the contract they transcribe, and the recorded traces do not pin two of the six finding fields.

Scope: `cli/src/core/issue/lint.ts` and its tests. Fix five defects:

1. **LINT-03** (`lint.ts:493-555`) accepts an unterminated quoted scalar. Strict YAML must reject it as a metadata finding.
2. **LINT-04** (`lint.ts:1013-1029`) reports only when *no* request ref resolves. Every referenced ID must resolve.
3. **LINT-06** (`lint.ts:1155-1164`) resolves against the static five-name list. It must resolve against the observed regular files, so a link to a symlinked `spec.md` fails.
4. **LINT-07** (`lint.ts:1238-1388`) is a lexical heuristic blind to scope. It must attribute a requirement to its `US-nn` ID and report only `US-01`..`US-12`, ignoring `US-13`..`US-26`. An absent or unreadable goal root must be an explicit observation, not silence.
5. **Trace oracle** (`t-023:131-137`) only checks `expected`/`remediation` are non-empty. Pin all six fields against `standard/examples/lint-findings/*.json`, and reconcile the known divergence at `lint.ts:1405` vs `l5.json:7`.

Defect 5 may require correcting either the implementation or a recorded trace. The recorded trace under `standard/` is the standard's own published expectation: prefer changing the implementation. If a trace itself is wrong, the change must remain a non-normative correction, since [`t-028`](./t-028-standard-boundary-guard.md) will pin `standard/` afterwards.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-027-a` | [`US-24`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | in-memory package, `origin: "unterminated` | `lintIssue` | LINT-03 records a metadata finding; the result is FAIL, not PASS. |
| `PT-027-b` | [`LINT-04`](../../goal/design.md#declarative-lint-contract) | `test-plan.md` row referencing `R-001, R-999` where only `R-001` exists | `lintIssue` | LINT-04 records a finding naming `R-999`; a row whose refs all resolve records none. |
| `PT-027-c` | [`LINT-06`](../../goal/design.md#declarative-lint-contract) | observation where `spec.md` is a symlink and `index.md` links to it | `lintIssue` | LINT-01 records the symlink **and** LINT-06 records the unresolvable destination. |
| `PT-027-d` | [`LINT-07`](../../goal/design.md#declarative-lint-contract) | synthetic goal roots | `lintIssue` with a goal root | `US-01: Implement a linter.` records a LINT-07 finding; `US-21 requires a linter.` records none; the real `.arca/goal/` records none; the `l5-scope` goal-root records exactly one. |
| `PT-027-e` | [`T-024`](../../goal/test-list.md#verification) | `standard/examples/lint-findings/l1.json`, `l2.json`, `l3.json`, `l5.json` | `lintIssue` on each fixture | Emitted findings equal the recorded findings on **all six** fields, compared as ordered sets. |
| `PT-027-f` | [`US-24`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | absent and unreadable goal root | `lintIssue` | Each produces an explicit observation or error naming the goal root; neither silently yields zero LINT-07 findings. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | `covered` | The seven-rule ordering, six-field shape, and PASS-at-zero rule must survive the rule rewrites. | `PT-027-g` |
| `Input/Routing` | `covered` | Strict YAML has more failure shapes than the one named defect. | `PT-027-h` |
| `Lifecycle/Model` | `covered` | LINT-07 scope attribution is the model being corrected. | `PT-027-d` |
| `Durability/Recovery` | `covered` | A parser failure must still let independent rules run. | `PT-027-g` |
| `Output/Filesystem` | `covered` | LINT-06 must judge observed entry kinds, not expected names. | `PT-027-c` |
| `Cross-Feature` | `covered` | Exit codes must still follow PASS/FAIL after the rules get stricter. | `PT-027-i` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-027-g` | [`LINT-03`](../../goal/design.md#declarative-lint-contract) | A parser failure is a finding, not a reason to skip independent rules. | `Regression` | On a package with unparseable frontmatter, `evaluatedRules` is still `LINT-01`..`LINT-07` in order and rules other than LINT-03 still produce their own findings. | t-027 |
| `PT-027-h` | [`LINT-03`](../../goal/design.md#declarative-lint-contract) | Strictness must be general, not a patch for one observed input. | `Input/Routing` | Duplicate keys, a non-scalar value, a missing closing `---`, tabs used for indentation, and an unterminated scalar each record a LINT-03 finding. | t-027 |
| `PT-027-i` | [`US-24`](../../goal/spec.md#integrated-uni-spec-applier-requirements) | Stricter rules must not decouple findings from the exit code. | `Cross-Feature` | A package that only fails a newly strict rule still exits non-zero; a package passing every strict rule exits zero. | t-027 |
