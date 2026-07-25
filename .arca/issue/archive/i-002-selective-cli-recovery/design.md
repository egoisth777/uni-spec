# Issue design

## Proposed mechanics

This issue is planned from the read-only recovery baseline `f179bc6^` = `84741704290c547d64605699d697612ac03731bf`. Recovery uses selective `git show`/`git restore` or equivalent path-scoped extraction only; it never reverts, resets, or restores an entire historical tree. The existing `website/` and `openspec/` purges remain hard exclusions.

## Goal mapping

| Issue requirement | Goal requirement | Planned slice |
| :--- | :--- | :--- |
| `R-001` | `US-13` | Restore and smoke the CLI entrypoint plus the source import closure from `bin/openspec.js` into `dist/cli/index.js` and `src/**`; narrow the command surface only by evidence. |
| `R-002` | `US-14` | Restore and clean `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `build.js`, and package scripts required by the selected closure. |
| `R-003` | `US-15` | Restore directly necessary `test/**`, `docs/**`, and `schemas/**` paths only after import/script/test/document reachability is recorded; retain an explicit closure manifest. |
| `R-004` | `US-16` | Prove `website/` and `openspec/` remain absent and `.arca/`, `standard/`, `AGENTS.md`, current records, and prior history remain intact and append-only. |
| `R-005` | `US-17` | Publish the ordered baseline/path/hash inventory, deterministic commands, and green build/CLI/test proof, with exclusions and unresolved candidates named. |

## Candidate path groups

| Group | Baseline candidates | Selection rule |
| :--- | :--- | :--- |
| Runtime | `bin/openspec.js`; `src/**` reachable from `src/cli/index.ts` and its command/core imports | Restore only files required by the supported CLI behavior and compile graph; do not infer closure from directory membership alone. |
| Package/build | `package.json`; `pnpm-lock.yaml`; `tsconfig.json`; `vitest.config.ts`; `vitest.setup.ts`; `build.js`; package-script targets under `scripts/` | Keep only metadata, lock, compiler/test/build configuration and scripts reached by selected commands; rewrite identity and remove upstream release/site hooks. |
| Tests/support | Reachable `test/**`, helpers, fixtures, and test-only setup | Every restored test/support path must map to a recovered behavior and a dependency-closure record. |
| Docs/schemas | Reachable `docs/**` command/user-contract pages and `schemas/**` templates/schema files | Restore only pages/schemas referenced by recovered commands or required to explain their public contract; exclude site publication material. |
| Exclusions | `website/`, `openspec/`, unrelated `.agents/`, release/CI/devcontainer/change-set assets, unreferenced docs/tests/schemas, and other upstream-only paths | Record every inspected candidate and evidence; retain ambiguity as explicit exclusion/question pending proof. |

## Dependency and safety gates

1. Before mutation, enumerate baseline paths and inspect imports, package scripts, lockfile packages, test references, docs links, and schema lookups.
2. Build the selected closure in dependency order: runtime, package/build, directly necessary tests/docs/schemas, then preservation/proof checks. A candidate without a direct edge is excluded and recorded.
3. Rewrite package identity and references to fit `uni-spec`; do not carry OpenSpec branding, website routes, or upstream release automation into the retained tree.
4. Verify `website/` and `openspec/` are still absent, `.arca/current/log.md` only gains lines, and governance/standard artifacts remain reachable before any ticket is marked done.
5. Record exact commands, source hashes, path manifests, and outputs; no implementation is performed during this planning pass.
