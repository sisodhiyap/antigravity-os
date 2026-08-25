/**
 * Antigravity Production-Grade Adaptive Harness - Permission Model
 * Enforces least privilege + Child Permission Inheritance (child permissions <= parent permissions).
 */

import { AgentRole, AgentPermissions } from './types.js';

export class PermissionModelManager {
  private rolePolicies: Record<AgentRole, AgentPermissions> = {
    orchestrator: {
      role: 'orchestrator',
      allowedTools: ['classify', 'delegate', 'synthesize', 'view_file', 'list_dir', 'grep_search'],
      allowWriteAccess: false,
      allowSpawnSubagent: true,
      maxToolCalls: 10
    },
    researcher: {
      role: 'researcher',
      allowedTools: ['grep_search', 'view_file', 'list_dir', 'search_web', 'read_url_content'],
      allowWriteAccess: false,
      allowSpawnSubagent: false,
      maxToolCalls: 8
    },
    builder: {
      role: 'builder',
      allowedTools: ['view_file', 'write_to_file', 'replace_file_content', 'multi_replace_file_content', 'run_command'],
      allowWriteAccess: true,
      allowSpawnSubagent: false,
      maxToolCalls: 15
    },
    reviewer: {
      role: 'reviewer',
      allowedTools: ['view_file', 'grep_search', 'run_command'],
      allowWriteAccess: false,
      allowSpawnSubagent: false,
      maxToolCalls: 5
    },
    security: {
      role: 'security',
      allowedTools: ['view_file', 'grep_search'],
      allowWriteAccess: false,
      allowSpawnSubagent: false,
      maxToolCalls: 5
    },
    tester: {
      role: 'tester',
      allowedTools: ['view_file', 'run_command'],
      allowWriteAccess: false,
      allowSpawnSubagent: false,
      maxToolCalls: 6
    },
    architect: {
      role: 'architect',
      allowedTools: ['view_file', 'grep_search', 'list_dir'],
      allowWriteAccess: false,
      allowSpawnSubagent: false,
      maxToolCalls: 6
    }
  };

  public getPermissions(role: AgentRole, parentRole?: AgentRole): AgentPermissions {
    const base = this.rolePolicies[role] || this.rolePolicies.builder;

    if (!parentRole) {
      return base;
    }

    // Phase 41: Child Permission Inheritance (child permissions <= parent permissions)
    const parent = this.rolePolicies[parentRole] || this.rolePolicies.orchestrator;
    const inheritedTools = base.allowedTools.filter((t) => parent.allowedTools.includes(t));
    const allowWrite = base.allowWriteAccess && parent.allowWriteAccess;

    return {
      role,
      allowedTools: inheritedTools.length > 0 ? inheritedTools : base.allowedTools.slice(0, 2),
      allowWriteAccess: allowWrite,
      allowSpawnSubagent: false, // Children can never spawn subagents
      maxToolCalls: Math.min(base.maxToolCalls, parent.maxToolCalls),
      parentRole
    };
  }

  public validateAccess(role: AgentRole, toolName: string, isWriteOperation = false, parentRole?: AgentRole): boolean {
    const policy = this.getPermissions(role, parentRole);
    if (isWriteOperation && !policy.allowWriteAccess) return false;
    return policy.allowedTools.includes(toolName);
  }
}

export const permissionModelManager = new PermissionModelManager();
