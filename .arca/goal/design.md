# `uni-spec` design

## Overview

The standard is a written contract for documents and inspections. A person, agent, or external tool may apply the procedure, but the product defined by this goal has no executable converter, linter, runtime, command, API, package, dependency, orchestration, apply/archive operation, or implementation plan.

## Goal design mapping

| Request IDs | Proposal |
| :--- | :--- |
| `US-01` | Use one directory with exactly five distinct regular files, assigning one aspect to each file and no extra structural entry. |
| `US-02` | Apply the canonical title-to-slug algorithm, choose the smallest available number from the target parent's direct-child issue collection, and freeze the resulting directory identity at creation; lint checks only observable name syntax and sibling-number uniqueness. |
| `US-03` | Put identity, actual source reference, and lifecycle status in strict byte-1 YAML frontmatter, followed by a summary and four routes. |
| `US-04` | Give each aspect a fixed heading/table contract or exact absence declaration, remove blank tokens, and keep local routes deterministic. |
| `US-05` | Apply the deterministic source-encounter, title, request-ID, disposition, provenance, gap-handling, and lint-evaluation procedure below to legacy, tracker, inline, or broken source forms. |
| `US-06` | Apply the complete lint matrix, record every finding with the six required fields, continue after parser failure where independent, and pass only with zero findings. |
| `US-07` | Keep all deliverables declarative documents and inspection traces, with no product implementation or workflow behavior. |

## Integrated sanitation mapping

The purge is a repository-governance slice, not a product runtime. Each accepted requirement is implemented only by evidence-led inspection and approved file changes:

| Request IDs | Proposal |
| :--- | :--- |
| `US-08` (`R-001`) | Inventory `website/`, classify its contents, and remove it only when the evidence record proves inherited residue. |
| `US-09` (`R-002`) | Inventory `openspec/` and each named child, prove whether any retained uni-spec dependency reaches it, and remove only confirmed residue. |
| `US-10` (`R-003`) | Produce a complete candidate inventory for upstream identity, assets, tools, configuration, integrations, docs, source, tests, and schemas, with purge/retain decisions before mutation. |
| `US-11` (`R-004`) | Apply the allowlist rooted at `.arca/`, `standard/`, and `AGENTS.md`; preserve supporting files only with direct evidence. |
| `US-12` (`R-005`) | Re-run absence searches, resolve retained Markdown links, inspect retained five-file artifacts, and record green applicable checks. |

No row authorizes a converter, linter, runtime, package, dependency, orchestration, or apply/archive product.

## Five-file shape

An issue folder is one directory containing exactly these five regular files and no symlinks, subdirectories, or extra entries:

1. `index.md` — identity, provenance, status, summary, and routes.
2. `ubi-lang.md` — issue-specific terms, or its exact absence declaration.
3. `spec.md` — stable source-request records, each with disposition and rationale.
4. `design.md` — proposed design mapped to source-request IDs, or its exact absence declaration.
5. `test-plan.md` — checks mapped to accepted or undecided request IDs, expected evidence, or its exact no-verification declaration.

The five aspects are distinct. `index.md` origin is the sole canonical source reference; source-derived facts are routed to the appropriate companion aspect, not duplicated into every aspect. A file may link to another aspect, but it does not duplicate that aspect's records or become an authority trace.

## Naming

The directory name MUST match `i-<nnn>-<slug>`, where `<nnn>` is a positive ASCII decimal number whose numeric value is greater than zero, rendered with at least three digits (so `000` is invalid), and `<slug>` has two to four non-empty lowercase ASCII-alphanumeric components separated by single hyphens. A component MUST match `[a-z0-9]+`. During conversion, inspect supplied titles in source encounter order (source inputs in supplied order, then documents in document order); trim and collapse each title's whitespace and choose the first normalized title that is non-empty. If no supplied title is non-empty, use the first non-empty sentence of the first source ask; if no such sentence exists, use the exact title `Untitled issue`.

Derive the canonical slug by lowercasing the selected normalized title, replacing each maximal run of characters outside ASCII `[a-z0-9]` with `-`, trimming hyphens, splitting on hyphens, and taking the first four tokens. If this yields zero tokens, use `untitled-issue`; if it yields one token, append `issue`. The result is therefore two to four `[a-z0-9]+` components. The target folder's parent defines the issue collection: inspect every direct child directory whose name begins with the candidate pattern `i-([0-9]+)-`; parse its digits as an integer and reserve every positive value, even when the remainder of that directory name is malformed (for example, `i-001-old` reserves `1`). Choose the smallest unused positive integer and render it with at least three digits (values above 999 are not truncated). Freeze the number and slug once the folder is created. These are creation/conversion rules; lint does not claim to prove historical stability or title derivation from an unpersisted title.

## Index identity and frontmatter

`index.md` MUST begin at byte 1 with a line containing exactly `---` and close its frontmatter with a later line containing exactly `---`. The YAML between those delimiters MUST be strict, parseable YAML with exactly these three keys, each occurring once:

```yaml
issue-id: "i-<nnn>-<slug>"
origin: "actual source reference"
status: "pending"
```

