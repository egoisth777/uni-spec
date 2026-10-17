---
issue-id: "i-006-uni-spec-issue-generation"
origin: "User request (verbatim): I want the DESIGNER to create an issue to transform the CLI to produce uni-spec style 5 artifacts based on unispec format instead of the current openspec format."
status: "integrated"
---

# Uni-spec issue generation

## Summary

The recovered CLI still produces the inherited OpenSpec change format: `openspec init` writes `openspec/config.yaml`, `openspec new change <name>` writes `openspec/changes/<name>/.openspec.yaml` plus `README.md`, and `openspec status` reports the four `spec-driven` artifacts `proposal`, `design`, `specs`, `tasks`. The uni-spec five-aspect issue package defined in `standard/` is produced only by hand, by copying the issue templates in `standard/templates/issue/` and applying the written procedure.

This issue asks for the CLI to generate and validate the uni-spec five-aspect issue package instead of the OpenSpec change format, so the shipped standard has an executable applier.

## Scope boundary

This is a **separate implementation scope**, not a change to the standard. The overview section of the goal document `.arca/goal/design.md` already states that "a person, agent, or **external tool** may apply the procedure", and its declarative lint contract section scopes `LINT-07` to the goal documents, where it "ignores the explicitly scoped recovery requirements and inherited workspace implementation". A generator therefore does not widen `US-07`; only writing a command, runtime, or implementation plan **into the `US-01`–`US-12` standard deliverable** would, which the docs-only boundary section of that same goal document forbids. See [`R-008`](./spec.md) for the requirement that keeps this separation explicit.

## Decision state

Integrated at P1. `R-001` through `R-006`, `R-008`, and `R-009` are `accepted` and their forward authority is goal `US-21` through `US-26`; `R-007` (executable `C0`-`C6` conversion) is `deferred` and carries no forward authority until a later planning pass folds it in. Per-record refs are in [spec.md](./spec.md).

## Routes

| Need | File |
| --- | --- |
| Terms | [ubi-lang.md](./ubi-lang.md) |
| Source requests | [spec.md](./spec.md) |
| Proposed design | [design.md](./design.md) |
| Verification | [test-plan.md](./test-plan.md) |
