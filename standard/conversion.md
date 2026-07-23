# Declarative conversion procedure

This is a documentary standard for a person or an external inspection to apply to legacy material. It defines a deterministic conversion observation, not an implementation. The result is either a conforming five-file issue folder or a complete finding report; a partial folder is not a conversion result.

## Scope boundary

Conversion may read one or many legacy documents, tracker records, inline inputs, or broken folders. It may record text, structure, source references, questions, expected documents, and written lint observations. It MUST NOT introduce a product converter, CLI/API/runtime, linter implementation, package, dependency, orchestration, apply/archive action, or implementation code. A lint trace is a written observation of a post-write inspection, not a linter product.

## Deterministic invariants

- Process supplied inputs in supplied-input order, then document order. Never let a later document reorder an earlier source fact.
- Preserve source references in encounter order in the sole canonical `index.md` `origin`. One reference is serialized as-is; multiple references are joined with exactly `; `; no references serialize exactly as `inline input (no source identifier)`.
- Route each source fact to one owning aspect: terms to `ubi-lang.md`, asks/evidence to `spec.md`, proposals to `design.md`, source verification to `test-plan.md`, and summary/open questions to `index.md`. Do not duplicate authority.
- Preserve unresolved facts as explicit questions. Do not invent source requests, dispositions, rationales, proposals, checks, evidence, terms, or answers.
- Assign request IDs `R-001`, `R-002`, and so on in source encounter order. Assign verification Check IDs `T-001`, `T-002`, and so on in source verification-procedure encounter order; preserve source Procedure and Expected Evidence exactly, but do not preserve source check IDs.
- Every newly written `index.md` starts with frontmatter `status: "pending"` before any later lifecycle change.

## C0 — collect and order source material

1. Record each supplied input (legacy document, tracker record, inline input, or broken folder) in the order supplied. Within each input, record documents in document order. Retain readable text, identifiers, malformed frontmatter, malformed links, and parser failures as observations; malformed input is evidence, not an authority schema.
2. Assign each encountered source reference once. A source identifier is the source's reference; an input without one contributes the exact literal `inline input (no source identifier)`.
3. Record the first source ask, unresolved facts, and every source-provided disposition/rationale. If an ask has no complete valid disposition and rationale, record `undecided` with rationale `No source disposition or rationale provided.`.
4. Write the C0 observation before drafting output. A single source may already yield the five-file package: terms and design use exact absence declarations when unsupported, while requests receive encounter IDs and eligible source verification is retained.

## C1 — preserve origin and route facts

Write the sole canonical `index.md` origin from the C0 reference list, without deduplication or authority copying:

- one reference: that reference exactly;
- multiple references: references joined exactly by `; `;
- no references: exactly `inline input (no source identifier)`.
- The C1 expected multi-source origin is `legacy-a.md; inline input (no source identifier); inline input (no source identifier)`; this is a written comparison value, not generated output.

Route terms to `ubi-lang.md`, asks and their evidence to `spec.md`, proposals to `design.md`, and source verification to `test-plan.md`. Preserve source-provided proposal request associations and verification request associations in their owning tables; associations are source facts and MUST NOT be inferred from position, wording, or eligibility. A route is not permission to repeat another aspect's records. Record source encounter order separately from document display order when needed to make the order auditable.

## C2 — select title and create the first written identity

Inspect supplied titles in supplied-input order followed by document order. Trim and collapse whitespace in each title and select the first normalized non-empty title. If there is no non-empty supplied title, select the first non-empty sentence of the first source ask. If neither exists, select the exact title `Untitled issue`. Lowercase the selected normalized title, replace every maximal run of characters outside ASCII `[a-z0-9]` with one hyphen, trim leading and trailing hyphens, split on hyphens, remove empty tokens, and take the first four tokens. If no token remains, use the exact slug `untitled-issue`; if exactly one token remains, append `issue`.

Allocate the smallest unused positive number from all direct-child directories whose names begin `i-<digits>-`, including malformed remainder candidates. Render at least three digits. Create the folder and `index.md` identity together; write `status: "pending"` immediately. Do not add an inferred-title note. A broken source's malformed frontmatter or links cannot override this procedure.

## C3 — write exact absence declarations and questions

When no source fact supports an aspect, write exactly the applicable declaration from the issue format: `No issue-specific terms.`, `No issue-specific requests.`, `No issue-specific design proposed.`, or `No verification required: source contains no accepted or undecided request IDs.`. Keep the literal no-source origin when applicable. Unresolved facts remain explicit questions in the owning aspect or in the index summary/open questions. Never replace missing material with a blank token, a plausible answer, or an invented check. The requestless result still has exactly five files and a complete post-write inspection.

## C4 — reserve number and freeze identity

Inspect every direct-child directory beginning `i-<digits>-`; parse the digits as a number and reserve every positive value even when the suffix is malformed (for example, `i-001-old` reserves 1). Select the smallest unused positive number, such as 2 when `i-001-old` and `i-003-existing` are present, and render it with at least three digits. Freeze the selected number and slug in the folder name and `index.md` `issue-id` at creation. Later title or sibling source changes cannot rename the folder or alter that issue ID.

## C5 — keep the first title and identity stable

A blank supplied title is skipped after trim/collapse. The first non-empty supplied title wins; later supplied titles and later document titles are observations only. A title change after creation may be recorded in a trace, but MUST NOT alter the frozen folder name, slug, or `issue-id`. Re-check that the written identity still matches the containing directory.

## C6 — preserve requests and finish after written lint

Assign stable request IDs `R-001`, `R-002`, and so on in source encounter order. Preserve an explicit valid disposition and rationale exactly. For a missing, partial, or invalid disposition/rationale, use disposition `undecided` and the exact rationale `No source disposition or rationale provided.`. Accepted, rejected, duplicate, deferred, and undecided remain distinct source values.

Copy only source-provided verification to `test-plan.md`. Preserve each source verification request association; assign Check IDs `T-001`, `T-002`, and so on in verification-procedure encounter order, regardless of any source check identifier. Preserve each source-provided Procedure and Expected Evidence exactly. Eligible checks cover accepted or undecided requests only. If eligible requests have no source verification, append exactly `No source verification provided for request IDs: <ID_LIST>; source provides none.` in spec encounter order. If there are no eligible IDs, use exactly `No verification required: source contains no accepted or undecided request IDs.`. Never infer a check association or invent a check or evidence for an uncovered, rejected, duplicate, or deferred request.

After writing all five files, observe every lint rule and write a complete lint trace, including PASS or every finding and the observed evidence. A parser or broken-input observation does not permit early stopping. Conversion completes only after the post-write complete lint evaluation observes a conforming five-file folder, or after a complete finding report records why it does not conform. A post-lint failure leaves a finding report; it is not silently repaired or declared complete.

## Written red-hole observations

Before accepting a trace, deliberately inspect source reorder, title gaps, multi-reference encoding, disposition partials, broken input, no verification, and post-lint failure. The observation records the supplied text, expected exact result, and any finding/remediation. These checks are documentary comparisons only: no converter or linter is invoked.

## Output contract

A successful output contains exactly `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md` as regular files, with local routes resolving within that folder. No delivered output contains blank template tokens such as `{{...}}`. The output folders and C0-C6 traces under `standard/examples/` are filled evidence for this procedure, not executable converter output.
