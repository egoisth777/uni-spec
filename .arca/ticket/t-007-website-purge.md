---
ticket-id: "t-007-website-purge"
residual-ids:
  - "residual-us-08"
behavior-refs:
  - ".arca/goal/spec.md#integrated-issue-requirements (US-08)"
  - ".arca/goal/test-list.md#verification (T-008)"
design-refs:
  - ".arca/goal/design.md#integrated-sanitation-mapping"
planned-test-refs:
  - "PT-007"
dependencies:
  - "none"
status: "done"
---

# Ticket: t-007-website-purge

## Vertical slice

Audit every entry under `website/`, classify each as inherited OpenSpec material or directly required by `standard/`/`.arca/`, remove the tree only when the evidence supports residue, and record the resulting tree and link checks. Do not alter `.arca/current/` while executing the slice.

## P4 Apparent Test Plan

| Apparent Test ID | Goal Contract Ref | Fixture Ref | Executable Target | Oracle |
| ---------------- | ----------------- | ----------- | ----------------- | ------ |
| `PT-007` | `.arca/goal/spec.md#integrated-issue-requirements` (`US-08`) | `website/` and retained `standard/`, `.arca/` | `repository-audit PT-007` | Every website entry has a recorded decision; confirmed residue is absent and retained artifacts remain reachable. |

## P5 Hidden Test Public Coverage Manifest

| Lane | Assessment | Rationale | Hidden IDs |
| ---- | ---------- | --------- | ---------- |
| `Regression` | covered | Re-audit catches a website path left behind. | `PT-007-H1` |
| `Input/Routing` | covered | Candidate classification includes links from retained trees. | `PT-007-H2` |
| `Lifecycle/Model` | covered | Evidence precedes deletion and status remains auditable. | `PT-007-H3` |
| `Durability/Recovery` | covered | Ambiguous dependency retains the path rather than guessing. | `PT-007-H4` |
| `Output/Filesystem` | covered | Final tree proves website removal or documented retention. | `PT-007-H5` |
| `Cross-Feature` | covered | Slice checks standard/.arca preservation with website absence. | `PT-007-H6` |

| Hidden ID | Goal Contract Ref | Derivation | Category | Oracle | Owner |
| --------- | ----------------- | ---------- | -------- | ------ | ----- |
| `PT-007-H1` | `.arca/goal/spec.md#integrated-issue-requirements` | Leave one nested website entry. | `Regression` | Audit fails. | `purge-maintainer` |
| `PT-007-H2` | `.arca/goal/design.md#integrated-sanitation-mapping` | Add a retained-tree reference to website. | `Input/Routing` | Retain or repair is required. | `purge-maintainer` |
| `PT-007-H3` | `.arca/goal/spec.md#integrated-issue-requirements` | Delete before recording classification. | `Lifecycle/Model` | Evidence gate fails. | `purge-maintainer` |
| `PT-007-H4` | `.arca/goal/design.md#integrated-sanitation-mapping` | Use an ambiguous dependency. | `Durability/Recovery` | Candidate is retained and question recorded. | `purge-maintainer` |
| `PT-007-H5` | `.arca/goal/test-list.md#verification` | Compare before/after tree. | `Output/Filesystem` | Website is absent or explicitly retained. | `purge-maintainer` |
| `PT-007-H6` | `.arca/goal/spec.md#integrated-issue-requirements` | Check standard and .arca routes after removal. | `Cross-Feature` | Retained artifacts still pass. | `purge-maintainer` |

## PT-007 Execution Record

The planned check maps to `test/website-purge.test.ts`:
`repository-audit PT-007 > removes the audited website residue while preserving required routes`.
It asserts that `website/` is absent and that both `standard/` and `.arca/` remain reachable.

### Inventory and disposition

Every tracked file present under `website/` was inspected before deletion. The site was a standalone Next.js/Fumadocs application, and its package metadata, README, build scripts, generated-document sync, route tree, and Cloudflare worker all described and implemented an OpenSpec documentation website. No file was directly required by `standard/` or `.arca/`; all entries are confirmed inherited website residue and were purged:
The observed directory entries were `website/`, `app/`, `app/(home)/`, `app/api/`, `app/api/search/`, `app/docs/`, `app/docs/[[...slug]]/`, `app/llms-full.txt/`, `app/llms.mdx/`, `app/llms.mdx/docs/`, `app/llms.mdx/docs/[[...slug]]/`, `app/llms.txt/`, `app/og/`, `app/og/docs/`, `app/og/docs/[...slug]/`, `cloudflare/`, `cloudflare/router/`, `components/`, `lib/`, and `scripts/`; these were containers for the classified files and were purged with them.

| Entry | Evidence and decision |
| --- | --- |
| `website/.gitignore` | Site-local generated-output ignore rules; purge. |
| `website/README.md` | OpenSpec documentation-site, Fumadocs, Next.js, Cloudflare, and `openspec.dev` instructions; purge. |
| `website/package.json` | `@fission-ai/openspec-website` package with Next.js/Fumadocs dependencies; purge. |
| `website/pnpm-lock.yaml` | Lockfile for the standalone website package; purge. |
| `website/next.config.mjs` | Next.js static-export configuration; purge. |
| `website/postcss.config.mjs` | Website Tailwind/PostCSS build configuration; purge. |
| `website/source.config.ts` | Fumadocs MDX source configuration; purge. |
| `website/tsconfig.json` | Website-only TypeScript configuration; purge. |
| `website/docs.sync.config.mjs` | Website documentation publication manifest; purge. |
| `website/scripts/sync-docs.mjs` | Mirrors repository docs into website content; purge. |
| `website/components/provider.tsx` | Website React provider; purge. |
| `website/components/search.tsx` | Website search UI; purge. |
| `website/components/mdx.tsx` | Website MDX rendering components; purge. |
| `website/lib/layout.shared.tsx` | Website layout/navigation support; purge. |
| `website/lib/shared.ts` | Website branding, URLs, and links; purge. |
| `website/lib/source.ts` | Fumadocs content source; purge. |
| `website/app/layout.tsx` | Website root layout; purge. |
| `website/app/global.css` | Website global styles; purge. |
| `website/app/icon.svg` | Website icon asset; purge. |
| `website/app/robots.ts` | Website crawler route; purge. |
| `website/app/sitemap.ts` | Website sitemap route; purge. |
| `website/app/(home)/layout.tsx` | Website home layout; purge. |
| `website/app/(home)/page.tsx` | Website marketing/documentation landing page; purge. |
| `website/app/docs/layout.tsx` | Website docs layout; purge. |
| `website/app/docs/[[...slug]]/page.tsx` | Website docs catch-all route; purge. |
| `website/app/api/search/route.ts` | Website static search route; purge. |
| `website/app/llms.txt/route.ts` | Website LLM text route; purge. |
| `website/app/llms-full.txt/route.ts` | Website full LLM text route; purge. |
| `website/app/llms.mdx/docs/[[...slug]]/route.ts` | Website MDX LLM route; purge. |
| `website/app/og/docs/[...slug]/route.tsx` | Website Open Graph image route; purge. |
| `website/cloudflare/router/worker.js` | Cloudflare worker routing `openspec.dev/docs`; purge. |
| `website/cloudflare/router/wrangler.jsonc` | Cloudflare configuration for the website worker; purge. |

The pre-mutation PT-007 run failed for the intended semantic reason (`website/` access resolved successfully, proving residue existed), not setup or syntax. After deletion, the same test is the link check for the retained `standard/` and `.arca/` routes.
