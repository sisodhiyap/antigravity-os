import { AuthorizationError } from "@/lib/errors";

export type ToolPermissionLevel = "READ" | "WRITE" | "EXECUTE" | "ADMIN";

export interface PermissionContext {
  userId?: string;
  projectId?: string;
  userRole?: "ADMIN" | "USER" | "GUEST" | "SUPER_ADMIN";
  agentRole?: string; // e.g. "BUILDER", "PRODUCT_MANAGER", "QA"
}

export class ToolPermissionEngine {
  private static instance: ToolPermissionEngine;

  private constructor() {}

  public static getInstance(): ToolPermissionEngine {
    if (!ToolPermissionEngine.instance) {
      ToolPermissionEngine.instance = new ToolPermissionEngine();
    }
    return ToolPermissionEngine.instance;
  }

  /**
   * Evaluates access permissions to execution target
   */
  public validateAccess(
    toolName: string,
    category: string,
    action: string,
    context: PermissionContext,
    input: any = {}
  ): void {
    const role = context.userRole || "USER";
    const agent = context.agentRole || "GUEST";

    // 1. Destructive Database Guard
    if (
      toolName.toLowerCase().includes("delete") ||
      toolName.toLowerCase().includes("drop") ||
      toolName.toLowerCase().includes("wipe") ||
      toolName.toLowerCase().includes("truncate")
    ) {
      if (category === "DATABASE" || category === "DEPLOYMENT") {
        throw new AuthorizationError(
          `Execution of destructive operations on target '${toolName}' is strictly BLOCKED by safety policies.`
        );
      }
    }

    // 2. Secret access detection
    if (
      toolName.toLowerCase().includes("secret") ||
      (input.path && (input.path.includes(".env") || input.path.includes("key.env")))
    ) {
      throw new AuthorizationError(
        `Direct read/write access to system secrets in '${toolName}' is strictly BLOCKED.`
      );
    }

    // 3. Capability-based permission mappings
    switch (toolName) {
      case "context_search":
      case "context_extract":
        this.assertPermission(role, ["ADMIN", "USER", "SUPER_ADMIN"], "READ Context7");
        break;

      case "research_fetch":
      case "research_search":
        this.assertPermission(role, ["ADMIN", "USER", "SUPER_ADMIN"], "READ Research");
        break;

      case "sentry_get_issues":
        this.assertPermission(role, ["ADMIN", "USER", "SUPER_ADMIN"], "READ Sentry");
        break;
      case "sentry_resolve_issue":
        this.assertPermission(role, ["ADMIN", "SUPER_ADMIN"], "RESOLVE_ISSUE Sentry");
        break;

      case "browser_navigate":
      case "browser_take_screenshot":
      case "browser_click":
      case "browser_evaluate":
      case "puppeteer_navigate":
      case "puppeteer_screenshot":
        this.assertPermission(agent, ["QA", "BUILDER", "ADMIN", "SUPER_ADMIN"], "EXECUTE_TEST Playwright/Puppeteer");
        break;

      case "chrome_inspect":
      case "chrome_evaluate":
      case "chrome_console_logs":
        this.assertPermission(agent, ["BUILDER", "ADMIN", "SUPER_ADMIN"], "READ+DEBUG Chrome DevTools");
        break;

      case "create_pull_request":
      case "create_or_update_file":
      case "search_repositories":
        this.assertPermission(agent, ["BUILDER", "ADMIN", "SUPER_ADMIN"], "READ+BRANCH+PR GitHub");
        break;

      case "generate_screen_from_text":
      case "create_design_system":
      case "generate_variants":
        this.assertPermission(agent, ["DESIGNER", "BUILDER", "ADMIN", "SUPER_ADMIN"], "CREATE_DESIGN Stitch");
        break;

      case "execute_blender_code":
        this.assertPermission(role, ["ADMIN", "SUPER_ADMIN"], "WORKSPACE_EXECUTE Blender");
        break;

      case "migrate-status":
      case "migrate-dev":
      case "Prisma-Studio":
        this.assertPermission(role, ["ADMIN", "SUPER_ADMIN"], "READ_ONLY/ADMIN Prisma");
        break;

      case "notion_search":
      case "notion_get_page":
      case "notion_create_page":
        this.assertPermission(role, ["ADMIN", "USER", "SUPER_ADMIN"], "READ+CREATE Notion");
        break;

      case "linear_create_issue":
      case "linear_list_issues":
        this.assertPermission(role, ["ADMIN", "USER", "SUPER_ADMIN"], "READ+CREATE_ISSUE Linear");
        break;

      case "n8n_list_workflows":
      case "n8n_execute_workflow":
        this.assertPermission(role, ["ADMIN", "SUPER_ADMIN"], "LIST+EXECUTE n8n workflow");
        break;

      case "create_entities":
      case "read_graph":
      case "search_nodes":
      case "add_observations":
        this.assertPermission(role, ["ADMIN", "USER", "SUPER_ADMIN"], "READ+WRITE_PROJECT_MEMORY Memory");
        break;

      default:
        // Default category validation
        if (category === "DEPLOYMENT" || category === "OBSERVABILITY") {
          this.assertPermission(role, ["ADMIN", "SUPER_ADMIN"], "Production RESTRICTED Operations");
        }
        break;
    }
  }

  private assertPermission(currentRole: string, allowedRoles: string[], action: string): void {
    if (!allowedRoles.includes(currentRole)) {
      throw new AuthorizationError(
        `Role '${currentRole}' is unauthorized for task: ${action}. Required roles: [${allowedRoles.join(", ")}]`
      );
    }
  }
}

export const toolPermissionEngine = ToolPermissionEngine.getInstance();
