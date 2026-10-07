-- External API Integration Gateway Database Schema
-- Generated autonomously by Antigravity OS v5.2

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS apisources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_apisource_tenant ON apisources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apisource_status ON apisources(status);


CREATE TABLE IF NOT EXISTS cachedresponses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cachedresponse_tenant ON cachedresponses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cachedresponse_status ON cachedresponses(status);


CREATE TABLE IF NOT EXISTS normalizedrecords (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_normalizedrecord_tenant ON normalizedrecords(tenant_id);
CREATE INDEX IF NOT EXISTS idx_normalizedrecord_status ON normalizedrecords(status);


CREATE TABLE IF NOT EXISTS synclogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_synclog_tenant ON synclogs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_synclog_status ON synclogs(status);


CREATE TABLE IF NOT EXISTS metriccounters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metriccounter_tenant ON metriccounters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metriccounter_status ON metriccounters(status);

