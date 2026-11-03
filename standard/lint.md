# Declarative lint inspection standard

This is a documentary inspection contract for a uni-spec issue folder. It defines observable checks and written findings only. A person, agent, or external inspection tool may apply this standard; this repository ships no linter, CLI, API, runtime, package, dependency, orchestration, converter, or implementation for it.

## Scope and target

The lint target is one issue folder and its direct-child entries. Issue-folder paths in findings are relative to that folder. `LINT-07` is a separate scope observation over exactly `.arca/goal/index.md`, `.arca/goal/ubi-lang.md`, `.arca/goal/spec.md`, `.arca/goal/design.md`, and `.arca/goal/test-list.md`; its finding paths are relative to the inspected goal root. Inherited workspace or repository implementation is outside that scope and MUST be ignored.

An inspection observes text and filesystem structure. It MUST evaluate every rule for every target, MUST NOT short-circuit after a finding, and MUST retain all findings. A metadata parser failure is itself a `LINT-03` finding; rules that do not depend on parsed metadata continue. A trace's `evaluatedRules` therefore contains `LINT-01` through `LINT-07` in that order even when an earlier rule fails.

## Deterministic rule matrix

| Rule ID | Pass condition | Finding and remediation |
| --- | --- | --- |
| `LINT-01` | The direct-child directory has exactly `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`; each is a regular file, none is a symlink, and there are no subdirectories or extra entries. | Record the actual entries and observed entry kinds, expected exact five regular files, and actionable remediation to remove extras or restore missing regular files. A symlink is an observed `entry.kind: symlink` record, not a regular file; fixtures may document this kind without creating a non-portable Windows symlink. |
| `LINT-02` | The current directory name matches `i-[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+){1,3}`, its numeric component has value greater than zero (`000` fails), and its number is unique among target-parent direct-child directories whose names begin with `i-([0-9]+)-`, including malformed candidate remainders. | Record the observed name, numeric-value failure, or sibling-number collision, the full naming constraint and candidate issue collection, and remediation to choose a conforming name or unique number before creation. Do not infer a title, slug derivation from an unpersisted title, or historical identity stability. |
| `LINT-03` | `index.md` begins at byte 1 with an exact `---`, has a later line exactly `---`, and its enclosed YAML is strict and parseable with no duplicate keys and exactly scalar `issue-id`, `origin`, and `status`. `origin` is non-empty, `status` is exactly `pending`, `integrated`, or `rejected`, and `issue-id` equals the full directory name. | Record delimiter, parser, duplicate-key, key-set, scalar, emptiness, enum, or identity mismatch with observed metadata and precise repair. A parser failure is recorded and does not suppress independent rules. |
| `LINT-04` | Every file has its required heading and exact observable table columns with non-empty required fields, or its exact file-specific absence alternative. `index.md` has `## Summary` with non-empty text or `No source-grounded summary available.`, then `## Routes` with exactly `Need` and `File` columns and one relative route to each of `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`. `ubi-lang.md` accepts `No issue-specific terms.`; `spec.md` accepts `No issue-specific requests.`; `design.md` accepts `No issue-specific design proposed.`; and `test-plan.md` accepts `No source verification provided for request IDs: <ID_LIST>; source provides none.` when accepted or undecided IDs are uncovered (with `<ID_LIST>` in spec encounter order), or `No verification required: source contains no accepted or undecided request IDs.` when none exist. Verification columns are exactly `Check ID`, `Request Refs`, `Procedure`, and `Expected Evidence`; every row is non-empty and each request reference resolves to an accepted or undecided request in `spec.md`. A checks table may coexist with the no-source-verification statement for uncovered IDs. LINT-04 checks only observable text, headings, columns, cells, declarations, and links; source grounding belongs to conversion source/output proof. For an empty `Rationale`, remediation MUST set disposition to `undecided` and write exactly `No source disposition or rationale provided.` | Record issue-relative file and missing or malformed heading, columns, row, content, absence declaration, or route, with expected aspect contract and actionable remediation.`
| `LINT-05` | No file contains a canonical angle-bracket template marker from issue-format (`<nnn>`, `<slug>`, `<actual source reference>`, `<source-grounded summary, or the exact absence sentence: No source-grounded summary available.>`, `<term>`, `<issue-specific meaning>`, `<source ask>`, `<source-grounded rationale>`, `<proposal mapped to source request IDs>`, `<source-provided procedure>`, or `<source-provided expected evidence>`) or a double-brace blank template token matching `{{...}}`. | Record each token with issue-relative path and line when locatable, observed token text, expected concrete or exact absence content, and remediation to replace it without inventing facts.`
| `LINT-06` | A Markdown destination beginning explicitly with `http://` or `https://` is external and exempt from target resolution. Every other destination is issue-local: it uses `/` separators, is relative (not `/`-absolute), has no query or fragment, contains no path traversal, and after dot-segment normalization resolves to exactly one of the five regular files in this issue folder. | Record observed destination and line when locatable, expected local-link constraints or an explicit external URI, and actionable remediation to correct the route. |
| `LINT-07` | The five goal documents require only this declarative standard and inspection evidence. They MUST NOT require software, commands, APIs, executable runtime, source/package/dependency artifacts, orchestration, apply/archive actions, or implementation plans. | Record goal-relative document path and line when locatable, observed forbidden product requirement, expected docs-only scope, and remediation to remove it. Inspect only the five named goal documents; ignore inherited repository/workspace implementation. |

