# uni-spec standard

This front door is the normative authority for the uni-spec issue package shape. The companion responsibility details are in [issue-format.md](./issue-format.md). Examples are fixtures for inspection, not executable product behavior.

## Five-file issue shape

One issue is one directory containing exactly these five regular Markdown files and no symlinks, subdirectories, or extra entries:

1. `index.md` — identity, provenance, status, summary, and routes.
2. `ubi-lang.md` — issue-specific terms, or the exact absence declaration.
3. `spec.md` — stable source-request records, each with disposition and rationale.
4. `design.md` — proposed design mapped to source-request IDs, or the exact absence declaration.
5. `test-plan.md` — source-provided verification mapped to accepted or undecided requests, or the exact absence declaration.

The five aspects remain distinct. `index.md` is the sole canonical source reference; source-derived facts route to their owning aspect without duplication. The front door routes to the companion aspects, while each companion remains authoritative only for its own responsibility.

## Index metadata

The `index.md` byte-1 YAML frontmatter, summary alternative, and four companion routes are normative in [issue-format.md](./issue-format.md). The canonical template is [templates/issue/index.md](./templates/issue/index.md); its placeholders are template-only and must be replaced with source-grounded values in a delivered issue.

Canonical companion templates are [ubi-lang.md](./templates/issue/ubi-lang.md), [spec.md](./templates/issue/spec.md), [design.md](./templates/issue/design.md), and [test-plan.md](./templates/issue/test-plan.md). A complete cross-aspect fixture is [i-004-cross-aspect](./examples/fully-conforming/i-004-cross-aspect/index.md); adversarial aspect fixtures are in [aspect-invalid](./examples/aspect-invalid/).

## Shape-only scope

This slice defines document shape and inspection evidence only. It does not define a CLI, API, runtime, converter, linter, package, dependency, orchestration, or product implementation.

## Declarative lint inspection

The complete all-rules inspection matrix, finding/result contract, and L0-L5 documentary traces are in [lint.md](./lint.md). The fixture folders and expected finding records are inspection evidence only; this standard defines no executable linter or product implementation.

## Declarative conversion

The deterministic C0-C6 written conversion procedure, its exact origin/title/routing/lifecycle rules, and its docs-only boundary are in [conversion.md](./conversion.md). Each independent source fixture is [conversion-c0/source.md](./examples/conversion-c0/source.md) through [conversion-c6/source.md](./examples/conversion-c6/source.md), with corresponding [conversion-c0/trace.md](./examples/conversion-c0/trace.md) through [conversion-c6/trace.md](./examples/conversion-c6/trace.md). Filled five-file outputs are in [conversion outputs](./examples/conversion-outputs/), the literal C6 source-to-output comparison is [conversion-c6/comparison.md](./examples/conversion-c6/comparison.md), and the complete post-write matrix is [conversion-lint-observations.md](./examples/conversion-lint-observations.md). These are documentary observations only: no converter, linter, CLI/API/runtime, package, dependency, orchestration, or apply/archive action is defined.

## Naming examples

The normative naming, allocation, and creation-identity freeze rules are in [issue-format.md](./issue-format.md). The heading `Naming and allocation` contains that contract. Documentary traces and invalid-name inputs are available for inspection:

- [C4 allocation and freeze](./examples/naming-c4/scenario.md)
- [C5 first non-empty title](./examples/naming-c5/scenario.md)
- [Invalid naming inputs](./examples/naming-invalid/scenario.md)
