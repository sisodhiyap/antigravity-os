-- Aura Studio OS — Creative Agency Project Management Database Schema
-- Architecture: SQLite 3.x WAL Mode with ACID Transactions

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. Users & Team Members
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'director', 'lead', 'designer', 'copywriter', 'client')),
  title TEXT DEFAULT 'Creative Contributor',
  avatar_url TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  tier TEXT DEFAULT 'Standard' CHECK(tier IN ('VIP Enterprise', 'Retainer', 'Standard', 'Pro Bono')),
  status TEXT DEFAULT 'active',
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'Briefing' CHECK(status IN ('Briefing', 'Concept Design', 'Review & Approvals', 'Production', 'Delivery', 'Archived')),
  priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Urgent', 'High', 'Medium', 'Low')),
  budget REAL DEFAULT 0,
  spent REAL DEFAULT 0,
  start_date TEXT DEFAULT '',
  due_date TEXT NOT NULL,
  lead_id TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Tasks & Kanban Board
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'Backlog' CHECK(status IN ('Backlog', 'In Design', 'Client Review', 'Approved', 'Completed')),
  priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Urgent', 'High', 'Medium', 'Low')),
  assignee_id TEXT DEFAULT '',
  due_date TEXT DEFAULT '',
  estimated_hours REAL DEFAULT 0,
  logged_hours REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Approvals & Client Sign-Offs
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT DEFAULT '',
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Changes Requested', 'Rejected')),
  requested_by TEXT NOT NULL,
  approved_by TEXT DEFAULT '',
  comments TEXT DEFAULT '',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(id)
);

-- 6. Files & Creative Asset Vault
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  task_id TEXT DEFAULT '',
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  tags TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 7. Comments & Threads
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('project', 'task', 'approval', 'file')),
  entity_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK(type IN ('info', 'approval', 'deadline', 'mention', 'alert')),
  is_read INTEGER DEFAULT 0,
  link TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Activity History & Audit Log
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_approvals_project ON approvals(project_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
