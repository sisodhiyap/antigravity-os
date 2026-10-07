-- Cinematic Portfolio Generator Database Schema
-- Generated autonomously by Antigravity OS v5.2

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS portfolioprojects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_portfolioproject_tenant ON portfolioprojects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_portfolioproject_status ON portfolioprojects(status);


CREATE TABLE IF NOT EXISTS casestudys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_casestudy_tenant ON casestudys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_casestudy_status ON casestudys(status);


CREATE TABLE IF NOT EXISTS skillbadges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skillbadge_tenant ON skillbadges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skillbadge_status ON skillbadges(status);


CREATE TABLE IF NOT EXISTS serviceofferings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_serviceoffering_tenant ON serviceofferings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_serviceoffering_status ON serviceofferings(status);


CREATE TABLE IF NOT EXISTS biographys (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_biography_tenant ON biographys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_biography_status ON biographys(status);


CREATE TABLE IF NOT EXISTS contactsubmissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  tenant_id TEXT DEFAULT 'default_org',
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contactsubmission_tenant ON contactsubmissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contactsubmission_status ON contactsubmissions(status);

