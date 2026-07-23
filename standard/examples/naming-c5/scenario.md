# C5 first non-empty title trace

This documentary fixture preserves source encounter order. It is not a converter or runtime allocator.

- supplied title: ``
- supplied title: `Hello World`
- later supplied title: `Later title`
- first selected title: `Hello World`
- expected slug: `hello-world`
- later title does not replace the selected title

The empty title is ignored after trim/collapse. The mixed-case title is selected first, lowercased before replacement, and remains the frozen identity after the later input is observed.
