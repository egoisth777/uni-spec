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
