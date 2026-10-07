
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, role TEXT);
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, title TEXT, owner_id TEXT, status TEXT);
CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, project_id TEXT, title TEXT, priority TEXT, due_date TEXT, status TEXT);
