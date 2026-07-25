# Test plan

## Verification

These four source checks are accepted as the component scenarios of goal check [`T-019`](../../../goal/test-list.md#verification).

| Check ID | Request Refs | Procedure | Expected Evidence |
| --- | --- | --- | --- |
| T-001 | R-001 | Seed representative generated output, dependency, cache, and temporary-fixture artifacts; complete a loop; run the cleanup gate twice; inspect retained authority, evidence, history, source, and executable tests. | Both cleanup runs succeed; every seeded transient artifact is absent; retained artifacts are byte-identical; no generated or temporary output remains. |
| T-002 | R-002 | Complete a loop, independently calculate the final ordered goal-bundle hash and identify its frozen Git revision, then compare both values with `.arca/current/current.md` and inspect all goal authority paths. | Current state records the exact frozen revision and content hash; `.arca/goal/` remains the cumulative authority at stable paths; the next loop can resolve every goal reference. |
| T-003 | R-003 | Prepare terminal and nonterminal issue, residual, and ticket fixtures, including archived identifier collisions; complete the loop lifecycle; enumerate live and archived records, run live scans and allocation, and validate every retained local Markdown reference. | Only terminal records belonging to the completed loop appear beneath their owning collection's `archive/`; nonterminal and active records remain live; live scans exclude archive descendants; archived IDs remain allocated; every retained link resolves. |
| T-004 | R-001, R-002, R-003 | Run the complete end-of-loop lifecycle twice against unchanged completed-loop state and compare the resulting tree, current record, and append-only log. | The second run performs no additional move or cleanup, current identifies the same frozen goal revision, the tree is unchanged, and history gains no duplicate lifecycle transition. |
