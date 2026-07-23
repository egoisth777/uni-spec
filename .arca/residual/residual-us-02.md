residual-id: "residual-us-02"
goal-requirement-ref: ".arca/goal/spec.md#source-requests"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; ordered goal index, ubi, spec, design, test-list filename-NUL-content SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "sanitized docs-only standard/ deliverable against repository HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0"
concrete-evidence-refs:
  - "standard/index.md#naming-examples"
  - "standard/issue-format.md#naming-and-allocation"
  - "standard/examples/naming-c4/scenario.md"
  - "standard/examples/naming-c5/scenario.md"
  - "standard/examples/naming-invalid/scenario.md"
classification-rationale: "US-02 is satisfied: the naming contract and front door define the exact positive padded directory pattern, title encounter-order selection, lowercase-before-maximal-run replacement, zero/one/four-token handling, malformed-sibling reservation, smallest-unused allocation, and creation-time identity freeze; C4, C5, and invalid-name documentary fixtures provide direct inspection proof."
status: "satisfied"
required-test-refs:
  - ".arca/goal/test-list.md#verification — T-002"
