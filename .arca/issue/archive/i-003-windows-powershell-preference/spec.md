# Issue specification

## Source requests

The single incoming ask is `accepted`; none is `rejected`, `duplicate`, or `deferred`. No decision remains `undecided`.

| Request ID | Source ask | Disposition | Rationale | Accepted Forward Authority Refs |
| :--- | :--- | :--- | :--- | :--- |
| `R-001` | On Windows, prefer PowerShell (`pwsh`) for shell operations instead of using the Bash tool. | accepted | The reported failures across both named model/tool paths support a platform-level Windows shell preference rather than model-specific behavior; `pwsh` is the requested Windows shell. | Goal [`US-18`](../../../goal/spec.md#integrated-windows-shell-guidance-requirement); [Windows shell guidance mapping](../../../goal/design.md#integrated-windows-shell-guidance-mapping) |