All three values MUST be scalar strings. `issue-id` MUST equal the full containing directory name. `origin` MUST be non-empty and preserve the actual source reference. `status` MUST be exactly `pending`, `integrated`, or `rejected`; the displayed values are illustrative, not template tokens.

After frontmatter, the file MUST have a `## Summary` heading with non-empty source-grounded content, or the exact sentence `No source-grounded summary available.` when the source supplies no summary. It MUST have a `## Routes` table with exactly the columns `Need` and `File` and relative links to each of the four companion files.

## Aspect content contracts

Lint checks these contracts as well as the frontmatter:

- `ubi-lang.md` has `## Terms`. It contains a table with exactly `Term` and `Meaning` columns and at least one non-empty row, or exactly `No issue-specific terms.` under the heading.
- `spec.md` has `## Source requests`. It contains a table with exactly `Request ID`, `Source ask`, `Disposition`, and `Rationale` columns and at least one non-empty row. Every request ID is stable within the folder; every disposition is exactly `accepted`, `rejected`, `duplicate`, `deferred`, or `undecided`; every rationale is non-empty. If no ask can be supported, the exact alternative is `No issue-specific requests.`.
- `design.md` has `## Proposed design`. Its table, when present, has exactly `Request IDs` and `Proposal` columns, has non-empty proposals, and maps every row to one or more request IDs that exist in `spec.md`. The exact alternative is `No issue-specific design proposed.`.
- `test-plan.md` has `## Verification`. Its real checks table, when present, has exactly `Check ID`, `Request Refs`, `Procedure`, and `Expected Evidence` columns. Assign check IDs `T-001`, `T-002`, and so on in source verification-proposal encounter order. Each check has non-empty fields, maps only to an `accepted` or `undecided` request ID, and copies the source-provided procedure and expected evidence verbatim or faithfully. When accepted or undecided request IDs exist but the source supplies no verification proposal or evidence for some of them, append exactly `No source verification provided for request IDs: <ID_LIST>; source provides none.` where `<ID_LIST>` is the uncovered IDs in spec encounter order, joined by `, `. This statement may coexist with the checks table for covered IDs. When no accepted or undecided request IDs exist, use exactly `No verification required: source contains no accepted or undecided request IDs.` instead. The two absence statements are not template tokens.

No file may contain a blank template token. Unresolved facts are retained as explicit questions, rather than answered by inference. `index.md` origin is the sole canonical source reference; source-derived facts are routed to the appropriate companion aspect, and exact absence declarations remain exact without appended provenance.

## Declarative conversion

Conversion is a written procedure applied by a person, agent, or external tool. It is not executable product behavior.

1. **Collect source evidence.** Accept one or many legacy documents, tracker records, inline inputs, or broken issue folders. Define source encounter order as supplied input order, then document order within each source. Preserve each actual source identifier or location in that order; for every source with no identifier, use the literal `inline input (no source identifier)`. Write one reference or the ordered references joined with `; ` as the non-empty `origin` scalar in `index.md`; this origin is the sole canonical source reference. Treat the current workspace template as optional input evidence only; it is not the product schema.
2. **Derive identity.** Inspect supplied titles in source encounter order, trim and collapse whitespace in each, and choose the first normalized title that is non-empty. If no supplied title is non-empty, use the first non-empty sentence of the first source ask; if no source ask has such a sentence, use `Untitled issue`. Lowercase that selected title, replace maximal runs of characters outside ASCII `[a-z0-9]` with `-`, trim hyphens, split into `[a-z0-9]+` tokens, and take the first four. If there are zero tokens use `untitled-issue`; if there is one token append `issue`. In the target folder's parent issue collection, reserve the positive numeric components of every direct child directory whose name begins `i-([0-9]+)-`, including otherwise malformed names such as `i-001-old`; choose the smallest unused positive integer, render it with at least three digits, and create `i-<nnn>-<slug>`. Freeze both identity parts thereafter. Title provenance is not duplicated outside the canonical `index.md` origin.
3. **Route source-derived facts.** Route terms to `ubi-lang.md`, source asks and their evidence to `spec.md`, proposals to `design.md`, and source-provided verification proposals or evidence to `test-plan.md`; put the source-grounded summary and any unresolved identity question in `index.md`. Do not duplicate the canonical origin or all source evidence into every aspect. Never invent terminology, requests, rationale, design, evidence, status history, or source references.
4. **Write the five aspects.** Write `index.md` with exact frontmatter, `status: "pending"` for a newly converted issue, the source-grounded summary or its exact absence sentence, the canonical origin, and four routes. For each source ask in encounter order, assign `R-001`, `R-002`, and so on. Preserve an explicit allowed disposition together with its non-empty rationale. If either is absent, empty, or invalid, use disposition `undecided` and the exact rationale `No source disposition or rationale provided.`; do not guess a missing value. Write terms as a table or the exact terms absence sentence. Write design rows mapped to request IDs or the exact design absence sentence. Write only source-provided verification proposals or evidence as checks mapped to accepted or undecided request IDs, splitting each proposal and its expected evidence into the `Procedure` and `Expected Evidence` columns and assigning `T-001`, `T-002`, and so on in source encounter order. If any such IDs are uncovered, append the exact `No source verification provided for request IDs: <ID_LIST>; source provides none.` statement for those IDs; if none exist, use the exact `No verification required: source contains no accepted or undecided request IDs.` statement. Never invent checks or evidence.
5. **Handle source gaps.** Preserve every unresolved fact as a question in the appropriate aspect or in an `## Open questions` section of `index.md`; do not silently resolve it. When an aspect has no source-supported content, use its exact absence declaration without appending provenance. Remove all blank template tokens and do not copy template fields that conflict with this contract.
6. **Evaluate the lint contract.** Inspect the completed folder against every rule below, including rules that do not depend on successful metadata parsing. Record every finding; conversion is complete only with a conforming five-file folder or a complete finding report describing what remains malformed.

