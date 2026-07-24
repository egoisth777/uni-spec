import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagePath = path.join(root, 'package.json');
const lockPath = path.join(root, 'pnpm-lock.yaml');
const evidencePath = path.join(root, '.arca', 'io', 't-013-package-build-closure.json');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function sourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith('.ts')) files.push(entryPath);
  }
  return files;
}

function externalModules() {
  const builtins = new Set([
    'assert', 'child_process', 'crypto', 'fs', 'module', 'os', 'path', 'readline',
    'stream', 'url', 'util',
  ]);
  const modules = new Set();
  const references = [];
  for (const file of sourceFiles(path.join(root, 'src'))) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      let statement = lines[index];
      if (/^\s*import\b/.test(statement)) {
        while (!statement.includes(';') && index + 1 < lines.length) statement += `\n${lines[++index]}`;
        const staticImport = statement.match(/\bfrom\s*['"]([^'"]+)['"]/);
        if (staticImport) references.push({ file, specifier: staticImport[1] });
      }
      const dynamicImports = lines[index].matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g);
      for (const match of dynamicImports) references.push({ file, specifier: match[1] });
      const requires = lines[index].matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      for (const match of requires) references.push({ file, specifier: match[1] });
    }
  }
  for (const reference of references) {
    const { specifier, file } = reference;
    if (specifier.startsWith('.') || specifier.startsWith('node:')) continue;
    const packageName = specifier.startsWith('@')
      ? specifier.split('/').slice(0, 2).join('/')
      : specifier.split('/')[0];
    if (builtins.has(packageName)) continue;
    modules.add(packageName);
    reference.file = path.relative(root, file).replaceAll('\\', '/');
    reference.packageName = packageName;
  }
  return { modules: [...modules].sort(), references };
}

function lockImporter(lock) {
  const normalized = lock.replaceAll('\r\n', '\n');
  const importer = normalized.match(/importers:\n\n  \.:\n([\s\S]*?)(?=\npackages:)/)?.[1];
  assert.ok(importer, 'pnpm lock must contain the root importer');
  return importer;
}

test('PT-013 package metadata, dependency closure, and build configuration are reproducible', () => {
  assert.equal(existsSync(packagePath), true, 'package.json must be restored');
  assert.equal(existsSync(lockPath), true, 'pnpm-lock.yaml must be restored');
  assert.equal(existsSync(path.join(root, 'tsconfig.json')), true, 'tsconfig.json must be restored');
  assert.equal(existsSync(path.join(root, 'vitest.config.ts')), true, 'Vitest config must be restored');
  assert.equal(existsSync(path.join(root, 'build.js')), true, 'build.js must be restored');

  const pkg = readJson(packagePath);
  assert.equal(pkg.name, 'uni-spec-cli');
  assert.equal(pkg.private, true, 'the recovered package must not publish under upstream identity');
  assert.equal(pkg.packageManager, 'pnpm@9.15.9');
  assert.equal(pkg.bin?.openspec, './bin/openspec.js');
  assert.equal(existsSync(path.join(root, pkg.bin.openspec)), true, 'the declared CLI entrypoint must exist');
  assert.deepEqual(Object.keys(pkg.scripts).sort(), ['build', 'test']);
  assert.equal(pkg.scripts.build, 'node build.js');
  assert.match(pkg.scripts.test, /(?:node --test|vitest run)/);
  assert.deepEqual(Object.keys(pkg.devDependencies ?? {}).sort(), ['@types/node', 'typescript', 'vitest']);
  const vitestConfig = readFileSync(path.join(root, 'vitest.config.ts'), 'utf8');
  assert.doesNotMatch(vitestConfig, /globalSetup|postinstall|release|website|openspec/i);
  assert.doesNotMatch(JSON.stringify(pkg), /@fission-ai\/openspec|changeset|release|website/i);

  const { modules, references } = externalModules();
  const dependencies = Object.keys(pkg.dependencies ?? {}).sort();
  assert.deepEqual(dependencies, modules, `manifest runtime dependencies must equal source closure (${modules.length} external packages)`);
  assert.ok(references.length >= modules.length, 'every external package must have a source reference');

  const lock = readFileSync(lockPath, 'utf8');
  const importer = lockImporter(lock);
  for (const [name, range] of Object.entries(pkg.dependencies ?? {})) {
    const lockKey = name.startsWith('@') ? `'${name}'` : name;
    assert.match(importer, new RegExp(`^      ${lockKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\n`, 'm'), `${name} must be in the lock importer`);
    assert.match(importer, new RegExp(`^        specifier: ${range.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'), `${name} lock specifier must match package.json`);
  }
  for (const name of Object.keys(pkg.devDependencies ?? {})) {
    const lockKey = name.startsWith('@') ? `'${name}'` : name;
    assert.match(importer, new RegExp(`^      ${lockKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\n`, 'm'), `${name} dev dependency must be in the lock importer`);
  }

  const tsconfig = readJson(path.join(root, 'tsconfig.json'));
  assert.equal(tsconfig.compilerOptions.strict, true);
  assert.equal(tsconfig.compilerOptions.rootDir, './src');
  assert.equal(tsconfig.compilerOptions.outDir, './dist');
  assert.deepEqual(tsconfig.include, ['src/**/*']);
  assert.ok(tsconfig.exclude.includes('test'));
  const build = readFileSync(path.join(root, 'build.js'), 'utf8');
  assert.match(build, /typescript\/bin\/tsc/);
  assert.match(build, /rmSync\('dist'|rmSync\("dist"|rmSync\(.*dist/);

  const evidence = readJson(evidencePath);
  assert.equal(evidence.ticket, 't-013-package-build-closure');
  assert.equal(evidence.source?.sourceModuleCount, sourceFiles(path.join(root, 'src')).length);
  assert.deepEqual(evidence.externalImports, modules);
  assert.deepEqual(evidence.manifestRuntimeDependencies, dependencies);
  assert.equal(evidence.packageIdentity.name, pkg.name);
  assert.equal(evidence.packageIdentity.private, true);
  assert.equal(evidence.lock.packageManager, pkg.packageManager);
  assert.equal(evidence.lock.importerConsistent, true);
});

test('PT-013 package and bin behavior expose the retained CLI identity', () => {
  const help = execFileSync(process.execPath, ['bin/openspec.js', '--help'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  const version = execFileSync(process.execPath, ['bin/openspec.js', '--version'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  assert.match(help, /Usage: openspec/);
  assert.match(version.trim(), /^0\.1\.0$/);
  assert.equal(existsSync(path.join(root, 'website')), false);
  assert.equal(existsSync(path.join(root, 'openspec')), false);
});
