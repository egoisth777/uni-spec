/**
 * Claude Code Command Adapter
 *
 * Formats commands for Claude Code following its frontmatter specification.
 */

import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';
import { escapeYamlValue } from '../yaml.js';
import { resolveShellPolicy, type ShellPolicyContext } from '../../shared/allowed-tools.js';

/**
 * Formats a tags array as a YAML array with proper escaping.
 */
function formatTagsArray(tags: string[]): string {
  const escapedTags = tags.map((tag) => escapeYamlValue(tag));
  return `[${escapedTags.join(', ')}]`;
}

/**
 * Claude Code adapter for command generation.
 * File path: .claude/commands/opsx/<id>.md
 * Frontmatter: name, description, allowed-tools, category, tags
 */
export const claudeAdapter: ToolCommandAdapter = {
  toolId: 'claude',

  getFilePath(commandId: string): string {
    return path.join('.claude', 'commands', 'opsx', `${commandId}.md`);
  },

  formatFile(content: CommandContent, shellContext?: ShellPolicyContext): string {
    const shellPolicy = resolveShellPolicy(shellContext);
    const shellGuidance = shellPolicy.guidance ? `${shellPolicy.guidance}\n\n` : '';

    return `---
name: ${escapeYamlValue(content.name)}
description: ${escapeYamlValue(content.description)}
allowed-tools: ${shellPolicy.allowedTools}
category: ${escapeYamlValue(content.category)}
tags: ${formatTagsArray(content.tags)}
---

${shellGuidance}${content.body}
`;
  },
};
