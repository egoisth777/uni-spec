residual-id: "residual-us-01"
goal-requirement-ref: ".arca/goal/spec.md#source-requests"
frozen-goal-bundle-revision: "HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f; ordered goal index, ubi, spec, design, test-list filename-NUL-content SHA-256 86153fcdcccdc5bbd7c4bb98358a6423f79047c1e665f86ae01184f496694021"
implementation-revision: "sanitized docs-only standard/ deliverable against repository HEAD dd3fe7053bfee91ad9616367dd2c314ab2bf131f"
concrete-evidence-refs:
  - "standard/index.md#five-file-issue-shape"
  - "standard/issue-format.md#package-boundary"
  - "standard/examples/shape-only/i-001-example-issue/index.md"
  - "standard/examples/shape-only-extra-entry/extra.md"
classification-rationale: "US-01 is satisfied: the front door and package contract require exactly the five named regular aspect files, with distinct responsibilities and no symlink, subdirectory, or extra entry; conforming and extra-entry documentary fixtures provide direct inspection proof of the shape."
status: "satisfied"
required-test-refs:
  - ".arca/goal/test-list.md#verification — T-001"
