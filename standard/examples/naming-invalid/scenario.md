# Invalid naming examples

These documentary cases are lint inputs; they do not create or rename anything.

- zero numeric value: `i-000-valid-name` (the shape matches, but positive-number validation rejects numeric value zero)
- one slug component: `i-001-one` (too few slug components; the canonical one-token title would be `one-issue`)
- five slug components: `i-001-one-two-three-four-five` (too many components)
- uppercase component: `i-001-Upper-case` (component is not `[a-z0-9]+`)
- collision: `i-001-existing` (a positive number already reserved by a direct-child sibling)

The exact name pattern has two to four lowercase ASCII-alphanumeric components; numeric positivity and sibling uniqueness are separate observable checks.
