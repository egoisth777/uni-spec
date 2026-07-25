/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getUpdateChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxUpdateCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeCommandTemplate,
  type SkillTemplate,
  type CommandTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';
import {
  renderShellCodeFences,
  resolveShellPolicy,
  type ShellPolicyContext,
} from './allowed-tools.js';

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

function renderSkillTemplate(
  template: SkillTemplate,
  shellContext?: ShellPolicyContext,
): SkillTemplate {
  const instructions = renderShellCodeFences(template.instructions, shellContext);
  return instructions === template.instructions ? template : { ...template, instructions };
}

function renderCommandTemplate(
  template: CommandTemplate,
  shellContext?: ShellPolicyContext,
): CommandTemplate {
  const content = renderShellCodeFences(template.content, shellContext);
  return content === template.content ? template : { ...template, content };
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 * @param shellContext - Target platform and explicit shell requirements used to render workflow bodies
 */
export function getSkillTemplates(
  workflowFilter?: readonly string[],
  shellContext?: ShellPolicyContext,
): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: renderSkillTemplate(getExploreSkillTemplate(), shellContext), dirName: 'openspec-explore', workflowId: 'explore' },
    { template: renderSkillTemplate(getNewChangeSkillTemplate(), shellContext), dirName: 'openspec-new-change', workflowId: 'new' },
    { template: renderSkillTemplate(getContinueChangeSkillTemplate(), shellContext), dirName: 'openspec-continue-change', workflowId: 'continue' },
    { template: renderSkillTemplate(getApplyChangeSkillTemplate(), shellContext), dirName: 'openspec-apply-change', workflowId: 'apply' },
    { template: renderSkillTemplate(getUpdateChangeSkillTemplate(), shellContext), dirName: 'openspec-update-change', workflowId: 'update' },
    { template: renderSkillTemplate(getFfChangeSkillTemplate(), shellContext), dirName: 'openspec-ff-change', workflowId: 'ff' },
    { template: renderSkillTemplate(getSyncSpecsSkillTemplate(), shellContext), dirName: 'openspec-sync-specs', workflowId: 'sync' },
    { template: renderSkillTemplate(getArchiveChangeSkillTemplate(shellContext), shellContext), dirName: 'openspec-archive-change', workflowId: 'archive' },
    { template: renderSkillTemplate(getBulkArchiveChangeSkillTemplate(shellContext), shellContext), dirName: 'openspec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: renderSkillTemplate(getVerifyChangeSkillTemplate(), shellContext), dirName: 'openspec-verify-change', workflowId: 'verify' },
    { template: renderSkillTemplate(getOnboardSkillTemplate(shellContext), shellContext), dirName: 'openspec-onboard', workflowId: 'onboard' },
    { template: renderSkillTemplate(getOpsxProposeSkillTemplate(), shellContext), dirName: 'openspec-propose', workflowId: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 * @param shellContext - Target platform and explicit shell requirements used to render workflow bodies
 */
export function getCommandTemplates(
  workflowFilter?: readonly string[],
  shellContext?: ShellPolicyContext,
): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: renderCommandTemplate(getOpsxExploreCommandTemplate(), shellContext), id: 'explore' },
    { template: renderCommandTemplate(getOpsxNewCommandTemplate(), shellContext), id: 'new' },
    { template: renderCommandTemplate(getOpsxContinueCommandTemplate(), shellContext), id: 'continue' },
    { template: renderCommandTemplate(getOpsxApplyCommandTemplate(), shellContext), id: 'apply' },
    { template: renderCommandTemplate(getOpsxUpdateCommandTemplate(), shellContext), id: 'update' },
    { template: renderCommandTemplate(getOpsxFfCommandTemplate(), shellContext), id: 'ff' },
    { template: renderCommandTemplate(getOpsxSyncCommandTemplate(), shellContext), id: 'sync' },
    { template: renderCommandTemplate(getOpsxArchiveCommandTemplate(shellContext), shellContext), id: 'archive' },
    { template: renderCommandTemplate(getOpsxBulkArchiveCommandTemplate(shellContext), shellContext), id: 'bulk-archive' },
    { template: renderCommandTemplate(getOpsxVerifyCommandTemplate(), shellContext), id: 'verify' },
    { template: renderCommandTemplate(getOpsxOnboardCommandTemplate(shellContext), shellContext), id: 'onboard' },
    { template: renderCommandTemplate(getOpsxProposeCommandTemplate(), shellContext), id: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 * @param shellContext - Target platform and explicit shell requirements used to render workflow bodies
 */
export function getCommandContents(
  workflowFilter?: readonly string[],
  shellContext?: ShellPolicyContext,
): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter, shellContext);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OpenSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 * @param shellContext - Optional target platform and explicit shell requirements
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string,
  shellContext?: ShellPolicyContext,
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;
  const shellPolicy = resolveShellPolicy(shellContext);
  const shellGuidance = shellPolicy.guidance ? `${shellPolicy.guidance}\n\n` : '';

  return `---
name: ${template.name}
description: ${template.description}
allowed-tools: ${shellPolicy.allowedTools}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${shellGuidance}${instructions}
`;
}
