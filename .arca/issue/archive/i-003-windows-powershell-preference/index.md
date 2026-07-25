---
issue-id: "i-003-windows-powershell-preference"
origin: "inline input (no source identifier)"
status: "integrated"
---

# Windows PowerShell preference

## Summary

The dashboard shows a high Bash-tool error rate for both `gpt-sol` and `gpt-luna` on Windows, wasting context and tokens. Shell guidance should prefer PowerShell (`pwsh`) rather than Bash on the Windows platform.

## Integrated goal requirement

| Issue requirement | Goal requirement | Decision |
| :--- | :--- | :--- |
| `R-001` | [`US-18`](../../../goal/spec.md#integrated-windows-shell-guidance-requirement) | accepted |

The bidirectional authority map is this issue's [specification](./spec.md) ↔ the goal [specification](../../../goal/spec.md#integrated-windows-shell-guidance-requirement); the implementation approach is linked from the issue [design](./design.md) to the goal [design](../../../goal/design.md#integrated-windows-shell-guidance-mapping).

## Routes

| Need | File |
| --- | --- |
| Terms | [Ubiquitous language](./ubi-lang.md) |
| Requirements | [Specification](./spec.md) |
| Proposed mechanics | [Design](./design.md) |
| Verification | [Test plan](./test-plan.md) |
