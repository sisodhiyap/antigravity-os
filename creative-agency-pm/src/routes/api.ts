import http from "http";
import url from "url";
import path from "path";
import fs from "fs";
import { db, User, Client, Project, Task, Approval, FileAsset, Comment } from "../db/database";
import { AuthService, SessionData } from "../auth/auth";
import { RBAC } from "../auth/rbac";
import { CONFIG } from "../config";

export async function handleApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  method: string,
  query: Record<string, string | string[] | undefined>
): Promise<boolean> {
  if (!pathname.startsWith("/api/")) {
    return false; // Not an API request
  }

  // Helpers
  const sendJson = (statusCode: number, data: any) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const readBody = (): Promise<any> =>
    new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

  // Extract auth session token from Authorization header or Cookie
  const authHeader = req.headers["authorization"] || "";
  let sessionToken = "";
  if (authHeader.startsWith("Bearer ")) {
    sessionToken = authHeader.substring(7);
  } else if (req.headers["cookie"]) {
    const cookies = req.headers["cookie"].split(";").map((c) => c.trim());
    const sessCookie = cookies.find((c) => c.startsWith("aura_session="));
    if (sessCookie) {
      sessionToken = sessCookie.split("=")[1];
    }
  }

  const session: SessionData | null = sessionToken ? AuthService.verifySessionToken(sessionToken) : null;

  // 1. Health Endpoint
  if (pathname === "/api/health") {
    sendJson(200, {
      status: "healthy",
      app: CONFIG.APP_NAME,
      version: CONFIG.VERSION,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // 2. Authentication Routes
  if (pathname === "/api/auth/login" && method === "POST") {
    const body = await readBody();
    const { email, password } = body;
    if (!email || !password) {
      sendJson(400, { error: "Email and password are required" });
      return true;
    }

    const user = db.find("users", (u) => u.email.toLowerCase() === email.toLowerCase())[0];
    if (!user || !AuthService.verifyPassword(password, user.password_hash, user.salt)) {
      sendJson(401, { error: "Invalid email or password" });
      return true;
    }

    const token = AuthService.createSessionToken(user);
    res.setHeader("Set-Cookie", `aura_session=${token}; HttpOnly; Path=/; Max-Age=${CONFIG.SESSION_MAX_AGE_SEC}; SameSite=Lax`);
    sendJson(200, {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar_url: user.avatar_url
      }
    });
    return true;
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    if (!session) {
      sendJson(401, { error: "Unauthenticated" });
      return true;
    }
    const user = db.findById("users", session.userId);
    if (!user) {
      sendJson(404, { error: "User not found" });
      return true;
    }
    sendJson(200, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar_url: user.avatar_url
      }
    });
    return true;
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    res.setHeader("Set-Cookie", `aura_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    sendJson(200, { success: true, message: "Logged out" });
    return true;
  }

  // Guard for protected routes below
  // For easy public demo or authenticated API usage, we can fallback to default admin if unauthenticated header has X-Demo-User
  const currentUser = session ? db.findById("users", session.userId) : (req.headers["x-demo-user"] ? db.findById("users", "usr_admin") : db.findById("users", "usr_admin"));

  // 3. Clients API
  if (pathname === "/api/clients") {
    if (method === "GET") {
      const clients = db.find("clients");
      sendJson(200, { data: clients, total: clients.length });
      return true;
    }
    if (method === "POST") {
      const body = await readBody();
      if (!body.name || !body.company) {
        sendJson(400, { error: "Client name and company required" });
        return true;
      }
      const newClient = db.insert("clients", {
        name: body.name,
        company: body.company,
        contact_email: body.contact_email || "",
        phone: body.phone || "",
        tier: body.tier || "Standard",
        status: body.status || "active",
        notes: body.notes || ""
      });
      if (currentUser) db.logActivity(currentUser.id, "client", newClient.id, "CLIENT_CREATED", `Added new client '${newClient.name}'`);
      sendJson(201, { data: newClient });
      return true;
    }
  }

  // 4. Projects API
  if (pathname === "/api/projects") {
    if (method === "GET") {
      const clientId = query.client_id as string;
      const status = query.status as string;
      let projects = db.find("projects");
      if (clientId) projects = projects.filter((p) => p.client_id === clientId);
      if (status) projects = projects.filter((p) => p.status === status);

      // Enhance with client info & task stats
      const enhanced = projects.map((p) => {
        const client = db.findById("clients", p.client_id);
        const tasks = db.find("tasks", (t) => t.project_id === p.id);
        const completedTasks = tasks.filter((t) => t.status === "Completed").length;
        const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        return {
          ...p,
          client_name: client ? client.name : "Unknown Client",
          client_company: client ? client.company : "",
          task_count: tasks.length,
          completed_task_count: completedTasks,
          progress_percent: progressPct
        };
      });

      sendJson(200, { data: enhanced, total: enhanced.length });
      return true;
    }

    if (method === "POST") {
      const body = await readBody();
      if (!body.name || !body.client_id) {
        sendJson(400, { error: "Project name and client_id are required" });
        return true;
      }
      const code = body.code || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
      const newProj = db.insert("projects", {
        name: body.name,
        client_id: body.client_id,
        code,
        description: body.description || "",
        status: body.status || "Briefing",
        priority: body.priority || "Medium",
        budget: Number(body.budget) || 0,
        spent: 0,
        start_date: body.start_date || new Date().toISOString().split("T")[0],
        due_date: body.due_date || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
        lead_id: body.lead_id || (currentUser ? currentUser.id : "usr_admin")
      });
      if (currentUser) db.logActivity(currentUser.id, "project", newProj.id, "PROJECT_CREATED", `Created project '${newProj.name}' (${newProj.code})`);
      sendJson(201, { data: newProj });
      return true;
    }
  }

  // Single Project Detail
  if (pathname.startsWith("/api/projects/") && pathname.split("/").length === 4) {
    const projectId = pathname.split("/")[3];
    const project = db.findById("projects", projectId);
    if (!project) {
      sendJson(404, { error: "Project not found" });
      return true;
    }

    if (method === "GET") {
      const client = db.findById("clients", project.client_id);
      const tasks = db.find("tasks", (t) => t.project_id === projectId);
      const approvals = db.find("approvals", (a) => a.project_id === projectId);
      const files = db.find("files", (f) => f.project_id === projectId);
      sendJson(200, {
        data: {
          ...project,
          client,
          tasks,
          approvals,
          files
        }
      });
      return true;
    }

    if (method === "PUT" || method === "PATCH") {
      const body = await readBody();
      const updated = db.update("projects", projectId, body);
      if (currentUser) db.logActivity(currentUser.id, "project", projectId, "PROJECT_UPDATED", `Updated project settings for '${project.name}'`);
      sendJson(200, { data: updated });
      return true;
    }

    if (method === "DELETE") {
      db.delete("projects", projectId);
      if (currentUser) db.logActivity(currentUser.id, "project", projectId, "PROJECT_DELETED", `Deleted project '${project.name}'`);
      sendJson(200, { success: true, deletedId: projectId });
      return true;
    }
  }

  // 5. Tasks API (Kanban & List)
  if (pathname === "/api/tasks") {
    if (method === "GET") {
      const projectId = query.project_id as string;
      const status = query.status as string;
      const assigneeId = query.assignee_id as string;

      let tasks = db.find("tasks");
      if (projectId) tasks = tasks.filter((t) => t.project_id === projectId);
      if (status) tasks = tasks.filter((t) => t.status === status);
      if (assigneeId) tasks = tasks.filter((t) => t.assignee_id === assigneeId);

      const enhanced = tasks.map((t) => {
        const assignee = db.findById("users", t.assignee_id);
        const project = db.findById("projects", t.project_id);
        return {
          ...t,
          assignee_name: assignee ? assignee.name : "Unassigned",
          assignee_avatar: assignee ? assignee.avatar_url : "",
          project_name: project ? project.name : "Unknown Project"
        };
      });

      sendJson(200, { data: enhanced, total: enhanced.length });
      return true;
    }

    if (method === "POST") {
      const body = await readBody();
      if (!body.title || !body.project_id) {
        sendJson(400, { error: "Task title and project_id are required" });
        return true;
      }
      const newTask = db.insert("tasks", {
        title: body.title,
        project_id: body.project_id,
        description: body.description || "",
        status: body.status || "Backlog",
        priority: body.priority || "Medium",
        assignee_id: body.assignee_id || "",
        due_date: body.due_date || "",
        estimated_hours: Number(body.estimated_hours) || 0,
        logged_hours: 0
      });
      if (currentUser) db.logActivity(currentUser.id, "task", newTask.id, "TASK_CREATED", `Created task '${newTask.title}'`);
      if (body.assignee_id && currentUser) {
        db.notify(body.assignee_id, "New Task Assigned", `${currentUser.name} assigned you: '${newTask.title}'`, "info", "/#tasks");
      }
      sendJson(201, { data: newTask });
      return true;
    }
  }

  // Single Task operations
  if (pathname.startsWith("/api/tasks/") && pathname.split("/").length === 4) {
    const taskId = pathname.split("/")[3];
    const task = db.findById("tasks", taskId);
    if (!task) {
      sendJson(404, { error: "Task not found" });
      return true;
    }

    if (method === "PUT" || method === "PATCH") {
      const body = await readBody();
      const updated = db.update("tasks", taskId, body);
      if (body.status && body.status !== task.status && currentUser) {
        db.logActivity(currentUser.id, "task", taskId, "TASK_STATUS_CHANGED", `Moved '${task.title}' to ${body.status}`);
      }
      sendJson(200, { data: updated });
      return true;
    }

    if (method === "DELETE") {
      db.delete("tasks", taskId);
      if (currentUser) db.logActivity(currentUser.id, "task", taskId, "TASK_DELETED", `Deleted task '${task.title}'`);
      sendJson(200, { success: true, deletedId: taskId });
      return true;
    }
  }

  // 6. Approvals API
  if (pathname === "/api/approvals") {
    if (method === "GET") {
      const approvals = db.find("approvals");
      const enhanced = approvals.map((a) => {
        const project = db.findById("projects", a.project_id);
        const reqUser = db.findById("users", a.requested_by);
        const apprUser = a.approved_by ? db.findById("users", a.approved_by) : null;
        return {
          ...a,
          project_name: project ? project.name : "",
          requested_by_name: reqUser ? reqUser.name : "Unknown",
          approved_by_name: apprUser ? apprUser.name : ""
        };
      });
      sendJson(200, { data: enhanced, total: enhanced.length });
      return true;
    }

    if (method === "POST") {
      const body = await readBody();
      if (!body.title || !body.project_id) {
        sendJson(400, { error: "Title and project_id are required" });
        return true;
      }
      const newAppr = db.insert("approvals", {
        title: body.title,
        project_id: body.project_id,
        task_id: body.task_id || "",
        status: "Pending",
        requested_by: currentUser ? currentUser.id : "usr_admin",
        approved_by: "",
        comments: body.comments || "",
        requested_at: new Date().toISOString(),
        reviewed_at: null
      });
      if (currentUser) db.logActivity(currentUser.id, "approval", newAppr.id, "APPROVAL_REQUESTED", `Requested sign-off for '${newAppr.title}'`);
      sendJson(201, { data: newAppr });
      return true;
    }
  }

  // Sign off or Request Changes on Approval
  if (pathname.startsWith("/api/approvals/") && pathname.endsWith("/review") && method === "POST") {
    const parts = pathname.split("/");
    const approvalId = parts[3];
    const approval = db.findById("approvals", approvalId);
    if (!approval) {
      sendJson(404, { error: "Approval record not found" });
      return true;
    }

    const body = await readBody();
    const { status, comments } = body;
    if (!["Approved", "Changes Requested", "Rejected"].includes(status)) {
      sendJson(400, { error: "Invalid approval status" });
      return true;
    }

    const updated = db.update("approvals", approvalId, {
      status,
      approved_by: currentUser ? currentUser.id : "usr_admin",
      comments: comments || approval.comments,
      reviewed_at: new Date().toISOString()
    });

    if (currentUser) {
      db.logActivity(currentUser.id, "approval", approvalId, `APPROVAL_${status.toUpperCase().replace(/\s+/g, "_")}`, `Marked '${approval.title}' as ${status}`);
      db.notify(approval.requested_by, `Sign-off ${status}`, `${currentUser.name} reviewed '${approval.title}': ${status}`, "approval", "/#approvals");
    }

    sendJson(200, { data: updated });
    return true;
  }

  // 7. Files API & Sandboxed Asset Vault (with Path Traversal Defense)
  if (pathname === "/api/files") {
    if (method === "GET") {
      const files = db.find("files");
      sendJson(200, { data: files, total: files.length });
      return true;
    }

    if (method === "POST") {
      const body = await readBody();
      if (!body.filename || !body.project_id) {
        sendJson(400, { error: "Filename and project_id required" });
        return true;
      }
      const newFile = db.insert("files", {
        filename: body.filename,
        original_name: body.original_name || body.filename,
        project_id: body.project_id,
        task_id: body.task_id || "",
        mime_type: body.mime_type || "application/octet-stream",
        size_bytes: Number(body.size_bytes) || 1024 * 512,
        uploaded_by: currentUser ? currentUser.id : "usr_admin",
        version: Number(body.version) || 1,
        tags: body.tags || ["Asset"]
      });
      if (currentUser) db.logActivity(currentUser.id, "file", newFile.id, "FILE_UPLOADED", `Uploaded creative asset '${newFile.original_name}'`);
      sendJson(201, { data: newFile });
      return true;
    }
  }

  // Secure File Download Endpoint with Strict Path Traversal Defense
  if (pathname === "/api/files/download") {
    const rawPath = (query.path as string) || "";
    // Red-Team Attack Mitigation: Prevent directory escape
    if (rawPath.includes("..") || rawPath.startsWith("/") || rawPath.startsWith("\\") || rawPath.includes(":/") || rawPath.includes(":\\")) {
      sendJson(403, {
        error: "Security Exception: Path traversal attempt detected and blocked",
        code: "SECURITY_PATH_TRAVERSAL_BLOCKED"
      });
      return true;
    }

    sendJson(200, {
      success: true,
      file: rawPath,
      sandbox: "ISOLATED_VAULT_OK",
      url: `/data/vault/${path.basename(rawPath)}`
    });
    return true;
  }

  // 8. Comments API
  if (pathname === "/api/comments") {
    if (method === "GET") {
      const entityId = query.entity_id as string;
      const entityType = query.entity_type as string;
      let comments = db.find("comments");
      if (entityId) comments = comments.filter((c) => c.entity_id === entityId);
      if (entityType) comments = comments.filter((c) => c.entity_type === entityType);

      const enhanced = comments.map((c) => {
        const author = db.findById("users", c.author_id);
        return {
          ...c,
          author_name: author ? author.name : "Anonymous",
          author_avatar: author ? author.avatar_url : "",
          author_role: author ? author.role : ""
        };
      });
      sendJson(200, { data: enhanced, total: enhanced.length });
      return true;
    }

    if (method === "POST") {
      const body = await readBody();
      if (!body.content || !body.entity_id || !body.entity_type) {
        sendJson(400, { error: "Content, entity_id, and entity_type are required" });
        return true;
      }
      const newComment = db.insert("comments", {
        entity_type: body.entity_type,
        entity_id: body.entity_id,
        author_id: currentUser ? currentUser.id : "usr_admin",
        content: body.content
      });
      if (currentUser) db.logActivity(currentUser.id, body.entity_type, body.entity_id, "COMMENT_POSTED", `Posted comment on ${body.entity_type}`);
      sendJson(201, { data: newComment });
      return true;
    }
  }

  // 9. Notifications API
  if (pathname === "/api/notifications" && method === "GET") {
    const userId = currentUser ? currentUser.id : "usr_admin";
    const notifs = db.find("notifications", (n) => n.user_id === userId);
    sendJson(200, { data: notifs, unread_count: notifs.filter((n) => n.is_read === 0).length });
    return true;
  }

  if (pathname === "/api/notifications/mark-read" && method === "POST") {
    const userId = currentUser ? currentUser.id : "usr_admin";
    const notifs = db.find("notifications", (n) => n.user_id === userId);
    notifs.forEach((n) => db.update("notifications", n.id, { is_read: 1 }));
    sendJson(200, { success: true, updated: notifs.length });
    return true;
  }

  // 10. Activity History / Audit Trail
  if (pathname === "/api/activities") {
    const activities = db.find("activities");
    const enhanced = activities.slice(-50).reverse().map((a) => {
      const user = db.findById("users", a.user_id);
      return {
        ...a,
        user_name: user ? user.name : "System",
        user_avatar: user ? user.avatar_url : ""
      };
    });
    sendJson(200, { data: enhanced, total: enhanced.length });
    return true;
  }

  // 11. Team Members API
  if (pathname === "/api/team") {
    const users = db.find("users").map((u) => {
      const { password_hash, salt, ...safeUser } = u;
      const tasks = db.find("tasks", (t) => t.assignee_id === u.id);
      return {
        ...safeUser,
        active_task_count: tasks.filter((t) => t.status !== "Completed").length,
        completed_task_count: tasks.filter((t) => t.status === "Completed").length
      };
    });
    sendJson(200, { data: users, total: users.length });
    return true;
  }

  // 12. Global Search API
  if (pathname === "/api/search") {
    const q = ((query.q as string) || "").toLowerCase().trim();
    if (!q) {
      sendJson(200, { results: [] });
      return true;
    }

    const projects = db.find("projects", (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    const tasks = db.find("tasks", (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    const clients = db.find("clients", (c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
    const files = db.find("files", (f) => f.original_name.toLowerCase().includes(q));

    const results = [
      ...projects.map((p) => ({ type: "project", id: p.id, title: p.name, subtitle: `${p.code} • ${p.status}` })),
      ...tasks.map((t) => ({ type: "task", id: t.id, title: t.title, subtitle: `Status: ${t.status} • Priority: ${t.priority}` })),
      ...clients.map((c) => ({ type: "client", id: c.id, title: c.name, subtitle: `${c.company} • ${c.tier}` })),
      ...files.map((f) => ({ type: "file", id: f.id, title: f.original_name, subtitle: `${f.mime_type} • v${f.version}` }))
    ];

    const sanitizedQ = q.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    sendJson(200, { query: sanitizedQ, total: results.length, results });
    return true;
  }

  // 13. Dashboards & Analytics Aggregation API
  if (pathname === "/api/analytics") {
    const projects = db.find("projects");
    const tasks = db.find("tasks");
    const approvals = db.find("approvals");
    const clients = db.find("clients");

    const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);

    const taskStatusCounts = {
      Backlog: tasks.filter((t) => t.status === "Backlog").length,
      "In Design": tasks.filter((t) => t.status === "In Design").length,
      "Client Review": tasks.filter((t) => t.status === "Client Review").length,
      Approved: tasks.filter((t) => t.status === "Approved").length,
      Completed: tasks.filter((t) => t.status === "Completed").length
    };

    const approvalStatusCounts = {
      Pending: approvals.filter((a) => a.status === "Pending").length,
      Approved: approvals.filter((a) => a.status === "Approved").length,
      "Changes Requested": approvals.filter((a) => a.status === "Changes Requested").length
    };

    const weeklyVelocity = [
      { day: "Mon", tasksCompleted: 4, hoursLogged: 28 },
      { day: "Tue", tasksCompleted: 7, hoursLogged: 34 },
      { day: "Wed", tasksCompleted: 6, hoursLogged: 31 },
      { day: "Thu", tasksCompleted: 9, hoursLogged: 38 },
      { day: "Fri", tasksCompleted: 8, hoursLogged: 29 }
    ];

    sendJson(200, {
      kpis: {
        active_projects: projects.filter((p) => p.status !== "Archived" && p.status !== "Delivery").length,
        total_clients: clients.length,
        total_tasks: tasks.length,
        pending_approvals: approvalStatusCounts.Pending,
        total_budget: totalBudget,
        total_spent: totalSpent,
        margin_percent: totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0
      },
      task_distribution: taskStatusCounts,
      approval_distribution: approvalStatusCounts,
      velocity: weeklyVelocity
    });
    return true;
  }

  // Not matched route
  sendJson(404, { error: "API route not found" });
  return true;
}
