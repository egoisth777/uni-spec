# Residual: residual-us-25

```yaml
residual-id: "residual-us-25"
goal-requirement-ref: "US-25"
frozen-goal-bundle-revision: "HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 25f314c369993de023e820b531542a47a8c6d4293e6f1af53f88fe5b660cc312"
implementation-revision: "t-028 P5 working tree on HEAD 36ba95b68823fcfb34b7c54e091e246aeff04504; cli/ tsc clean and vitest 91/91, root node --test 46/47 with only the t-029-owned PT-013 red."
concrete-evidence-refs:
  - "cli/src/core/standard/boundary.ts - digestStandardTree walks standard/ in sorted order and records a SHA-256 over the exact bytes of every file under a standard/-relative POSIX key, recording `not-a-regular-file` where a symlink or device sits in a document's place instead of silently following it"
  - ".arca/io/standard-boundary-manifest.json - frozen evidence pinning all 127 files under standard/, 119 Markdown and 8 JSON, with the requirement, check, ticket, and algorithm recorded alongside"
  - "cli/src/core/standard/boundary.ts checkStandardBoundary - reads the frozen manifest from disk and reports one message per divergence naming the file: an unmanifested addition, a moved digest, or a manifested file missing from disk"
  - "cli/src/core/standard/boundary.ts readStandardManifest - a missing, unparseable, or wrongly shaped manifest throws with the manifest named, so the guard can never pass when its own evidence is gone"
  - "cli/test/t-028-standard-boundary-guard.vitest.test.ts - PT-028-a manifest covers every file exactly once with matching digests and inspecting the tree changes nothing on disk; PT-028-b an edited document fails and names the file; PT-028-c zero LINT-07 findings against the five real goal documents; PT-028-d the corpus really does contain CLI, runtime, and dependency and really does hold five documents, so PT-028-c cannot pass on absence; PT-028-e a converter requirement regressed under US-05 still produces exactly one finding at a goal-relative path; PT-028-f the manifest covers the JSON traces and templates/issue/ and an unmanifested addition fails; PT-028-g absent, corrupt, and wrongly shaped manifests all throw naming the manifest; PT-028-h a manifested file deleted from disk is reported"
  - "Detector proof against the real tree, not only a temp copy: appending one normative sentence to standard/lint.md turned 3 of the 8 checks red, and byte-exact restore returned all 8 to green with PT-028-a's digest comparison confirming the restore"
classification-rationale: "satisfied: both obligations are executable. Obligation 1 is a change detector rather than a prose classifier, which is what US-25 actually needs - an unreviewed normative addition to standard/ can no longer land silently, because the digest manifest is frozen evidence read from disk and compared, never recomputed at check time. The mutation cases compare a throwaway copy against the committed manifest, so a self-satisfying recomputation would fail them. Obligation 2 re-applies the LINT-07 that t-027 corrected and requires zero findings across US-01..US-12, with the word-presence and document-count guard keeping that zero from being vacuous."
status: "satisfied"
required-test-refs:
  - "T-025"
  - "PT-028"
```

Forward authority: [`US-25`](../../goal/spec.md#integrated-uni-spec-applier-requirements); [docs-only boundary](../../goal/design.md#docs-only-boundary); check [`T-025`](../../goal/test-list.md#verification). Reverse source: [`R-008`](../../issue/archive/i-006-uni-spec-issue-generation/spec.md#source-requests). Closed by [`t-028`](../../ticket/archive/t-028-standard-boundary-guard.md).
