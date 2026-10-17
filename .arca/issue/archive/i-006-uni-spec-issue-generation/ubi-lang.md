# Ubi language

## Terms

| Term | Meaning |
| --- | --- |
| Issue package | One directory holding exactly the five uni-spec aspect files and nothing else, as defined by the standard's package boundary. |
| Aspect artifact | One of the five files the CLI must generate: `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, `test-plan.md`. Replaces the OpenSpec artifact set `proposal`, `specs`, `design`, `tasks`. |
| Applier | A person, agent, or external tool that carries out the standard's written procedure. The CLI becomes an applier; it never becomes part of the standard. |
| Identity allocation | Choosing a directory name matching `i-[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+){1,3}` for a new package: smallest unused positive integer among sibling `i-<digits>-` candidates, rendered with at least three digits, plus a title-derived slug frozen at creation. |
| Sidecar metadata | Operational state the CLI keeps about a package, such as the current OpenSpec `.openspec.yaml`. A sidecar inside the package folder is a sixth entry and is forbidden by the package boundary. |
| Template authority | The single location a generated aspect file is copied from. The shipped `standard/templates/issue/` is that location; any second copy inside the CLI can drift from the standard. |
