# Residual: residual-us-18

```yaml
residual-id: "residual-us-18"
goal-requirement-ref: "US-18"
frozen-goal-bundle-revision: "HEAD badbfd65c1452dd7f71d2415ac4e4e7ce4ca2d68; ordered goal index, ubi, spec, design, test-list filename-NUL-content SHA-256 e6f2601b5d5cdd966baa1d2c8e81685fe759522acb4fe87c55636401fbf516ef"
implementation-revision: "t-017 P5 working tree based on HEAD badbfd65c1452dd7f71d2415ac4e4e7ce4ca2d68 (uncommitted as requested)"
concrete-evidence-refs:
  - "src/core/shared/allowed-tools.ts (typed resolveShellPolicy plus centralized renderShellCodeFences select pwsh/PowerShell fences on ordinary Windows and gate Bash on a non-empty explicit Bash/Unix reason)"
  - "src/core/shared/skill-generation.ts (ShellPolicyContext propagates through getSkillTemplates, getCommandTemplates, and getCommandContents into platform-aware factories and portable body rendering)"
  - "src/core/command-generation/types.ts, generator.ts, and adapters/claude.ts and oh-my-pi.ts (one context drives shared Windows pwsh, retry, no-fallback, and explicit-exception guidance)"
  - "src/core/templates/workflows/archive-change.ts, bulk-archive-change.ts, and onboard.ts (platform-aware PowerShell-native Windows examples with non-Windows Bash compatibility)"
  - "src/core/templates/workflows/new-change.ts, continue-change.ts, update-change.ts, ff-change.ts, and propose.ts (artifact placeholder arguments are quoted in both skill and command variants, valid in generated PowerShell and Bash blocks)"
  - "test/t-017-windows-powershell-guidance.test.mjs (PT-017: 9/9 passed, including all 12 real aggregate workflows and a focused assertion that Windows PowerShell blocks contain no unquoted angle-bracket argument tokens while Linux retains Bash output)"
  - "test/t-015-purge-preservation.test.mjs and test/t-016-reproducible-recovery-proof.test.mjs (14/14 passed with recorded freeze marker and first-persisted-bundle revision binding)"
  - ".arca/ticket/archive/t-017-windows-powershell-guidance.md#p5-verification-evidence (typecheck, build, full suite, built-output generation smoke, and diff check passed)"
  - "repository source inspection and PT-017 found no gpt-sol or gpt-luna identity branch"
classification-rationale: "satisfied: one shared typed resolver and centralized workflow-fence renderer select and pre-approve pwsh with PowerShell-native syntax for ordinary Windows operations and failed-attempt retries, explicitly forbid Bash fallback, permit Bash only for a non-empty emitted Bash/Unix requirement reason, preserve Linux/POSIX behavior, keep aggregate template bodies consistent across all 12 workflows, and quote angle-bracket artifact placeholder arguments so all generated Windows PowerShell blocks parse successfully."
status: "satisfied"
required-test-refs:
  - "T-018"
  - "PT-017"
```

Forward authority: `.arca/goal/spec.md` integrated issue requirement (`US-18`). Reverse source: `.arca/issue/archive/i-003-windows-powershell-preference/spec.md` (`R-001`).
