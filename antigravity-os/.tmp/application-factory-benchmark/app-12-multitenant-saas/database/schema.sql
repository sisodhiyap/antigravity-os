-- Multi-Tenant SaaS with Strict Isolation Database Schema
-- Generated autonomously by Antigravity OS v5.2

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenant_tenant ON tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_status ON tenants(status);


CREATE TABLE IF NOT EXISTS tenantusers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenantuser_tenant ON tenantusers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenantuser_status ON tenantusers(status);


CREATE TABLE IF NOT EXISTS tenantroles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenantrole_tenant ON tenantroles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenantrole_status ON tenantroles(status);


CREATE TABLE IF NOT EXISTS tenantprojects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenantproject_tenant ON tenantprojects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenantproject_status ON tenantprojects(status);


CREATE TABLE IF NOT EXISTS tenantdocuments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenantdocument_tenant ON tenantdocuments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenantdocument_status ON tenantdocuments(status);

