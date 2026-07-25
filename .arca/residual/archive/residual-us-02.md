residual-id: "residual-us-02"
goal-requirement-ref: ".arca/goal/spec.md#source-requests"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; ordered goal index, ubi, spec, design, test-list filename-NUL-content SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "sanitized docs-only standard/ deliverable against repository HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
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
