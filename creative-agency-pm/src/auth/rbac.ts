import { User } from "../db/database";

export type Permission =
  | "projects:read"
  | "projects:write"
  | "projects:delete"
  | "tasks:read"
  | "tasks:write"
  | "tasks:delete"
  | "approvals:request"
  | "approvals:review"
  | "files:upload"
  | "files:delete"
  | "clients:read"
  | "clients:write"
  | "team:manage"
  | "analytics:read";

const ROLE_PERMISSIONS: Record<User["role"], Permission[]> = {
  admin: [
    "projects:read",
    "projects:write",
    "projects:delete",
    "tasks:read",
    "tasks:write",
    "tasks:delete",
    "approvals:request",
    "approvals:review",
    "files:upload",
    "files:delete",
    "clients:read",
    "clients:write",
    "team:manage",
    "analytics:read"
  ],
  director: [
    "projects:read",
    "projects:write",
    "tasks:read",
    "tasks:write",
    "tasks:delete",
    "approvals:request",
    "approvals:review",
    "files:upload",
    "files:delete",
    "clients:read",
    "clients:write",
    "analytics:read"
  ],
  lead: [
    "projects:read",
    "projects:write",
    "tasks:read",
    "tasks:write",
    "approvals:request",
    "approvals:review",
    "files:upload",
    "clients:read",
    "analytics:read"
  ],
  designer: [
    "projects:read",
    "tasks:read",
    "tasks:write",
    "approvals:request",
    "files:upload"
  ],
  copywriter: [
    "projects:read",
    "tasks:read",
    "tasks:write",
    "approvals:request",
    "files:upload"
  ],
  client: [
    "projects:read",
    "tasks:read",
    "approvals:review",
    "files:upload"
  ]
};

export class RBAC {
  public static hasPermission(role: User["role"], permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  public static canAccessProject(userRole: User["role"], userClientId?: string, projectClientId?: string): boolean {
    if (userRole === "client") {
      return userClientId === projectClientId;
    }
    return true; // Team members can access all agency projects
  }
}
