import { program } from 'commander';
import { registerIssueCommand } from './commands/issue.js';

export function runCli(): void {
  program
    .name('uni-spec')
    .description(
      'uni-spec: scaffold and lint issue packages against the standard'
    )
    .version('0.1.0');

  registerIssueCommand(program);

  program.parse();
}
