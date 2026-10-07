import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CONFIG } from "../config";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: "admin" | "director" | "lead" | "designer" | "copywriter" | "client";
  title: string;
  avatar_url: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  contact_email: string;
  phone: string;
  tier: "VIP Enterprise" | "Retainer" | "Standard" | "Pro Bono";
  status: "active" | "inactive";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  code: string;
  description: string;
  status: "Briefing" | "Concept Design" | "Review & Approvals" | "Production" | "Delivery" | "Archived";
  priority: "Urgent" | "High" | "Medium" | "Low";
  budget: number;
  spent: number;
  start_date: string;
  due_date: string;
  lead_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: "Backlog" | "In Design" | "Client Review" | "Approved" | "Completed";
  priority: "Urgent" | "High" | "Medium" | "Low";
  assignee_id: string;
  due_date: string;
  estimated_hours: number;
  logged_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  project_id: string;
  task_id: string;
  title: string;
  status: "Pending" | "Approved" | "Changes Requested" | "Rejected";
  requested_by: string;
  approved_by: string;
  comments: string;
  requested_at: string;
  reviewed_at: string | null;
}

export interface FileAsset {
  id: string;
  project_id: string;
  task_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  version: number;
  tags: string[];
  created_at: string;
}

export interface Comment {
  id: string;
  entity_type: "project" | "task" | "approval" | "file";
  entity_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "approval" | "deadline" | "mention" | "alert";
  is_read: number;
  link: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description: string;
  created_at: string;
}

export interface DatabaseState {
  users: User[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  approvals: Approval[];
  files: FileAsset[];
  comments: Comment[];
  notifications: Notification[];
  activities: Activity[];
}

export class SQLiteEngine {
  private dbPath: string;
  private state: DatabaseState;

  constructor(dbPath: string = CONFIG.DB_PATH) {
    this.dbPath = dbPath;
    this.state = {
      users: [],
      clients: [],
      projects: [],
      tasks: [],
      approvals: [],
      files: [],
      comments: [],
      notifications: [],
      activities: []
    };
    this.init();
  }

  private init() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(CONFIG.UPLOADS_DIR)) {
      fs.mkdirSync(CONFIG.UPLOADS_DIR, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, "utf-8");
        this.state = JSON.parse(raw);
      } catch (err) {
        console.warn("[DB] Reinitializing corrupt database state.");
        this.persist();
      }
    } else {
      this.persist();
    }
  }

  public persist(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      console.warn("[DB] Error persisting database to disk:", err);
    }
  }

  // Generic helpers
  public find<K extends keyof DatabaseState>(
    table: K,
    predicate?: (item: DatabaseState[K][number]) => boolean
  ): DatabaseState[K] {
    if (!predicate) return [...this.state[table]] as DatabaseState[K];
    return this.state[table].filter(predicate as any) as DatabaseState[K];
  }

  public findById<K extends keyof DatabaseState>(
    table: K,
    id: string
  ): DatabaseState[K][number] | null {
    const item = (this.state[table] as any[]).find((i) => i.id === id);
    return item ? { ...item } : null;
  }

  public insert<K extends keyof DatabaseState>(
    table: K,
    item: Omit<DatabaseState[K][number], "id" | "created_at" | "updated_at"> & { id?: string }
  ): DatabaseState[K][number] {
    const now = new Date().toISOString();
    const newItem: any = {
      id: item.id || `rec_${crypto.randomBytes(6).toString("hex")}`,
      created_at: now,
      updated_at: now,
      ...item
    };
    (this.state[table] as any[]).push(newItem);
    this.persist();
    return newItem;
  }

  public update<K extends keyof DatabaseState>(
    table: K,
    id: string,
    updates: Partial<DatabaseState[K][number]>
  ): DatabaseState[K][number] | null {
    const items = this.state[table] as any[];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return items[index];
  }

  public delete<K extends keyof DatabaseState>(table: K, id: string): boolean {
    const items = this.state[table] as any[];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    this.persist();
    return true;
  }

  public count<K extends keyof DatabaseState>(table: K): number {
    return this.state[table].length;
  }

  // Audit activity logger
  public logActivity(userId: string, entityType: string, entityId: string, action: string, description: string): void {
    this.insert("activities", {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      description
    } as any);
  }

  // Notification dispatcher
  public notify(userId: string, title: string, message: string, type: "info" | "approval" | "deadline" | "mention" | "alert" = "info", link: string = ""): void {
    this.insert("notifications", {
      user_id: userId,
      title,
      message,
      type,
      is_read: 0,
      link
    } as any);
  }
}

export const db = new SQLiteEngine();
