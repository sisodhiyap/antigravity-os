# 🚀 Universal Supabase & Prisma Backend Starter

A production-grade, modular backend foundation integrating **Supabase** (Auth, Row Level Security, Storage, Realtime) and **Prisma ORM** (Type-safe SQL queries, Schema migrations, Seeders, Relation modeling) designed to be plugged into any web, mobile, or API project.

---

## 📁 Package Architecture

```text
backend-supabase-prisma/
├── prisma/
│   ├── schema.prisma              # Production PostgreSQL schema (Users, Profiles, Orgs, Items, AuditLogs)
│   └── seed.ts                    # Type-safe database seeding script
├── src/
│   ├── lib/
│   │   ├── prisma/
│   │   │   ├── client.ts          # Global Prisma singleton (prevents connection exhaustion)
│   │   │   └── extensions.ts      # Query profiling & audit logging extensions
│   │   └── supabase/
│   │       ├── client.ts          # Standard public Supabase client (Anon key)
│   │       ├── admin.ts           # Elevated Service Role client (bypasses RLS for backend tasks)
│   │       ├── auth.ts            # Auth helpers (signUp, signIn, verifyToken, signOut)
│   │       └── middleware.ts      # Bearer token parsing and request authentication
│   ├── services/
│   │   ├── base.service.ts        # Zero-any safe execution wrapper { data, error }
│   │   ├── user.service.ts        # User & profile management CRUD service
│   │   └── auth.service.ts        # Unified auth syncing Supabase Auth with Prisma DB
│   ├── types/
│   │   ├── api.types.ts           # Standardized API response and error contracts
│   │   └── database.types.ts      # TypeScript interfaces for database models
│   └── index.ts                   # Unified public entrypoint
├── SUPABASE_RLS_POLICIES.sql      # Ready-to-apply PostgreSQL Row Level Security policies
├── .env.example                   # Environment configuration template
└── package.json                   # Scripts for migrations, generation, studio, and seed
```

---

## ⚡ Quick Start

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase connection strings:
* `DATABASE_URL`: Transaction Pooler URL on Port `6543` (for queries).
* `DIRECT_URL`: Direct Connection URL on Port `5432` (for migrations).
* `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Install Dependencies & Generate Prisma Client
```bash
npm install
npm run db:generate
```

### 3. Push Schema & Seed Initial Database
```bash
# Push schema to your Supabase PostgreSQL database
npm run db:push

# Run type-safe seeder
npm run db:seed
```

### 4. Launch Prisma Studio (Visual DB GUI)
```bash
npm run db:studio
```

---

## 🔌 Framework Integration Recipes

### 1. Next.js App Router (Server Actions & Route Handlers)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { UserService, authenticateRequest } from 'backend-supabase-prisma';

export async function GET(request: Request) {
  // 1. Authenticate user from header
  const authHeader = request.headers.get('authorization');
  const authRes = await authenticateRequest(authHeader);
  
  if (authRes.error) {
    return NextResponse.json({ error: authRes.error }, { status: 401 });
  }

  // 2. Fetch data via Prisma UserService
  const { data, error } = await UserService.list({ page: 1, limit: 10 });
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

### 2. Express.js / Fastify API Server

```typescript
// server.ts
import express from 'express';
import { AuthService, UserService } from 'backend-supabase-prisma';

const app = express();
app.use(express.json());

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  const result = await AuthService.register({ email, password }, { displayName });
  
  if (result.error) {
    return res.status(result.error.statusCode || 400).json(result);
  }
  return res.status(201).json(result);
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login({ email, password });
  
  if (result.error) {
    return res.status(result.error.statusCode || 401).json(result);
  }
  return res.json(result);
});
```

### 3. Client-Side React + Supabase Realtime

```typescript
// hooks/useRealtimeItems.ts
import { useEffect, useState } from 'react';
import { supabase } from 'backend-supabase-prisma';

export function useRealtimeItems() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('public:resource_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resource_items' }, (payload) => {
        console.log('Realtime change detected:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { items };
}
```

---

## 🛡️ Security & Row Level Security (RLS)
To enforce database-level policies when clients connect directly with the Supabase anon key:
1. Open your Supabase Dashboard $\rightarrow$ **SQL Editor**.
2. Copy the contents of [`SUPABASE_RLS_POLICIES.sql`](file:///c:/D%20drive/Antigravity/backend-supabase-prisma/SUPABASE_RLS_POLICIES.sql).
3. Click **Run** to activate RLS policies across all tables.

---

## 📦 NPM Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run db:generate` | Generates `@prisma/client` from `schema.prisma` |
| `npm run db:push` | Pushes schema directly to Supabase without migration files |
| `npm run db:migrate` | Creates and applies a new SQL migration in development |
| `npm run db:deploy` | Applies pending migrations in staging/production |
| `npm run db:seed` | Populates database with default seed entities |
| `npm run db:studio` | Opens interactive visual web interface to explore data |
| `npm run build` | Compiles TypeScript into distribution folder (`dist/`) |
| `npm run typecheck` | Validates strict TypeScript compilation with 0 errors |
