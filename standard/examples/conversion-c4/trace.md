# C4 conversion trace

## Observed source

- Direct-child siblings include `i-001-old` with a malformed remainder and `i-003-existing`.
- The first supplied title is `Original Title`; a later source title change is `Changed Title After Creation`.

## Expected written evidence

- Both positive candidate numbers are reserved, including malformed `i-001-old`.
- The smallest unused positive number is 2, rendered as `002`; identity is `i-002-original-title`.
- The created folder and `index.md` issue-id freeze together. The later title change cannot rename the folder or issue-id.
- Unsupported terms, requests, design, and verification use their exact absence declarations.

## Inspection result

Allocation uses all direct-child candidates and preserves the frozen identity after the later source mutation.
