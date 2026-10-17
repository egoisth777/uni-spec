/**
 * Docs-only boundary guard for `standard/`.
 *
 * `US-25` keeps the shipped standard documentary: no normative implementation
 * requirement may land in it. Prose cannot be classified reliably, so this
 * guard makes an unreviewed change impossible to land silently instead. Every
 * file under `standard/` is pinned by digest in a manifest under `.arca/io/`,
 * and any drift between disk and manifest is a failure that names the file.
 *
 * The manifest is frozen evidence, never a recomputation: the guard reads it
 * from disk and compares, so a change that forgets to update it fails.
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Repository-relative location of the frozen digest evidence. */
export const MANIFEST_RELATIVE_PATH = path.join(
  '.arca',
  'io',
  'standard-boundary-manifest.json',
);

/** Frozen per-file evidence: repository-relative POSIX path to SHA-256. */
export interface StandardManifest {
  readonly files: Readonly<Record<string, string>>;
}

/**
 * Every regular file under `root`, keyed by its `standard/`-relative POSIX
 * path. Keys are dynamic and the caller needs `.size` and iteration, so this
 * is a `Map` rather than a lookup table.
 */
export function digestStandardTree(root: string): Map<string, string> {
  const digests = new Map<string, string>();

  const walk = (directory: string): void => {
    // Sorted so the manifest is byte-stable across platforms and runs.
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    )) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      const relativePath = path.relative(root, absolute).split(path.sep).join('/');
      // A symlink or device where a document belongs is itself a boundary
      // change, so record its kind rather than silently following it.
      digests.set(
        relativePath,
        entry.isFile()
          ? createHash('sha256').update(readFileSync(absolute)).digest('hex')
          : 'not-a-regular-file',
      );
    }
  };

  walk(root);
  return digests;
}

/**
 * Read the frozen manifest. A missing, unparseable, or wrongly shaped manifest
 * throws with the manifest named: a guard that passes when its own evidence is
 * gone proves nothing.
 */
export function readStandardManifest(manifestPath: string): StandardManifest {
  const name = path.basename(manifestPath);

  let raw: string;
  try {
    raw = readFileSync(manifestPath, 'utf8');
  } catch {
    throw new Error(`${name} is missing or unreadable at ${manifestPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${name} is not parseable JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
    );
  }

  const files = (parsed as { files?: unknown } | null)?.files;
  if (typeof files !== 'object' || files === null || Array.isArray(files)) {
    throw new Error(`${name} must hold a "files" object mapping each path to its digest`);
  }
  for (const [key, value] of Object.entries(files)) {
    if (typeof value !== 'string') {
      throw new Error(`${name} entry ${key} must map to a digest string`);
    }
  }

  return { files: files as Record<string, string> };
}

/**
 * Compare the tree under `root` against frozen evidence. Returns one message
 * per divergence, naming the file; an empty array means the tree is exactly
 * the reviewed one.
 */
export function checkStandardBoundary(root: string, manifest: StandardManifest): string[] {
  const onDisk = digestStandardTree(root);
  const failures: string[] = [];

  for (const [relativePath, digest] of onDisk) {
    const expected = manifest.files[relativePath];
    if (expected === undefined) {
      failures.push(
        `standard/${relativePath} is not in the manifest; add it to ${MANIFEST_RELATIVE_PATH} in the same change that adds the file`,
      );
      continue;
    }
    if (expected !== digest) {
      failures.push(
        `standard/${relativePath} digest changed: manifest ${expected}, disk ${digest}; update ${MANIFEST_RELATIVE_PATH} in the same change and have the edit reviewed`,
      );
    }
  }

  for (const relativePath of Object.keys(manifest.files)) {
    if (!onDisk.has(relativePath)) {
      failures.push(
        `standard/${relativePath} is missing from disk but still manifested in ${MANIFEST_RELATIVE_PATH}`,
      );
    }
  }

  return failures.sort();
}

/** Serialize current disk state as manifest evidence, for deliberate updates. */
export function buildStandardManifest(root: string): StandardManifest {
  return { files: Object.fromEntries(digestStandardTree(root)) };
}
