# C2 conversion trace

## Observed source

- A broken input folder has observed malformed frontmatter `title: [broken` and malformed link `[Spec](../spec.md?bad)`.
- No supplied title is non-empty after trim/collapse.
- The first source ask begins with the non-empty sentence `Fallback title.` and continues with a recovery request.
- An unresolved recovery owner remains unknown; the disposition and rationale are malformed/incomplete.

## Expected written evidence

- The first non-empty sentence of the first source ask supplies the fallback title; it normalizes to slug `fallback-title` without an inferred-title note.
- Malformed input is evidence, not an authority schema, and malformed frontmatter/link text is not copied into the new output. The output is exactly five files with `status: "pending"`.
- The request receives `R-001` with exact fallback rationale `No source disposition or rationale provided.` and its eligible request has the exact no-source-verification declaration.
- The unresolved owner remains a question, and all lint rules are evaluated after writing.

## Inspection result

The title fallback is deterministic and the broken source does not override canonical metadata or routes. The post-write trace is complete.
