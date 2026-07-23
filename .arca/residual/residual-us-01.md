residual-id: "residual-us-01"
goal-requirement-ref: ".arca/goal/spec.md#source-requests"
frozen-goal-bundle-revision: "HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0; ordered goal index, ubi, spec, design, test-list filename-NUL-content SHA-256 4cf93e9a9a26f61b33c16a98b7e5bb5f2274b67c5102c1bc937c4267e0a6e6f0"
implementation-revision: "sanitized docs-only standard/ deliverable against repository HEAD 0a99f410457271aa773d8b106f03f637f7c6b3c0"
concrete-evidence-refs:
  - "standard/index.md#five-file-issue-shape"
  - "standard/issue-format.md#package-boundary"
  - "standard/examples/shape-only/i-001-example-issue/index.md"
  - "standard/examples/shape-only-extra-entry/extra.md"
classification-rationale: "US-01 is satisfied: the front door and package contract require exactly the five named regular aspect files, with distinct responsibilities and no symlink, subdirectory, or extra entry; conforming and extra-entry documentary fixtures provide direct inspection proof of the shape."
status: "satisfied"
required-test-refs:
  - ".arca/goal/test-list.md#verification — T-001"
