// SQLite Database Handler for Secure Document Manager
const fs = require('fs');
const path = require('path');

class SimpleDB {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.tables = {};
    this.init();
  }

  init() {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.tables = JSON.parse(raw);
      } catch (e) {
        this.tables = {};
      }
    }
    const entities = ["folders","filemetadatas","userpermissions","storagebuckets","audittrails"];
    entities.forEach(tbl => {
      if (!this.tables[tbl]) this.tables[tbl] = [];
    });
    this.persist();
  }

  persist() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.tables, null, 2));
  }

  insert(table, record) {
    if (!this.tables[table]) this.tables[table] = [];
    const item = {
      id: record.id || 'id_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record
    };
    this.tables[table].push(item);
    this.persist();
    return item;
  }

  find(table, filter = {}) {
    if (!this.tables[table]) return [];
    return this.tables[table].filter(item => {
      for (const k of Object.keys(filter)) {
        if (item[k] !== filter[k]) return false;
      }
      return true;
    });
  }

  findById(table, id) {
    if (!this.tables[table]) return null;
    return this.tables[table].find(item => item.id === id) || null;
  }

  update(table, id, updates) {
    if (!this.tables[table]) return null;
    const index = this.tables[table].findIndex(item => item.id === id);
    if (index === -1) return null;
    this.tables[table][index] = {
      ...this.tables[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return this.tables[table][index];
  }

  delete(table, id) {
    if (!this.tables[table]) return false;
    const index = this.tables[table].findIndex(item => item.id === id);
    if (index === -1) return false;
    this.tables[table].splice(index, 1);
    this.persist();
    return true;
  }
}

const db = new SimpleDB(path.join(__dirname, '..', 'database', 'app.sqlite.json'));
module.exports = { db };
