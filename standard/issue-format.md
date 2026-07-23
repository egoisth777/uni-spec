# Issue format

This document defines the normative responsibilities of the five files named by the [standard front door](./index.md). It is shape-only: a person or external inspection may apply the rules, but this product slice defines no CLI, API, runtime, converter, linter, package, dependency, orchestration, or product code.

## Package boundary

An issue folder is exactly one directory with exactly five regular files: `index.md`, `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`. Symlinks, subdirectories, and any extra entries make the folder non-conforming.

## Aspect responsibilities

| File | Responsibility |
| --- | --- |
| `index.md` | Identity, the actual source reference, lifecycle status, source-grounded summary, and routes to the other four aspects. Its origin is the sole canonical source reference. |
| `ubi-lang.md` | Issue-specific terms under `## Terms`, with exactly `Term`/`Meaning` columns and a non-empty row, or the exact sentence `No issue-specific terms.` |
| `spec.md` | Stable source requests under `## Source requests`, with exactly `Request ID`/`Source ask`/`Disposition`/`Rationale` columns, or the exact sentence `No issue-specific requests.` |
| `design.md` | Proposed design under `## Proposed design`, with exactly `Request IDs`/`Proposal` columns mapped to source requests, or the exact sentence `No issue-specific design proposed.` |
| `test-plan.md` | Source-provided verification under `## Verification`, with exactly `Check ID`/`Request Refs`/`Procedure`/`Expected Evidence` columns, or the exact applicable no-verification declaration. |

## Index identity and frontmatter

`index.md` MUST begin at byte 1 with an exact `---` line and close its frontmatter with a later line containing exactly `---`. The enclosed YAML MUST be strict and parseable, contain exactly one scalar string each of `issue-id`, `origin`, and `status`, and contain no other keys or duplicate keys:

```yaml
issue-id: "i-<nnn>-<slug>"
origin: "actual source reference"
status: "pending"
```

`issue-id` MUST equal the full containing directory name. `origin` MUST be non-empty and preserve the actual source reference. `status` MUST be exactly `pending`, `integrated`, or `rejected`.

After frontmatter, `index.md` MUST contain a `## Summary` heading with non-empty source-grounded content, or the exact sentence `No source-grounded summary available.` It MUST then contain a Markdown `## Routes` table whose header columns are exactly `Need` and `File`, followed by exactly two valid Markdown delimiter cells and exactly four data rows. The four data rows collectively MUST contain exactly one relative link to each of `ubi-lang.md`, `spec.md`, `design.md`, and `test-plan.md`; both the normalized destination `name.md` and the direct relative form `./name.md` are accepted. Absolute, traversal, query, fragment, and backslash destinations are forbidden. The canonical template is [templates/issue/index.md](./templates/issue/index.md); its angle-bracket values and explanatory comments are template-only.
The canonical angle-bracket markers are exactly `<nnn>`, `<slug>`, `<actual source reference>`, `<source-grounded summary, or the exact absence sentence: No source-grounded summary available.>`, `<term>`, `<issue-specific meaning>`, `<source ask>`, `<source-grounded rationale>`, `<proposal mapped to source request IDs>`, `<source-provided procedure>`, and `<source-provided expected evidence>`. These listed strings are template-only markers and MUST NOT occur in delivered issue files; this rule does not treat ordinary Markdown or HTML tags as placeholders unless they are one of these exact markers.

## Routing and distinctness

Facts route to their owning aspect. A companion may link to another aspect, but must not duplicate that aspect's records or become an authority trace. `index.md` routes to all four companions and does not copy their terms, requests, design proposals, or checks.

## Companion aspect contracts

`ubi-lang.md` MUST contain `## Terms`. Its table MUST have exactly `Term` and `Meaning` columns and at least one row with both cells non-empty. When no issue-specific terminology exists, the only content under that heading MUST be `No issue-specific terms.`.

