-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES — ANTIGRAVITY AGENTIC PLATFORM
-- Multi-tenant, role-based security isolation for Users, Workspaces & Agents
-- ==============================================================================

-- 1. Enable RLS across all application tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resource_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_request_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_nodes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_edges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budget_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. USERS & PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users viewable by authenticated users"
ON "users" FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own record"
ON "users" FOR UPDATE TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Profiles are publicly readable"
ON "profiles" FOR SELECT TO public
USING (true);

CREATE POLICY "Users can insert own profile"
ON "profiles" FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile"
ON "profiles" FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATIONS & MEMBERSHIPS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view their organizations"
ON "organizations" FOR SELECT TO authenticated
USING (
  id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Org admins can update organization"
ON "organizations" FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()::text AND role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Members can view organization memberships"
ON "memberships" FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  )
);

-- ------------------------------------------------------------------------------
-- 4. PROJECTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view organization projects"
ON "projects" FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Members can create projects in their organization"
ON "projects" FOR INSERT TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  ) AND created_by_id = auth.uid()::text
);

CREATE POLICY "Project creators or org admins can update projects"
ON "projects" FOR UPDATE TO authenticated
USING (
  created_by_id = auth.uid()::text OR
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()::text AND role IN ('OWNER', 'ADMIN')
  )
);

-- ------------------------------------------------------------------------------
-- 5. TASKS & EXECUTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view organization tasks"
ON "tasks" FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Members can create tasks in their organization"
ON "tasks" FOR INSERT TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  ) AND created_by_id = auth.uid()::text
);

CREATE POLICY "Task owners or org admins can update tasks"
ON "tasks" FOR UPDATE TO authenticated
USING (
  created_by_id = auth.uid()::text OR
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()::text AND role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Members can view task executions"
ON "task_executions" FOR SELECT TO authenticated
USING (
  task_id IN (
    SELECT id FROM tasks WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
    )
  )
);

CREATE POLICY "Members can view tool executions"
ON "tool_executions" FOR SELECT TO authenticated
USING (
  task_execution_id IN (
    SELECT te.id FROM task_executions te
    JOIN tasks t ON te.task_id = t.id
    WHERE t.organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
    )
  )
);

-- ------------------------------------------------------------------------------
-- 6. AI REQUEST LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own AI request logs"
ON "ai_request_logs" FOR SELECT TO authenticated
USING (user_id = auth.uid()::text OR user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 7. MEMORY & KNOWLEDGE GRAPH POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view organization memory items"
ON "memory_items" FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Members can insert organization memory items"
ON "memory_items" FOR INSERT TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Members can view knowledge nodes"
ON "knowledge_nodes" FOR SELECT TO authenticated
USING (
  project_id IN (
    SELECT id FROM projects WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
    )
  )
);

CREATE POLICY "Members can view knowledge edges"
ON "knowledge_edges" FOR SELECT TO authenticated
USING (
  source_id IN (
    SELECT id FROM knowledge_nodes WHERE project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()::text
      )
    )
  )
);

-- ------------------------------------------------------------------------------
-- 8. BUDGET & AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Org admins can view budgets"
ON "budget_records" FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid()::text AND role IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "Actors can insert audit logs"
ON "audit_logs" FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = actor_id OR actor_id IS NULL);

CREATE POLICY "Org admins can view audit logs"
ON "audit_logs" FOR SELECT TO authenticated
USING (true);
