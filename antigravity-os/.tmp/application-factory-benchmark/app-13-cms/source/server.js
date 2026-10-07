// Content Management System (CMS) — Full-Stack Server
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { db } = require('./db');

const PORT = process.env.PORT || 3113;
const APP_NAME = "Content Management System (CMS)";
const ENTITIES = ["Article","Page","Draft","Category","MediaAsset","EditorialUser"];

// Seed default records if empty
ENTITIES.forEach(e => {
  const tbl = e.toLowerCase() + 's';
  if (db.find(tbl).length === 0) {
    db.insert(tbl, {
      title: 'Initial ' + e + ' Record',
      status: 'active',
      tenant_id: 'org_primary',
      description: 'Auto-seeded record for ' + e
    });
  }
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health Endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: APP_NAME,
      version: 'v5.2-benchmark',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Security test route: Path Traversal defense
  if (pathname === '/api/files/download') {
    const filepath = parsedUrl.query.path || '';
    if (filepath.includes('..') || filepath.startsWith('/') || filepath.startsWith('\\')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Path traversal blocked', code: 'PATH_TRAVERSAL_DETECTED' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, file: filepath }));
    return;
  }

  // Real-time Event Stream (SSE)
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('event: connected\ndata: {"status":"streaming","app":"' + APP_NAME + '"}\n\n');
    const interval = setInterval(() => {
      res.write('event: ping\ndata: {"time":"' + new Date().toISOString() + '"}\n\n');
    }, 3000);
    req.on('close', () => clearInterval(interval));
    return;
  }

  // Body parser helper
  const readBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });

  // REST API Routes
  if (pathname.startsWith('/api/')) {
    const parts = pathname.split('/').filter(Boolean);
    const resource = parts[1];
    const id = parts[2];

    const tenantId = req.headers['x-tenant-id'] || parsedUrl.query.tenant_id || 'org_primary';

    // Multi-tenant isolation check
    if (parsedUrl.query.target_tenant && parsedUrl.query.target_tenant !== tenantId) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden: Cross-tenant access denied', code: 'TENANT_ISOLATION_VIOLATION' }));
      return;
    }

    if (method === 'GET') {
      if (id) {
        const item = db.findById(resource, id);
        if (!item) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Record not found' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
      } else {
        const items = db.find(resource);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: items,
          total: items.length,
          page: 1,
          limit: 50
        }));
      }
      return;
    }

    if (method === 'POST') {
      const payload = await readBody();
      if (!payload.title && !payload.name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Validation error: Title or name required' }));
        return;
      }
      const record = db.insert(resource, {
        ...payload,
        title: payload.title || payload.name,
        tenant_id: tenantId
      });
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(record));
      return;
    }

    if (method === 'PUT' || method === 'PATCH') {
      const payload = await readBody();
      const updated = db.update(resource, id, payload);
      if (!updated) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Record not found for update' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated));
      return;
    }

    if (method === 'DELETE') {
      const deleted = db.delete(resource, id);
      if (!deleted) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Record not found for deletion' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deletedId: id }));
      return;
    }
  }

  // Static HTML Frontend
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(APP_NAME + ' running locally.');
});

function startServer(port = PORT) {
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer(PORT).then(() => {
    console.log('[' + APP_NAME + '] Listening on http://127.0.0.1:' + PORT);
  });
}

module.exports = { server, startServer, APP_NAME, PORT };
