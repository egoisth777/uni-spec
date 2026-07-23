# Issue design

## Proposed mechanics

The proposal is integrated into the goal as `US-08` through `US-12`; no deletion or sanitization is performed during planning.

### Goal mapping

| Issue requirement | Goal requirement | Planned slice |
| :--- | :--- | :--- |
| `R-001` | `US-08` | Audit and remove `website/` when residue is proven. |
| `R-002` | `US-09` | Audit and remove `openspec/` when no retained dependency exists. |
| `R-003` | `US-10` | Inventory, classify, and remove adjacent inherited residue. |
| `R-004` | `US-11` | Enforce the minimal-retention allowlist and preserve direct dependencies. |
| `R-005` | `US-12` | Prove absence, link integrity, and retained-artifact checks after the purge. |

1. **Inventory before mutation.** Enumerate top-level entries and recursively inspect `website/` and `openspec/`. Search retained files and configuration for `OpenSpec`, `openspec`, `Fission-AI`, upstream URLs, package names, executable names, and references to the candidate paths. Record path, observed evidence, and proposed classification.
2. **Use an allowlist, not visual similarity.** Start the minimal-retention set with `.arca/` (including its current workflow records), `standard/`, and `AGENTS.md`. Add a file or directory only when a direct link, test, rule, or documented uni-spec responsibility proves it is needed. Treat `website/` and `openspec/` as explicit candidates, not as required working state.
3. **Audit adjacent residue.** For each observed candidate in `package.json`, `README.md`, `README_OLD.md`, `assets/`, `bin/`, `build.js`, `scripts/`, `schemas/`, `src/`, `test/`, `docs/`, `.github/`, `.devcontainer/`, `.changeset/`, `flake.*`, and OpenSpec-specific agent skills, decide whether it is upstream-only, shared support, or required. Preserve shared support only with a written dependency and scope it to uni-spec.
4. **Purge and sanitize in dependency order.** Remove confirmed candidate trees, then remove or rewrite retained references, package identity, scripts, release/configuration hooks, badges, assets, and links that point to the upstream fork. Do not alter `.arca/current/` while creating or recording this issue; any later implementation must follow the normal approved-ticket workflow.
5. **Check the boundary before deletion.** For every proposed deletion, inspect imports, test references, package scripts, CI usage, documentation links, and `.arca/` or `standard/` links. If evidence is ambiguous, retain the path and record the unresolved question instead of guessing.
6. **Verify both sides of sanitization.** Search for forbidden upstream identity and deleted-path references, check the final retained tree against the allowlist, resolve Markdown links, and run the applicable existing checks for `standard/` and `.arca/` artifacts. Record failures as blockers to integration rather than weakening the checks.

The approved planning design maps `R-001` through `R-005` to goal requirements `US-08` through `US-12`; deletion and sanitization remain deferred to the ordered approved tickets.