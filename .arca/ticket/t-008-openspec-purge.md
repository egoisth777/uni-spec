---
ticket-id: "t-008-openspec-purge"
residual-ids:
  - "residual-us-09"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-09)"
  - ".arca/goal/test-list.md#verification (T-009)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-008"
dependencies:
  - "t-007-website-purge"
status: "done"
---

# Ticket: t-008-openspec-purge

## Vertical slice

Enumerate `openspec/` and each named child, search retained trees for dependencies, remove only confirmed upstream workflow residue, and record a post-change tree and link check. Preserve `.arca/` and `standard/` authority.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-008` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-09`) | `openspec/` plus `.arca/`, `standard/` | `repository-audit PT-008` | Each named child has evidence and the approved residue disposition; no unapproved OpenSpec tree remains. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Detects any named child left after purge. | `PT-008-H1` |
| `Input/Routing` | covered | Searches retained-tree dependencies before deletion. | `PT-008-H2` |
| `Lifecycle/Model` | covered | Enforces audit then mutation order. | `PT-008-H3` |
| `Durability/Recovery` | covered | Ambiguous dependencies remain retained with a question. | `PT-008-H4` |
| `Output/Filesystem` | covered | Final tree and links are inspected. | `PT-008-H5` |
| `Cross-Feature` | covered | Confirms standard and governance survive. | `PT-008-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-008-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Leave `openspec/config.yaml`. | `Regression` | Audit fails. | `purge-maintainer` |
| `PT-008-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Add a dependency from standard. | `Input/Routing` | Retention decision is required. | `purge-maintainer` |
| `PT-008-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Mutate before complete inventory. | `Lifecycle/Model` | Ticket fails. | `purge-maintainer` |
| `PT-008-H4` | `.arca/goal/design.md#integrated-sanitation-mapping` | Simulate unreadable candidate. | `Durability/Recovery` | Evidence gap blocks deletion. | `purge-maintainer` |
| `PT-008-H5` | `.arca/goal/test-list.md#verification` | Compare all named child paths. | `Output/Filesystem` | No unapproved candidate remains. | `purge-maintainer` |
| `PT-008-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Run retained-artifact inspection. | `Cross-Feature` | Authority remains valid. | `purge-maintainer` |

## PT-008 Execution Record

The planned check maps to `test/openspec-purge.test.ts`:
`repository-audit PT-008 > removes every named OpenSpec workflow candidate while preserving authority routes` runs the `existingCandidates()` absence oracle and positive `.arca/`, `standard/`, and `AGENTS.md` route checks. The companion `leaves no retained standard dependency pointing at a named candidate` check runs `standardReferencesToCandidates()` against every retained Markdown artifact. The pre-mutation run was intentionally red: 1 of 2 tests failed because the observed `openspec` tree and all six named children existed; the dependency check passed.

### Inventory and disposition

The pre-mutation inventory was captured before deletion with `git ls-files`: 560 tracked files under `openspec/`, 0 untracked files, and no root-level `work/`, `specs/`, `explorations/`, `initiatives/`, `changes/`, or `config.yaml`. The seven observed top-level OpenSpec candidates and their recursive tracked-file counts were:

| Candidate | Evidence | Disposition |
| --- | --- | --- |
| `openspec/` | Root upstream workflow tree containing all six named children and `config.yaml`; 560 tracked files total. | Purge confirmed residue. |
| `openspec/work/` | 38 tracked planning/capstone files, including workflow-only `AGENTS.md` and `README.md`. | Purge confirmed residue. |
| `openspec/specs/` | 36 tracked upstream product specification files. | Purge confirmed residue. |
| `openspec/explorations/` | 5 tracked upstream exploration documents. | Purge confirmed residue. |
| `openspec/initiatives/` | 64 tracked initiative/work-item files. | Purge confirmed residue. |
| `openspec/changes/` | 416 tracked active/archive change artifacts, including `.openspec.yaml` metadata. | Purge confirmed residue. |
| `openspec/config.yaml` | Root OpenSpec schema configuration (`schema: spec-driven`). | Purge confirmed residue. |

The named root-level candidates `work/`, `specs/`, `explorations/`, `initiatives/`, `changes/`, and `config.yaml` were explicitly checked and absent before mutation; they remain absent and required no disposition. Every observed candidate therefore has exactly one purge decision; no ambiguous dependency was found.

### Dependency search and hole-poking

Before deletion, retained `.arca/`, `standard/`, and root `AGENTS.md` were searched for candidate path references and Markdown links. No retained Markdown link pointed into `openspec/` or any named child, and `standard/` had no candidate dependency. Runtime OpenSpec path references in `src/` and temporary-root fixtures in `test/` are product behavior and test-created data, not dependencies on this checkout's deleted tree, so they were preserved. The one direct checkout-root dependency, `test/specs/source-specs-normalization.test.ts`, scanned `openspec/specs` and failed after the purge; it was removed as obsolete upstream-tree coverage. Hole-poking covered nested child entries, root-vs-child absence, retained authority reachability, retained-standard candidate references, package/source references, and the direct source-spec test.

After deletion, `corepack pnpm exec vitest run test/openspec-purge.test.ts` passed 2/2 tests. The full `corepack pnpm test` run initially exposed the direct source-spec test failure (1 failed, 101 passed, 22 skipped); after removing that direct stale reference, the rerun passed 101 files, 1855 tests, and 22 skipped. The post-change candidate oracle is empty, `.arca/`, `standard/`, and `AGENTS.md` remain reachable, and the retained-standard dependency oracle is empty.

### Post-change tree and link check

`openspec/` and every named child are absent; root-level named candidates remain absent. `.arca/` and `standard/` remain present, and the new PT-008 test confirms no named-candidate dependency in retained standard Markdown. No package, runtime, CLI, or dependency implementation was changed.
