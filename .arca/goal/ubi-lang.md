# Ubiquitous language

## Terms

| Term | Meaning |
| :--- | :--- |
| issue folder | One directory for one issue-like source, containing exactly the five standard regular files and no other entry. |
| issue collection | The direct-child directories of a target issue folder's parent whose names begin with candidate pattern `i-<digits>-`; their parsed positive numeric components reserve issue numbers even when the remainder is malformed. |
| aspect | The distinct purpose of one standard file: identity and routes, terms, source requests, proposed design, or verification plan. |
| source reference | One or many actual identifiers or locations supplied with source material, preserved in source encounter order; each missing identifier is represented by the literal `inline input (no source identifier)`. |
| source encounter order | Source inputs in supplied input order, then documents within each source in document order. |
| declarative conversion | A written, deterministic procedure that a person, agent, or external tool applies to source material; it is not executable product behavior. |
| declarative lint | A complete set of inspection rules and finding fields for evaluating an issue folder without stopping at the first finding. |
| request ID | A stable identifier assigned to one source ask in `spec.md`, with a disposition and rationale. |
| disposition | One of `accepted`, `rejected`, `duplicate`, `deferred`, or `undecided`, recording how a source ask is treated. |
| absence declaration | One exact sentence permitted when an aspect has no issue-specific content, instead of a blank or template token. |
| source-grounded | Directly supported by the supplied material or explicitly preserved as unresolved; never invented. |
| docs-only | The scope boundary: documents specify structure, conversion, and inspection, but require no software, commands, APIs, runtime, package, dependency, or orchestration implementation. |
| inherited residue | A repository path or identity carried from the upstream OpenSpec fork that has no direct uni-spec need. |
| purge candidate | A path explicitly inspected and classified before deletion; visual similarity alone never proves it removable. |
| minimal-retention set | `.arca/`, `standard/`, `AGENTS.md`, and only supporting paths with direct evidence of uni-spec need. |
| retained artifact | A path preserved because a concrete standard, governance rule, link, or check depends on it. |
| absence proof | A post-purge inspection record showing forbidden identity and deleted-path references are absent. |

| selective CLI recovery | A dependency-ordered restoration from the frozen historical baseline that includes only the runnable CLI and directly evidenced support; it is not a history revert or reset. |
| recovery baseline | The exact source revision selected for read-only inspection and path-scoped extraction. |
| dependency closure | Every file, package, configuration, fixture, or document directly reached by a recovered import, script, test, or public command contract. |
| restored-vs-excluded inventory | A path-level record of each selected restore and each inspected candidate intentionally excluded with evidence. |
| recovery proof | Reproducible source revisions, commands, hashes, inventories, and observable build/runtime/test outcomes. |
| completed loop | A planning-and-building loop whose final green gap recheck has no `missing` or `partial` requirement and therefore satisfies the Idle gate. |
| transient artifact | Reproducible generated output, installed dependency, cache, temporary fixture, or equivalent working product that is not retained authority, source, executable tests, evidence, or append-only history. |
| current goal revision | The exact goal Git HEAD and ordered filename-NUL-content goal-bundle SHA-256 frozen for the completed loop and promoted into `.arca/current/current.md`; `.arca/goal/` remains the cumulative current authority. |
| owning archive | The reserved `archive/` directory directly inside `.arca/issue/`, `.arca/residual/`, or `.arca/ticket/` for terminal records owned by that collection. |
| terminal record | A record belonging to the completed loop whose collection lifecycle is complete: an `integrated` or `rejected` issue, `satisfied` residual, or `done` ticket; all other records are nonterminal. |
| archive-aware scan | A collection scan that excludes the reserved `archive/` directory and descendants from live shape/gap/work results but includes archived descendants when reserving record identifiers. |
| terminal archive sweep | One relocation pass that moves every terminal record in every collection beneath its owning archive, selected by terminal status alone rather than by the loop that created it. |
| legacy terminal record | A terminal record created by an earlier completed loop and still live because loop-scoped relocation never selected it. |
| live collection remainder | What `.arca/issue/`, `.arca/residual/`, and `.arca/ticket/` directly hold after a sweep: nonterminal records and the reserved `archive/` only. |
| location-independent preservation | A retention, preservation, or census check that resolves a record at its live or archived location and counts both, so archival never reads as deletion. |

| applier | A person, agent, or external tool that carries out the standard's written procedure. The `uni-spec` tool is one applier; an applier never becomes part of the standard. |
| applier surface | The operations the `uni-spec` binary exposes. It holds only what the standard defines — issue scaffold and lint — and excludes the inherited OpenSpec command set. |
| identity allocation | Choosing an unused issue-folder name for a new folder by the [naming](./design.md#naming) algorithm, then freezing the number and slug in both the directory name and the `index.md` `issue-id` at creation. |
| sidecar metadata | Operational state an applier keeps about an issue folder, such as the inherited `.openspec.yaml`. Inside the folder it is a forbidden sixth entry, so it lives beside the collection or is derived from `index.md` frontmatter instead. |
| template authority | The single location a generated aspect file originates from: the shipped `standard/templates/issue/`. Any second editable copy can drift from the standard it claims to apply. |
