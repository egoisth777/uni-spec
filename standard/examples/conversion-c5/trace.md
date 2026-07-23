# C5 conversion trace

## Observed source

- The first supplied title is empty after trim/collapse.
- The next supplied title is `Original Title` and the following supplied title is `Later Title Must Not Rename`.
- Siblings `i-001-old` and `i-003-existing` reserve numbers 1 and 3.

## Expected written evidence

- Select the first non-empty supplied title after trim/collapse: `Original Title`.
- Create the identity from that title as `i-002-original-title`; the later title is an observation only.
- The folder and issue-id remain frozen after the later title change; identity remains frozen.
- Unsupported terms, requests, design, and verification use their exact absence declarations.

## Inspection result

Empty title gaps are skipped deterministically, and the first non-empty title controls identity without later mutation.
