# Residual: residual-us-20

```yaml
residual-id: "residual-us-20"
goal-requirement-ref: "US-20"
frozen-goal-bundle-revision: "HEAD badbfd65c1452dd7f71d2415ac4e4e7ce4ca2d68; ordered goal index.md, ubi-lang.md, spec.md, design.md, test-list.md filename-NUL-content SHA-256 53110161fb9cabf775f9d5706a28b6987e58f3a5a738f572476c820bc64170c7"
implementation-revision: "t-019 P5 working tree based on HEAD badbfd65c1452dd7f71d2415ac4e4e7ce4ca2d68; post-sweep link-normalized ordered goal bundle SHA-256 6d98e0f8746634e088d2ee56435b6e81f27b9174b2034ea7007e8156896e5521 (uncommitted as requested)"
concrete-evidence-refs:
  - ".arca/index.md#end-of-loop-cleanup-and-owner-archives (selection by terminal status alone regardless of loop, the live collection remainder, and live-or-archived resolution of retention, preservation, and census checks)"
  - ".arca/issue/archive/ (i-001-purge-sanitization and i-002-selective-cli-recovery joined i-003 and i-004; the live issue collection holds only the active i-005)"
  - ".arca/residual/archive/ (residual-us-01 .. residual-us-17 joined residual-us-18 and residual-us-19; the live residual collection holds only this active record)"
  - ".arca/ticket/archive/ (t-001 .. t-016 joined t-017 and t-018; the live ticket collection holds only the active t-019)"
  - "test/t-019-terminal-archive-sweep.test.mjs (8 checks: governance wording, the live collection remainder against active_refs, the exact legacy archive set, location-independent retention and census, full Markdown link resolution, an isolated two-loop sweep that protects active and nonterminal records, a zero-move second sweep, and rejection of an archive overwrite)"
  - "test/t-015-purge-preservation.test.mjs (retention proof now resolves the recovery issue files live-or-archived and censuses residuals and tickets across live plus archived records, so the sweep is not observable as loss)"
  - "Verification run: node --test test/*.test.mjs 46/46, vitest 1/1, tsc --noEmit clean, node build.js clean"
classification-rationale: "satisfied: governance now selects relocation by terminal status alone across every collection and loop and defines the live collection remainder plus live-or-archived resolution; the 35 legacy terminal records were relocated as one operation with 7 documents link-repaired and every Markdown route still resolving; executable PT-019 proves the repository state, the multi-loop fixture sweep, active-record protection, idempotency, and duplicate rejection; the historical purge proof was made location-independent rather than weakened."
status: "satisfied"
required-test-refs:
  - "T-020"
  - "PT-019"
```

Forward authority: `.arca/goal/spec.md` integrated repository-wide terminal archive requirement (`US-20`). Reverse sources: `.arca/issue/i-005-terminal-archive-sweep/spec.md` (`R-001`, `R-002`, `R-003`).
