# C4 naming and allocation trace

This documentary fixture records the creation trace and the later title mutation. It is not an allocator or conversion entry point.

- supplied title: `Original issue`
- sibling: `i-001-old` (malformed remainder, but numeric component reserves 1)
- sibling: `i-003-existing`
- expected allocation: `i-002-original-issue`
- changed supplied title: `Changed title`
- frozen folder: `i-002-original-issue`
- frozen issue-id: `i-002-original-issue`

The later supplied title is observed after creation and does not rename the folder or rewrite `index.md` identity.