`spec.md` MUST contain `## Source requests`. Its table MUST have exactly `Request ID`, `Source ask`, `Disposition`, and `Rationale` columns and at least one row with every cell non-empty. Request IDs MUST be stable within the issue and use deterministic encounter-order identifiers matching `R-[0-9]{3,}`; values such as `R-001` and `R-1000` are valid with no upper bound. Each disposition MUST be exactly `accepted`, `rejected`, `duplicate`, `deferred`, or `undecided`. When no source ask can be supported, the only content under that heading MUST be `No issue-specific requests.`.
`design.md` MUST contain exactly one `## Proposed design` heading. Its content MUST be either a Markdown table with exactly `Request IDs` and `Proposal` columns, non-empty proposals, and one or more existing source request IDs per row, or the exact sentence `No issue-specific design proposed.`.
`test-plan.md` MUST contain `## Verification`. Its real checks table, when present, MUST have exactly `Check ID`, `Request Refs`, `Procedure`, and `Expected Evidence` columns; all cells MUST be non-empty; and check IDs MUST be `T-001`, `T-002`, and so on in source verification-proposal encounter order, with at least three decimal digits and no upper bound. Every check row MUST contain at least one request reference naming an `accepted` or `undecided` request from `spec.md`; rejected, duplicate, and deferred requests are not eligible. If eligible requests are uncovered, append exactly `No source verification provided for request IDs: <ID_LIST>; source provides none.`, preserving spec encounter order, with `<ID_LIST>` equal to the uncovered IDs joined by the exact delimiter `, `. When there are no eligible requests, the Verification body MUST consist solely of exactly `No verification required: source contains no accepted or undecided request IDs.`. That no-verification declaration is invalid beside a checks table or when any eligible request exists.

The two verification absence declarations are exact strings, not template tokens. No delivered file may contain a blank template token such as `{{...}}`; unresolved facts remain explicit questions rather than inferred answers. Source-derived facts belong only to their owning aspect, and `index.md` origin remains the sole canonical source reference.

## Local link contract

Every Markdown link whose destination begins with `http://` or `https://` is external and exempt from target resolution. Every other destination is issue-local: it MUST use `/` separators, be relative (not begin with `/`), contain no query or fragment, contain no path traversal, and resolve after dot-segment normalization to exactly one of the five regular files in the same issue folder.

## Inspection boundary

Inspection observes directory entries, file kinds, headings, tables, content, and local routes. It accepts only the exact five regular files and resolves each local route within the same issue folder. The standard remains declarative documents and inspection evidence; applying it does not imply executable product behavior.

## Naming and allocation

An issue directory MUST match `i-<nnn>-<slug>`. The numeric component is a positive ASCII decimal integer (its numeric value MUST be greater than zero, so `000` is invalid) rendered with at least three digits; values above `999` are not truncated. The slug MUST contain two to four non-empty lowercase ASCII-alphanumeric components separated by single hyphens. Each component MUST match `[a-z0-9]+`, so the complete observable pattern is `i-[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+){1,3}`.
During conversion, process each supplied input completely in supplied order: for one input, inspect that input's documents in document order before moving to the next input. Trim and collapse whitespace in each encountered title, then select the first normalized title that is non-empty. If no supplied title is non-empty, use the first non-empty sentence of the first source ask; if no source ask has such a sentence, use the exact title `Untitled issue`.

Lowercase the selected normalized title BEFORE replacing every maximal run of characters outside ASCII `[a-z0-9]` with a single hyphen. Trim leading and trailing hyphens, split on hyphens, remove empty tokens, and take the first four tokens. If no tokens remain, use `untitled-issue`; if exactly one token remains, append `issue`. Thus `Hello World` produces `hello-world`, and the result always has two to four `[a-z0-9]+` components.

The target folder's parent defines the issue collection. Inspect every direct-child directory whose name begins with `i-<digits>-`; parse those digits as an integer and reserve every positive value, even when the remainder is malformed (for example, `i-001-old` reserves `1`). Choose the smallest unused positive integer and render it with at least three digits. Freeze the chosen number and slug in the directory name and `index.md` `issue-id` when the folder is created; later title changes MUST NOT rename either identity.

These are creation/conversion rules. Lint checks only the observable directory-name pattern, positive numeric value, and uniqueness against all direct-child directories beginning `i-<digits>-`; lint MUST NOT claim to derive a slug from an unpersisted title or prove historical identity stability. This product slice defines no CLI, API, runtime, converter, linter, package, dependency, orchestration, or product code.
