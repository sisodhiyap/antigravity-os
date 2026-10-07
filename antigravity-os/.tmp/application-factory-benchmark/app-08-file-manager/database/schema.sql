-- Secure Document Manager Database Schema
-- Generated autonomously by Antigravity OS v5.2

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_folder_tenant ON folders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_folder_status ON folders(status);


CREATE TABLE IF NOT EXISTS filemetadatas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_filemetadata_tenant ON filemetadatas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_filemetadata_status ON filemetadatas(status);


CREATE TABLE IF NOT EXISTS userpermissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_userpermission_tenant ON userpermissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_userpermission_status ON userpermissions(status);


CREATE TABLE IF NOT EXISTS storagebuckets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_storagebucket_tenant ON storagebuckets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_storagebucket_status ON storagebuckets(status);


CREATE TABLE IF NOT EXISTS audittrails (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audittrail_tenant ON audittrails(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audittrail_status ON audittrails(status);

