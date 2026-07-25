# Ubiquitous language

## Terms

| Term | Meaning |
| :--- | :--- |
| selective CLI recovery | A dependency-ordered restoration from `f179bc6^` that includes only the runnable CLI and directly evidenced support, never an automatic historical revert. |
| recovery baseline | The immutable source tree at `f179bc6^`, resolved as `84741704290c547d64605699d697612ac03731bf` for this planning pass. |
| dependency closure | The complete set of files, packages, configuration, fixtures, and documentation required by a recovered behavior, proven by imports, scripts, tests, or user-facing command contracts. |
| restored-vs-excluded inventory | A path-level record naming every selected group restored and every inspected candidate deliberately excluded with evidence and rationale. |
| recovery proof | Reproducible commands, source revisions, hashes, and observable CLI/build/test outcomes that establish the selected closure without changing history. |