## Declarative lint contract

An inspector evaluates **all** rules for every folder and records no short-circuit. A parser failure creates a metadata finding, then all rules that do not depend on parsed metadata still run.

| Rule ID | Deterministic pass condition | Finding when the condition fails |
| :--- | :--- | :--- |
| `LINT-01` | The directory has exactly the five named regular files; none is a symlink; there are no subdirectories or extra entries. | Report the actual entries and entry kinds, expected exact five regular files, and remediation to remove extras or restore missing regular files. |
| `LINT-02` | The current directory name matches `i-[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+){1,3}`, has a numeric component whose value is greater than zero (`000` fails), and its number is unique among the other target-parent direct-child directories whose names begin with `i-([0-9]+)-`, including malformed candidate remainders. This observable check does not infer a title, prove slug derivation from an unpersisted title, or prove historical identity stability. | Report the observed name, numeric-value failure, or sibling-number collision, the full naming constraint and candidate issue collection used, and remediation to choose a conforming name or unique number before creation. |
| `LINT-03` | `index.md` starts at byte 1 with `---`, has a later exact closing `---`, and contains strict parseable YAML with no duplicate keys and exactly scalar keys `issue-id`, `origin`, `status`; origin is non-empty, status is in the three-value enum, and issue-id equals the full directory name. | Report delimiter, parser, duplicate-key, key-set, scalar, emptiness, enum, or identity mismatch with the observed metadata and the precise repair. A broken parser is a finding, not a reason to skip independent rules. |
| `LINT-04` | Every file has its required heading and observable, exact table columns with non-empty required fields, or its file-specific exact absence alternative: `No source-grounded summary available.` for an empty index summary; `No issue-specific terms.`; `No issue-specific requests.`; `No issue-specific design proposed.`; the exact no-source-verification statement `No source verification provided for request IDs: <ID_LIST>; source provides none.` when accepted or undecided IDs are uncovered (with `<ID_LIST>` in spec encounter order), or the exact no-verification-required statement `No verification required: source contains no accepted or undecided request IDs.` when none exist. The verification table, when present, has exactly `Check ID`, `Request Refs`, `Procedure`, and `Expected Evidence` columns; each row has a non-empty check ID, request reference, procedure, and expected evidence, and each request reference resolves to an accepted or undecided ID in `spec.md`. A checks table may coexist with the no-source-verification statement for uncovered IDs. LINT-04 does not assess whether procedure or evidence text came from source material or was invented; source grounding is a US-05 conversion obligation and is observable only in TL-05 traces that include both source and output. | Report the issue-relative file and missing or malformed heading, columns, row, content, absence declaration, or route, with the expected aspect contract and remediation. |
| `LINT-05` | No file contains a double-brace blank template token. | Report each token with its issue-relative path and line, expected concrete or exact absence content, and remediation to replace it without inventing facts. |
| `LINT-06` | Every Markdown link whose destination begins with the explicit `http://` or `https://` URI scheme is external and exempt from target resolution. Every other destination is issue-local and uses `/` separators, is not absolute, has no query or fragment, contains no path traversal, and after dot-segment normalization resolves to exactly one of the five files in the same issue folder. | Report the observed destination and line when locatable, expected local-link constraints or an explicit `http://` or `https://` URI, and remediation to correct the route. |
| `LINT-07` | The five goal documents require only this declarative standard and inspection evidence; they do not require software, commands, APIs, executable runtime, source/package/dependency artifacts, orchestration, apply/archive actions, or implementation plans. | Report the goal-relative document path and line when locatable, observed forbidden product requirement, expected docs-only scope, and remediation to remove it. This rule inspects only the five goal documents and ignores inherited repository/workspace implementation. |

Each finding has exactly these conceptual fields: rule ID, path relative to the lint target root, line if locatable (otherwise null), observed, expected, and remediation. For issue-folder rules, the path is issue-relative; for the docs-only `LINT-07` scope check, the path is goal-relative to `.arca/goal`. Lint passes if and only if the complete evaluation records zero findings.

## Docs-only boundary

The standard's deliverables are the five documents and their written conversion, aspect, and lint contracts. Applying them may be done by a person, agent, or external tool, but this goal neither requests nor implies a converter or linter program, a command interface, APIs, runtime behavior, source/package/dependency requirements, orchestration, apply/archive behavior, or an implementation plan.
