-- Project Management & Kanban Database Schema
-- Generated autonomously by Antigravity OS v5.2

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_project_tenant ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_status ON projects(status);


CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_task_tenant ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON tasks(status);


CREATE TABLE IF NOT EXISTS statuscolumns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_statuscolumn_tenant ON statuscolumns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_statuscolumn_status ON statuscolumns(status);


CREATE TABLE IF NOT EXISTS prioritys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_priority_tenant ON prioritys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_priority_status ON prioritys(status);


CREATE TABLE IF NOT EXISTS assignees (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assignee_tenant ON assignees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignee_status ON assignees(status);


CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comment_tenant ON comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comment_status ON comments(status);


CREATE TABLE IF NOT EXISTS activityhistorys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activityhistory_tenant ON activityhistorys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activityhistory_status ON activityhistorys(status);

