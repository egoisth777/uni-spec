/**
 * Platform context used while rendering generated shell guidance.
 */
export interface ShellPolicyContext {
  platform?: NodeJS.Platform;
  retryAfterFailure?: boolean;
  unixRequiredReason?: string;
}

/**
 * Resolved shell choice shared by generated skills and command adapters.
 */
export interface ShellPolicy {
  platform: NodeJS.Platform;
  shell: 'bash' | 'pwsh';
  allowedTools: string;
  guidance: string;
}

const BASH_ALLOWED_TOOLS = 'Bash(openspec:*)';
const POWERSHELL_ALLOWED_TOOLS = 'pwsh(openspec:*)';

/**
 * Resolves the shell policy for generated guidance.
 *
 * Windows uses pwsh for ordinary work and retries. Bash is selected only
 * when the operation carries a non-empty, explicit Bash/Unix requirement.
 */
export function resolveShellPolicy(context: ShellPolicyContext = {}): ShellPolicy {
  const platform = context.platform ?? process.platform;
  const unixRequiredReason = context.unixRequiredReason?.trim();

  if (unixRequiredReason) {
    return {
      platform,
      shell: 'bash',
      allowedTools: BASH_ALLOWED_TOOLS,
      guidance: `Shell policy exception: Use Bash because this operation explicitly requires a Bash/Unix environment: ${unixRequiredReason}`,
    };
  }

  if (platform === 'win32') {
    const retryGuidance = context.retryAfterFailure
      ? ' After a failed shell attempt, retry with pwsh; never fall back to Bash.'
      : ' Never fall back to Bash.';

    return {
      platform,
      shell: 'pwsh',
      allowedTools: POWERSHELL_ALLOWED_TOOLS,
      guidance: `Windows shell policy: Use pwsh with PowerShell-native syntax.${retryGuidance}`,
    };
  }

  return {
    platform,
    shell: 'bash',
    allowedTools: BASH_ALLOWED_TOOLS,
    guidance: '',
  };
}

/**
 * Renders portable workflow command fences for the resolved shell policy.
 *
 * Ordinary workflow snippets use commands that are valid in both shells.
 * A Bash-specific operation must instead provide unixRequiredReason, which
 * preserves its Bash fence and makes the exception visible.
 */
export function renderShellCodeFences(
  content: string,
  context: ShellPolicyContext = {},
): string {
  if (resolveShellPolicy(context).shell !== 'pwsh') return content;
  return content.replace(/```bash\b/gi, '```powershell');
}