## Finding and result contract

Each finding is an object with exactly six conceptual fields: `ruleId`, `path`, `line`, `observed`, `expected`, and `remediation` (called rule ID, path, line, observed, expected, and remediation in prose). `ruleId` is one matrix ID. `path` is issue-relative for `LINT-01` through `LINT-06`, with `.` reserved for an observation about the target issue root itself (for example, an LINT-02 directory-name observation), and goal-relative to the inspected goal root for `LINT-07`. `line` is the 1-based line when the observation is locatable, otherwise `null`. `observed` preserves the actual text or structure; `expected` states the applicable contract; `remediation` is specific and actionable, never an invented fact or silent repair.

The complete result is `PASS` if and only if the complete evaluation records zero findings. Any one or more findings yields `FAIL`. PASS/FAIL is determined after all seven rules have been evaluated.

## Deterministic inspection procedure and boundaries

1. Observe direct-child entries and their kinds without following symlinks, then evaluate LINT-01.
2. Observe the current name and target-parent candidate directories, then evaluate LINT-02. Candidate names beginning `i-` plus digits reserve their positive numeric value even when the remainder is malformed.
3. Read `index.md` as bytes and delimit frontmatter. Parse strict YAML while preserving duplicate-key and scalar observations; record LINT-03 parser findings but continue.
4. Inspect required headings, exact table headers, non-empty cells, absence alternatives, and request-reference eligibility for LINT-04.
5. Inspect every file for every canonical angle-bracket marker listed in LINT-05 and every double-brace token; report each token under LINT-05.
6. Inspect Markdown links. Classify only destinations beginning exactly `http://` or `https://` as external. All others must satisfy local route constraints and normalize to one of the five files under the same target root; query/fragment and traversal are findings even if a filesystem target happens to exist.
7. Independently inspect only the five goal documents for forbidden implementation requirements under LINT-07; inherited implementation is not an observation.
8. Preserve the ordered complete findings and set PASS/FAIL according to the result contract.

No rule may suppress another rule because of a dependency failure. Only metadata-dependent identity checks may note unavailable parsed values; shape, content, token, link, and docs-only checks continue and remain observable.

## Documentary state traces

These folders and finding records are documentary observations, not executable linter output. Each state records all seven evaluated rules and a complete expected finding trace in [`lint-findings`](./examples/lint-findings/).

### L0 — clean PASS

[`lint-l0-pass/i-007-nucleus-only`](./examples/lint-l0-pass/i-007-nucleus-only/) is an actual issue directory whose basename is `i-007-nucleus-only`; it has exactly five regular files, valid metadata, conforming aspect content, and valid local routes. All seven rules evaluate with zero findings; the result is `PASS`. Expected trace: [`l0.json`](packs/skill-dev/uni-spec/standard/examples/lint-findings/l0.json).

### L1 — shape continuation

[`lint-l1-shape`](./examples/lint-l1-shape/) documents the five expected regular files plus an extra regular file and a symlink entry. The symlink is represented in `entries.json` as an observed `entry.kind: symlink` record because creating symlinks is non-portable on Windows; this does not weaken LINT-01, which requires no symlinks. LINT-01 records separate findings for the extra and symlink and LINT-02 through LINT-07 continue. Expected trace: [`l1.json`](packs/skill-dev/uni-spec/standard/examples/lint-findings/l1.json).

### L2 — metadata continuation

[`lint-l2-metadata`](./examples/lint-l2-metadata/) documents an `index.md` with duplicate YAML `status` and a non-scalar `status` value while other observations remain conforming. LINT-03 records both metadata findings, then independent LINT-01, LINT-02, and LINT-04 through LINT-07 continue. Expected trace: [`l2.json`](packs/skill-dev/uni-spec/standard/examples/lint-findings/l2.json).

### L3 — content and query

[`lint-l3-content`](./examples/lint-l3-content/) documents a missing `Proposal` column in `design.md`, an empty `Rationale` cell in `spec.md`, and a local `test-plan.md` link with a query. LINT-04 records both content findings and LINT-06 records the query finding; all rules still evaluate. Expected trace: [`l3.json`](packs/skill-dev/uni-spec/standard/examples/lint-findings/l3.json).

### L4 — token and invalid links

[`lint-l4-links-token`](./examples/lint-l4-links-token/) documents a canonical `<term>` angle-bracket marker and a double-brace blank token in `ubi-lang.md`, a `..` traversal in `index.md`, and an unresolved local anchor/path. LINT-05 records both tokens, LINT-06 records both invalid destinations, all seven rules run, and no repair is fabricated. Expected trace: [`l4.json`](packs/skill-dev/uni-spec/standard/examples/lint-findings/l4.json).

### L5 — docs-only scope

[`lint-l5-scope`](./examples/lint-l5-scope/) uses the conforming issue target `issue-target/i-012-scope-guard` for LINT-01 through LINT-06 and the separate five-file `goal-root` for LINT-07. Its trace identifies both roots; LINT-07 reports one goal-relative requirement and ignores inherited workspace implementation while all other rules continue. Expected trace: [`l5.json`](packs/skill-dev/uni-spec/standard/examples/lint-findings/l5.json).

## Boundary

The standard and these traces are documentation and inspection evidence only. They do not request or imply executable product code, a linter, CLI, API, runtime, package, dependency, orchestration, apply/archive operation, or implementation plan.
