# Issue test plan

## Verification

| Check | Requirement Refs | Expected evidence |
| :--- | :--- | :--- |
| `T-001` | `R-001` | Read-only baseline inspection identifies the CLI entrypoint and import closure; after the approved slice, a clean install/build and representative non-destructive CLI invocations produce the documented observable output without restoring `website/` or `openspec/`. |
| `T-002` | `R-002` | Package identity, lockfile, compiler/test/build configuration, and selected scripts are internally consistent; clean install, TypeScript build, and configured test runner complete with no upstream package/release/site dependency. |
| `T-003` | `R-003` | A path-level dependency-closure manifest links every restored test, fixture, doc, and schema to a runtime import, package script, test, or public command contract; every inspected candidate outside the closure has an explicit exclusion rationale. |
| `T-004` | `R-004` | Post-recovery tree proves `website/` and `openspec/` remain absent, governance/standard and prior records remain present, and the current log is append-only with no revert/reset or history rewrite. |
| `T-005` | `R-005` | A fresh checkout can reproduce the baseline/path selection, deterministic hashes, ordered selective extraction, clean build, representative CLI smoke checks, and tests; restored-vs-excluded counts and unresolved questions match the committed proof. |

## Goal/Test File Traces

| Goal/Test File | Status | Reverse Issue Refs |
| :--- | :--- | :--- |
| `.arca/goal/index.md` | integrated | `R-001` ↔ `US-13`; `R-004` ↔ `US-16`; `R-005` ↔ `US-17` |
| `.arca/goal/ubi-lang.md` | integrated | `R-001` ↔ `US-13`; `R-003` ↔ `US-15`; `R-005` ↔ `US-17` |
| `.arca/goal/spec.md` | integrated | `R-001` ↔ `US-13`; `R-002` ↔ `US-14`; `R-003` ↔ `US-15`; `R-004` ↔ `US-16`; `R-005` ↔ `US-17` |
| `.arca/goal/design.md` | integrated | `R-001` ↔ `US-13`; `R-002` ↔ `US-14`; `R-003` ↔ `US-15`; `R-004` ↔ `US-16`; `R-005` ↔ `US-17` |
| `.arca/goal/test-list.md` | integrated | `R-001` ↔ `US-13`; `R-002` ↔ `US-14`; `R-003` ↔ `US-15`; `R-004` ↔ `US-16`; `R-005` ↔ `US-17` |

## Contributor Authority/Schema Traces

| Authority or Schema Artifact | Status | Integration and Reverse Refs |
| :--- | :--- | :--- |
| `AGENTS.md` | unaffected | `R-004` ↔ `US-16`; existing contributor rules remain authoritative. |
| `.arca/index.md` | unaffected | `R-004` ↔ `US-16`; current phase and append-only log rules remain authoritative. |
| `f179bc6^` (`84741704290c547d64605699d697612ac03731bf`) | inspected | `R-001` ↔ `US-13`; `R-002` ↔ `US-14`; read-only source baseline and path evidence. |
| `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `build.js`, `schemas/**` | inspected | `R-002` ↔ `US-14`; `R-003` ↔ `US-15`; candidate closure only, no recovery in planning. |
