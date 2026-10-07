-- Analytics Platform Database Schema
-- Generated autonomously by Antigravity OS v5.2

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dataset_tenant ON datasets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dataset_status ON datasets(status);


CREATE TABLE IF NOT EXISTS datarecords (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_datarecord_tenant ON datarecords(tenant_id);
CREATE INDEX IF NOT EXISTS idx_datarecord_status ON datarecords(status);


CREATE TABLE IF NOT EXISTS kpidefinitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kpidefinition_tenant ON kpidefinitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kpidefinition_status ON kpidefinitions(status);


CREATE TABLE IF NOT EXISTS categorymetrics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_categorymetric_tenant ON categorymetrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categorymetric_status ON categorymetrics(status);


CREATE TABLE IF NOT EXISTS exportjobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_exportjob_tenant ON exportjobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exportjob_status ON exportjobs(status);

