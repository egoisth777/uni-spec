# `uni-spec` persistent standard

## Summary

`uni-spec` is a lightweight, persistent documentation standard and guardrail for one issue folder. Each folder contains exactly five distinct regular files: `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`. The standard declaratively describes conversion of issue-like source material and inspection of malformed or parsing-broken folders; it is not software. The integrated sanitation requirements `US-08` through `US-12` additionally require an evidence-led purge of inherited OpenSpec residue while retaining the standard and its governance records. The separately scoped `US-18` governs Windows shell guidance for generated commands and tool selection, and `US-19` governs the repository's end-of-loop cleanup, current-goal promotion, and terminal-record archive lifecycle; `US-20` widens that lifecycle to sweep every terminal record in every collection beneath its owning archive. The separately scoped `US-21` through `US-26` govern the `uni-spec` applier, an external tool that carries out the standard's written procedure.

## Integrated issue

The accepted requirements from [purge and sanitization](../issue/archive/i-001-purge-sanitization/index.md) are `US-08` through `US-12`; their reverse mapping is recorded in `.arca/issue/i-001-purge-sanitization/spec.md`.

The accepted requirements from [selective CLI recovery](../issue/archive/i-002-selective-cli-recovery/index.md) are `US-13` through `US-17`; their reverse mapping is recorded in `.arca/issue/i-002-selective-cli-recovery/spec.md`.

The accepted requirement from [Windows PowerShell preference](../issue/archive/i-003-windows-powershell-preference/index.md) is `US-18`; its reverse mapping is recorded in the issue [specification](../issue/archive/i-003-windows-powershell-preference/spec.md).

The accepted requests from [end-of-loop cleanup and archive lifecycle](../issue/archive/i-004-loop-cleanup-archive/index.md) are integrated cohesively as `US-19`; their reverse mapping is recorded in the issue [specification](../issue/archive/i-004-loop-cleanup-archive/spec.md).

The accepted requests from [terminal archive sweep](../issue/archive/i-005-terminal-archive-sweep/index.md) are integrated cohesively as `US-20`; their reverse mapping is recorded in the issue [specification](../issue/archive/i-005-terminal-archive-sweep/spec.md).

The accepted requests from [uni-spec issue generation](../issue/archive/i-006-uni-spec-issue-generation/index.md) are integrated as `US-21` through `US-26`; their reverse mapping is recorded in the issue [specification](../issue/archive/i-006-uni-spec-issue-generation/spec.md). Its `R-007` request for executable `C0`-`C6` conversion is `deferred` and carries no forward authority.

The recovery requirements govern repository restoration only. They do not expand the five-file standard into a CLI product: the standard and its existing `US-01` through `US-12` contracts remain authoritative, while the recovery slice separately requires a runnable historical CLI closure and its evidence. `US-18` is separately scoped platform guidance for command generation and shell-tool selection, not a model-specific or product-runtime requirement. `US-19` is separately scoped repository lifecycle governance and preserves `.arca/goal/` as this cumulative current authority and stable front door. `US-20` is the same governance slice: it changes which finished records are relocated, never the standard, the goal authority paths, or any live nonterminal work. `US-21` through `US-26` are the separately scoped applier: the tool depends on the standard, the standard neither depends on nor requires the tool, and nothing under `standard/` or in `US-01` through `US-12` becomes an implementation requirement because an applier exists.

## Routes

| Need | File |
| :--- | :--- |
| Domain terms | [Ubiquitous language](./ubi-lang.md) |
| Stable source requests | [Specification](./spec.md) |
| Structure, conversion, and lint contract | [Design](./design.md) |
| Inspection checks and state traces | [Test list](./test-list.md) |
