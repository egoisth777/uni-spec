# `uni-spec` persistent standard

## Summary

`uni-spec` is a lightweight, persistent documentation standard and guardrail for one issue folder. Each folder contains exactly five distinct regular files: `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`. The standard declaratively describes conversion of issue-like source material and inspection of malformed or parsing-broken folders; it is not software. The integrated sanitation requirements `US-08` through `US-12` additionally require an evidence-led purge of inherited OpenSpec residue while retaining the standard and its governance records.

## Integrated issue

The accepted requirements from [purge and sanitization](../issue/i-001-purge-sanitization/index.md) are `US-08` through `US-12`; their reverse mapping is recorded in `.arca/issue/i-001-purge-sanitization/spec.md`.

The accepted requirements from [selective CLI recovery](../issue/i-002-selective-cli-recovery/index.md) are `US-13` through `US-17`; their reverse mapping is recorded in `.arca/issue/i-002-selective-cli-recovery/spec.md`.

The recovery requirements govern repository restoration only. They do not expand the five-file standard into a CLI product: the standard and its existing `US-01` through `US-12` contracts remain authoritative, while the recovery slice separately requires a runnable historical CLI closure and its evidence.

## Routes

| Need | File |
| :--- | :--- |
| Domain terms | [Ubiquitous language](ubi-lang.md) |
| Stable source requests | [Specification](spec.md) |
| Structure, conversion, and lint contract | [Design](design.md) |
| Inspection checks and state traces | [Test list](test-list.md) |
