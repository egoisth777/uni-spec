/**
 * Template source for scaffolding: the standard's own template folder.
 *
 * The standard owns the template bytes (`standard/templates/issue/`). This
 * loader reads them straight from that folder so the CLI can never carry a
 * second copy that drifts from the document it claims to implement. No schema
 * registry, no discovery: one known directory, overridable for tests.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The standard's template folder, resolved relative to this module.
 *
 * `cli/src/core` and `cli/dist/core` are both exactly three hops below the
 * repository root, so the same relative walk works under vitest (running
 * `src/`) and for the built CLI (running `dist/`).
 */
export const DEFAULT_TEMPLATE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
  'standard',
  'templates',
  'issue'
);

/** Reads one aspect-file template, byte-for-byte. */
export function loadIssueTemplate(
  file: string,
  templateDir: string = DEFAULT_TEMPLATE_DIR
): string {
  return readFileSync(path.join(templateDir, file), 'utf-8');
}
