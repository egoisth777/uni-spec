# Issue test plan

## Verification

| Check | Requirement Refs | Expected evidence |
| :--- | :--- | :--- |
| `T-001` | `R-001`, `R-002` | Inspect the repository tree and record `website/` and `openspec/` contents, then confirm each is either removed as upstream residue or retained with a specific uni-spec dependency; no candidate is silently skipped. |
| `T-002` | `R-003` | Search the repository and retained configuration for upstream names, URLs, package identity, executable names, release hooks, badges, and references to deleted paths; every finding has a purge or retention classification and rationale. |
| `T-003` | `R-004` | Compare the resulting tree with the minimal-retention set; `.arca/` governance and working records, `standard/`, `AGENTS.md`, and only explicitly evidenced supporting files remain, while no required uni-spec link or fixture is missing. |
| `T-004` | `R-005` | Re-run the forbidden-identity and deleted-path searches after edits; expected evidence is zero unapproved OpenSpec identity, reference, script, or configuration occurrences and no unresolved retained-file link. |
| `T-005` | `R-005` | Resolve Markdown links in retained `standard/` and `.arca/` documents and inspect the five-file issue shape; expected evidence is all required destinations present, no extra issue entries, and no blank template tokens. |
| `T-006` | `R-005` | Run the existing applicable checks for the retained uni-spec standard and working artifacts; expected evidence is a green result with no reliance on deleted OpenSpec website/workflow files. |

## Goal/Test File Traces

| Goal/Test File | Status | Reverse Issue Refs |
| :--- | :--- | :--- |
| `.arca/goal/index.md` | integrated | `R-001` ↔ `US-08`; `R-002` ↔ `US-09`; `R-003` ↔ `US-10`; `R-004` ↔ `US-11`; `R-005` ↔ `US-12` |
| `.arca/goal/ubi-lang.md` | integrated | `R-004` ↔ `US-11` |
| `.arca/goal/spec.md` | integrated | `R-001` ↔ `US-08`; `R-002` ↔ `US-09`; `R-003` ↔ `US-10`; `R-004` ↔ `US-11`; `R-005` ↔ `US-12` |
| `.arca/goal/design.md` | integrated | `R-003` ↔ `US-10`; `R-004` ↔ `US-11`; `R-005` ↔ `US-12` |
| `.arca/goal/test-list.md` | integrated | `R-001` ↔ `US-08`; `R-002` ↔ `US-09`; `R-003` ↔ `US-10`; `R-004` ↔ `US-11`; `R-005` ↔ `US-12` |

## Contributor Authority/Schema Traces

| Authority or Schema Artifact | Status | Integration and Reverse Refs |
| :--- | :--- | :--- |
| `AGENTS.md` | integrated | `R-004` ↔ `US-11`; issue creation follows the repository issue-folder rules. |
| `.arca/index.md` | integrated | `R-004` ↔ `US-11`; `R-005` ↔ `US-12`; issue shape and no-current-state-touch boundary remain authoritative. |
| `package.json` and `.github/workflows/ci.yml` | integrated | `R-003` ↔ `US-10`; `R-005` ↔ `US-12`; inspect as purge candidates and update only during an approved ticket. |
