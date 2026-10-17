import { program } from 'commander';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  ISSUE_ASPECT_FILES,
  scaffoldIssue,
  type ScaffoldedIssue,
} from '../core/issue/scaffold.js';
import {
  type GoalObservation,
  type LintFinding,
  type LintReport,
  lintIssue,
  observeGoal,
  observeIssue,
} from '../core/issue/lint.js';
import {
  classifyLintTarget,
  lintCollection,
  type CollectionLintResult,
} from '../core/issue/collection.js';
import {
  readIssueStatusReport,
  type IssueStatusReport,
} from '../core/issue/status.js';

interface NewIssueOptions {
  in?: string;
  origin?: string;
  json?: boolean;
}

interface LintIssueOptions {
  goal?: string;
  json?: boolean;
}

interface StatusIssueOptions {
  json?: boolean;
}

/**
 * Walk up from the working directory for an existing `.arca/<name>` folder.
 *
 * The standard delegates the collection location to the caller, so this only
 * ever honours a layout already on disk; it never creates one. Walking up
 * rather than checking only the working directory is what stops a command run
 * from a subdirectory of a repository from starting a second, competing issue
 * collection beside the caller instead of using the one that exists.
 */
function findArcaDirectory(name: string): string | undefined {
  let current = process.cwd();
  for (;;) {
    const candidate = path.join(current, '.arca', name);
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

/**
 * The target folder's parent defines the issue collection. An explicit `--in`
 * always wins; otherwise an existing `.arca/issue` is the collection, and a
 * repository without one falls back to the working directory.
 */
function resolveParentDirectory(option?: string): string {
  if (option !== undefined) return path.resolve(option);
  return findArcaDirectory('issue') ?? process.cwd();
}

/**
 * A relative argument ordinarily resolves from the current directory. When an
 * author names an existing collection member from elsewhere in the project,
 * fall back to the discovered collection without creating or changing it.
 */
function resolveStatusTarget(target?: string): string {
  if (target === undefined) return process.cwd();

  const direct = path.resolve(target);
  if (path.isAbsolute(target) || existsSync(direct)) return direct;

  const collection = findArcaDirectory('issue');
  return collection === undefined ? direct : path.join(collection, target);
}

function reportHuman(created: ScaffoldedIssue): void {
  const relative = path.relative(process.cwd(), created.directory) || '.';
  console.log(`Created issue ${created.identity.issueId} in ${relative}`);
  for (const file of ISSUE_ASPECT_FILES) {
    console.log(`  ${file}`);
  }
  console.log('');
  console.log(
    'The package is a scaffold, so it does not pass lint yet. Fill each'
  );
  console.log('placeholder marked with angle brackets, then run:');
  // Print the path relative to where the caller stands, not the bare folder
  // name: the collection can sit above the working directory, and a next-step
  // command that does not resolve from here is worse than none.
  console.log(`  uni-spec issue lint ${relative}`);
  if (created.originPending) {
    console.log('');
    console.log(
      'No source reference was supplied, so `origin` still holds its'
    );
    console.log(
      'placeholder. Re-run with --origin, or fill it in by hand; a source'
    );
    console.log('reference is never invented for you.');
  }
}

/** Render the status model without leaking inherited workflow vocabulary. */
function reportStatusHuman(report: IssueStatusReport): void {
  console.log(`Lifecycle: ${report.lifecycle}`);
  console.log(
    `Progress: ${String(report.completedAspects)}/${String(
      report.totalAspects
    )} aspects complete`
  );
  console.log('');

  for (const artifact of report.artifacts) {
    let detail = '';
    if (artifact.state === 'blocked') {
      detail = ` (blocked by: ${artifact.missingDependencies.join(', ')})`;
    } else if (artifact.requires.length === 0) {
      detail = ' (requires: nothing)';
    } else if (artifact.state === 'ready') {
      detail = ` (requires: ${artifact.requires.join(', ')})`;
    }
    console.log(`${artifact.id}: ${artifact.state}${detail}`);
  }
}

/**
 * Print one finding in the order `standard/lint.md` fixes for its fields, so a
 * reader sees what was observed before what to do about it.
 */
function reportFinding(finding: LintFinding): void {
  const at =
    finding.line === null
      ? finding.path
      : `${finding.path}:${String(finding.line)}`;
  console.log(`${finding.ruleId}  ${at}`);
  console.log(`  observed:    ${finding.observed}`);
  console.log(`  expected:    ${finding.expected}`);
  console.log(`  remediation: ${finding.remediation}`);
  console.log('');
}

function reportLintHuman(report: LintReport, target: string): void {
  const relative = path.relative(process.cwd(), target) || '.';
  if (report.result === 'PASS') {
    console.log(`PASS  ${relative}`);
    console.log(
      `All ${String(report.evaluatedRules.length)} rules evaluated; no findings.`
    );
    return;
  }

  console.log(`FAIL  ${relative}`);
  console.log(
    `All ${String(report.evaluatedRules.length)} rules evaluated; ` +
      `${String(report.findings.length)} finding(s).`
  );
  console.log('');
  for (const finding of report.findings) reportFinding(finding);
}

/**
 * One line per passing package, full findings for failing ones, then a
 * summary. The reader scans for FAIL lines instead of paging through every
 * clean report.
 */
function reportCollectionHuman(result: CollectionLintResult): void {
  const relativeRoot = path.relative(process.cwd(), result.root) || '.';
  if (result.packages.length === 0) {
    console.log(`FAIL  ${relativeRoot}`);
    console.log('No issue packages found in this collection.');
    return;
  }

  for (const { directory, report } of result.packages) {
    const relative = path.relative(process.cwd(), directory) || '.';
    if (report.result === 'PASS') {
      console.log(`PASS  ${relative}`);
    } else {
      console.log(`FAIL  ${relative}`);
      console.log('');
      for (const finding of report.findings) reportFinding(finding);
    }
  }

  const passed = result.packages.filter(
    (entry) => entry.report.result === 'PASS'
  ).length;
  console.log('');
  console.log(
    `${String(passed)}/${String(result.packages.length)} package(s) pass.`
  );
}

export function registerIssueCommand(rootProgram: typeof program) {
  const issueCommand = rootProgram
    .command('issue')
    .description('Create and inspect uni-spec issue packages');

  issueCommand
    .command('new [title...]')
    .description(
      'Scaffold one issue package: one directory, exactly five aspect files'
    )
    .option(
      '--in <dir>',
      'Directory the issue folder is created inside (defaults to .arca/issue when present, else the current directory)'
    )
    .option('--origin <reference>', 'Actual source reference for index.md')
    .option('--json', 'Output as JSON')
    .action((titleWords: string[], options: NewIssueOptions) => {
      try {
        const title = titleWords.join(' ').trim();
        const parent = resolveParentDirectory(options.in);

        const created = scaffoldIssue({
          parentDirectory: parent,
          ...(title.length > 0 ? { title } : {}),
          ...(options.origin !== undefined ? { origin: options.origin } : {}),
        });

        if (options.json) {
          console.log(
            JSON.stringify(
              {
                issueId: created.identity.issueId,
                number: created.identity.number,
                slug: created.identity.slug,
                directory: created.directory,
                files: created.files,
                originPending: created.originPending,
              },
              null,
              2
            )
          );
          return;
        }

        reportHuman(created);
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        process.exitCode = 1;
      }
    });

  issueCommand
    .command('status [target]')
    .description(
      'Report lifecycle and five-aspect progress without modifying an issue package'
    )
    .option('--json', 'Output the read-only status report as JSON')
    .action((target: string | undefined, options: StatusIssueOptions) => {
      try {
        const report = readIssueStatusReport(resolveStatusTarget(target));
        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
          return;
        }
        reportStatusHuman(report);
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        process.exitCode = 1;
      }
    });

  issueCommand
    .command('lint [target]')
    .description(
      'Check an issue package - or every package in a collection - against LINT-01 through LINT-07'
    )
    .option(
      '--goal <dir>',
      'Goal root whose five documents LINT-07 inspects (defaults to .arca/goal when present)'
    )
    .option('--json', 'Output the finding trace as JSON')
    .action((target: string | undefined, options: LintIssueOptions) => {
      try {
        // A bare `lint` inspects the discovered collection, not the working
        // directory: the collection is where the packages live.
        const lintTarget = path.resolve(
          target ?? findArcaDirectory('issue') ?? process.cwd()
        );
        const goalRoot =
          options.goal === undefined
            ? findArcaDirectory('goal')
            : path.resolve(options.goal);
        const goal =
          goalRoot === undefined ? undefined : observeGoal(goalRoot);

        if (classifyLintTarget(lintTarget) === 'collection') {
          const result = lintCollection(lintTarget, goal);
          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
          } else {
            reportCollectionHuman(result);
          }
          // C-008: zero exit on PASS, non-zero on any finding.
          if (result.result === 'FAIL') process.exitCode = 1;
          return;
        }

        const report = lintIssue({
          issue: observeIssue(lintTarget),
          ...(goal === undefined ? {} : { goal }),
        });

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          reportLintHuman(report, lintTarget);
        }

        // C-008: zero exit on PASS, non-zero on any finding.
        if (report.result === 'FAIL') process.exitCode = 1;
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        process.exitCode = 1;
      }
    });
}
