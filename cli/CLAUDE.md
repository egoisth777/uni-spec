# uni-spec CLI (`cli/`)

Implements the executable contracts of the uni-spec standard. The standard at
`../standard/` is the single source of truth; this package obeys it and never
redefines it. Technical baseline: TypeScript, ESM, NodeNext, Node >= 20.19.

## Layout

- `bin/uni-spec.js` — shim; loads `dist/cli.js`. The only published entry.
- `src/cli.ts` — commander program (`uni-spec`); registers commands.
- `src/commands/` — CLI wiring only; no rule logic.
- `src/core/` — pure logic. `core/issue/` maps to the standard's contracts.
- `test/` — `t-<nnn>-<name>.vitest.test.ts`, one contract per file.

## Rules

- Templates are read at runtime from `../standard/templates/issue/`; never
  copy template bytes into this package (they would drift from the standard).
- Every lint behavior traces to a `LINT-xx` rule in `../standard/lint.md`.
  Collection walking is CLI convenience, not a new rule — it only fans out the
  single-package linter.
- Run tests with `pnpm test` (builds first: t-024+ spawn the real binary).
- Dependencies: `commander` only. Justify before adding anything.
- `dist/` and `node_modules/` are build artifacts; never commit them.
