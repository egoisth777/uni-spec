/**
 * Command Generator
 *
 * Functions for generating command files using tool adapters.
 */

import type { CommandContent, ToolCommandAdapter, GeneratedCommand } from './types.js';
import type { ShellPolicyContext } from '../shared/allowed-tools.js';

/**
 * Generate a single command file using the provided adapter.
 * @param content - The tool-agnostic command content
 * @param shellContext - Optional target platform and explicit shell requirements
 * @returns Generated command with path and file content
 */
export function generateCommand(
  content: CommandContent,
  adapter: ToolCommandAdapter,
  shellContext?: ShellPolicyContext,
): GeneratedCommand {
  return {
    path: adapter.getFilePath(content.id),
    fileContent: adapter.formatFile(content, shellContext),
  };
}

/**
 * Generate multiple command files using the provided adapter.
 * @param contents - Array of tool-agnostic command contents
 * @param adapter - The tool-specific adapter
 * @param shellContext - Optional target platform and explicit shell requirements
 * @returns Array of generated commands with paths and file contents
 */
export function generateCommands(
  contents: CommandContent[],
  adapter: ToolCommandAdapter,
  shellContext?: ShellPolicyContext,
): GeneratedCommand[] {
  return contents.map((content) => generateCommand(content, adapter, shellContext));
}
