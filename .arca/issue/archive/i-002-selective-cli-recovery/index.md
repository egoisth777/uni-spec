---
issue-id: "i-002-selective-cli-recovery"
origin: "User quote (verbatim): Yes, start to recover. To make our edit consistent, we still have to walk through the plan + build loop in order not to break history since this is not trivial change. Accepted boundary: preserve the intended website/ and openspec/ purges; selectively recover the CLI from f179bc6^, including required source, package/dependency/configuration/tests; do not restore unrelated upstream artifacts automatically."
status: "integrated"
---

# Selective CLI recovery

## Summary

Recover the runnable CLI selectively from the exact pre-adjacent-residue baseline `f179bc6^` (`84741704290c547d64605699d697612ac03731bf`) through the plan-and-build loop. Restore only the source, package/dependency/build support, directly necessary tests/docs/schemas, and their proven dependency closure; preserve the completed `website/` and `openspec/` purges, current governance, the normative standard, and append-only state history. The recovery must publish a reproducible restored-vs-excluded inventory and verification record before implementation begins.

## Integrated goal requirements

| Issue requirement | Goal requirement | Decision |
| :--- | :--- | :--- |
| `R-001` | `US-13` | accepted |
| `R-002` | `US-14` | accepted |
| `R-003` | `US-15` | accepted |
| `R-004` | `US-16` | accepted |
| `R-005` | `US-17` | accepted |

The bidirectional authority map is `.arca/issue/i-002-selective-cli-recovery/spec.md` ↔ `.arca/goal/spec.md` integrated issue requirements.

## Routes

| Need | File |
| :--- | :--- |
| Terms | [Ubiquitous language](./ubi-lang.md) |
| Requirements | [Specification](./spec.md) |
| Proposed mechanics | [Design](./design.md) |
| Verification and integration traces | [Test plan](./test-plan.md) |
