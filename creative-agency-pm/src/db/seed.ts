import { db } from "./database";
import { AuthService } from "../auth/auth";

export function seedDatabase() {
  if (db.count("users") > 0) {
    return; // Already seeded
  }

  console.log("[DB] Seeding Aura Studio Creative Agency database...");

  // 1. Users
  const pw1 = AuthService.hashPassword("creative2026!");
  const userAdmin = db.insert("users", {
    id: "usr_admin",
    name: "Elena Rostova",
    email: "elena@aurastudio.design",
    password_hash: pw1.hash,
    salt: pw1.salt,
    role: "admin",
    title: "Executive Creative Director",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "active"
  });

  const pw2 = AuthService.hashPassword("creative2026!");
  const userLead = db.insert("users", {
    id: "usr_lead",
    name: "Marcus Vance",
    email: "marcus@aurastudio.design",
    password_hash: pw2.hash,
    salt: pw2.salt,
    role: "lead",
    title: "Head of Brand Identity",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "active"
  });

  const pw3 = AuthService.hashPassword("creative2026!");
  const userDesigner = db.insert("users", {
    id: "usr_designer",
    name: "Sora Takahashi",
    email: "sora@aurastudio.design",
    password_hash: pw3.hash,
    salt: pw3.salt,
    role: "designer",
    title: "Senior Motion & 3D Designer",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    status: "active"
  });

  const pw4 = AuthService.hashPassword("creative2026!");
  const userCopy = db.insert("users", {
    id: "usr_copy",
    name: "Liam O'Connor",
    email: "liam@aurastudio.design",
    password_hash: pw4.hash,
    salt: pw4.salt,
    role: "copywriter",
    title: "Lead Creative Copywriter",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "active"
  });

  const pw5 = AuthService.hashPassword("client2026!");
  const userClient = db.insert("users", {
    id: "usr_client",
    name: "Sarah Jenkins",
    email: "sarah@apexathletic.com",
    password_hash: pw5.hash,
    salt: pw5.salt,
    role: "client",
    title: "VP Brand Marketing (Client)",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "active"
  });

  // 2. Clients
  const client1 = db.insert("clients", {
    id: "cli_apex",
    name: "Apex Athletic Global",
    company: "Apex Sportswear International",
    contact_email: "brand@apexathletic.com",
    phone: "+1 (415) 890-2341",
    tier: "VIP Enterprise",
    status: "active",
    notes: "Key enterprise client. Q3 global rebranding campaign."
  });

  const client2 = db.insert("clients", {
    id: "cli_lumina",
    name: "Lumina Electric Mobility",
    company: "Lumina EV Labs",
    contact_email: "press@luminaev.io",
    phone: "+1 (212) 441-9011",
    tier: "Retainer",
    status: "active",
    notes: "Monthly design retainer for digital in-dash vehicle UI."
  });

  const client3 = db.insert("clients", {
    id: "cli_zenith",
    name: "Zenith Soundworks",
    company: "Zenith Spatial Audio",
    contact_email: "hello@zenithaudio.co",
    phone: "+44 20 7946 0912",
    tier: "Standard",
    status: "active",
    notes: "Album art direction & interactive microsite."
  });

  // 3. Projects
  const proj1 = db.insert("projects", {
    id: "prj_apex_rebrand",
    client_id: client1.id,
    name: "Apex 2026 Global Brand Transformation",
    code: "APX-2026",
    description: "Complete visual identity overhaul, design token architecture, 3D campaign visuals and packaging design system.",
    status: "Review & Approvals",
    priority: "Urgent",
    budget: 145000,
    spent: 98400,
    start_date: "2026-06-01",
    due_date: "2026-09-15",
    lead_id: userLead.id
  });

  const proj2 = db.insert("projects", {
    id: "prj_lumina_os",
    client_id: client2.id,
    name: "Lumina HyperScreen Vehicle UI",
    code: "LUM-UI",
    description: "Next-gen spatial HUD cockpit interface design, tactile animations, and night-mode telemetry graphics.",
    status: "Concept Design",
    priority: "High",
    budget: 92000,
    spent: 41200,
    start_date: "2026-07-10",
    due_date: "2026-10-30",
    lead_id: userDesigner.id
  });

  const proj3 = db.insert("projects", {
    id: "prj_zenith_microsite",
    client_id: client3.id,
    name: "Zenith Spatial Sound Interactive Experience",
    code: "ZEN-WEB",
    description: "WebGL interactive 3D audio visualizer and product launch showcase.",
    status: "Production",
    priority: "Medium",
    budget: 48000,
    spent: 33500,
    start_date: "2026-07-01",
    due_date: "2026-08-30",
    lead_id: userLead.id
  });

  // 4. Tasks (Kanban)
  const task1 = db.insert("tasks", {
    id: "tsk_01",
    project_id: proj1.id,
    title: "Synthesize 3D Dynamic Monogram Logo",
    description: "Render high-poly 3D animated monogram in gold chrome and matte obsidian textures.",
    status: "Client Review",
    priority: "Urgent",
    assignee_id: userDesigner.id,
    due_date: "2026-08-28",
    estimated_hours: 24,
    logged_hours: 22
  });

  const task2 = db.insert("tasks", {
    id: "tsk_02",
    project_id: proj1.id,
    title: "Brand Voice & Campaign Manifesto Copy",
    description: "Draft 5 punchy tagline variants and 500-word launch manifesto for billboard & digital spots.",
    status: "Approved",
    priority: "High",
    assignee_id: userCopy.id,
    due_date: "2026-08-20",
    estimated_hours: 16,
    logged_hours: 15
  });

  const task3 = db.insert("tasks", {
    id: "tsk_03",
    project_id: proj1.id,
    title: "Sustainable Apparel Hangtag Packaging Guidelines",
    description: "Define paper grain specifications, foil stamping dies, and recyclable QR code placement.",
    status: "In Design",
    priority: "Medium",
    assignee_id: userLead.id,
    due_date: "2026-09-02",
    estimated_hours: 18,
    logged_hours: 8
  });

  const task4 = db.insert("tasks", {
    id: "tsk_04",
    project_id: proj2.id,
    title: "Spatial HUD Glassmorphism Dial Components",
    description: "Design reactive speed and battery gauges with sub-millisecond tactile feedback glow.",
    status: "In Design",
    priority: "High",
    assignee_id: userDesigner.id,
    due_date: "2026-09-10",
    estimated_hours: 32,
    logged_hours: 14
  });

  const task5 = db.insert("tasks", {
    id: "tsk_05",
    project_id: proj3.id,
    title: "Three.js Particle Audio Wave Simulation",
    description: "Optimize GLSL shader pass for 60fps rendering on mobile web browsers.",
    status: "Backlog",
    priority: "Medium",
    assignee_id: userDesigner.id,
    due_date: "2026-09-01",
    estimated_hours: 20,
    logged_hours: 0
  });

  const task6 = db.insert("tasks", {
    id: "tsk_06",
    project_id: proj1.id,
    title: "Color Harmony & Typography Design Tokens",
    description: "Export Figma Variables into semantic CSS / Tailwind design tokens.",
    status: "Completed",
    priority: "High",
    assignee_id: userLead.id,
    due_date: "2026-08-15",
    estimated_hours: 12,
    logged_hours: 12
  });

  // 5. Approvals
  db.insert("approvals", {
    id: "appr_01",
    project_id: proj1.id,
    task_id: task1.id,
    title: "Apex 3D Monogram & Hero Keyframe Sign-off",
    status: "Pending",
    requested_by: userDesigner.id,
    approved_by: "",
    comments: "Ready for client executive review. 4K renders attached.",
    requested_at: "2026-08-24T10:15:00Z",
    reviewed_at: null
  });

  db.insert("approvals", {
    id: "appr_02",
    project_id: proj1.id,
    task_id: task2.id,
    title: "Global Launch Manifesto Copy Deck",
    status: "Approved",
    requested_by: userCopy.id,
    approved_by: userClient.id,
    comments: "Approved without changes. Excellent narrative energy!",
    requested_at: "2026-08-19T14:00:00Z",
    reviewed_at: "2026-08-20T09:30:00Z"
  });

  // 6. Files
  db.insert("files", {
    id: "fil_01",
    project_id: proj1.id,
    task_id: task1.id,
    filename: "apex_monogram_v4_4k.png",
    original_name: "Apex_Monogram_Hero_4K.png",
    mime_type: "image/png",
    size_bytes: 4892011,
    uploaded_by: userDesigner.id,
    version: 4,
    tags: ["3D", "Brand", "Keyframe", "Approved"]
  });

  db.insert("files", {
    id: "fil_02",
    project_id: proj1.id,
    task_id: task2.id,
    filename: "apex_manifesto_final.pdf",
    original_name: "Apex_Manifesto_Final_v2.pdf",
    mime_type: "application/pdf",
    size_bytes: 1250440,
    uploaded_by: userCopy.id,
    version: 2,
    tags: ["Copy", "Manifesto", "Deck"]
  });

  // 7. Comments
  db.insert("comments", {
    id: "cmt_01",
    entity_type: "task",
    entity_id: task1.id,
    author_id: userClient.id,
    content: "The gold reflection on the monogram is breathtaking! Can we ensure the mobile app icon has sufficient contrast against white backgrounds?"
  });

  db.insert("comments", {
    id: "cmt_02",
    entity_type: "task",
    entity_id: task1.id,
    author_id: userDesigner.id,
    content: "Absolutely Sarah. I added a subtle 10% dark halo under the rim for light mode icon contrast."
  });

  // 8. Notifications
  db.insert("notifications", {
    id: "notif_01",
    user_id: userAdmin.id,
    title: "Approval Requested",
    message: "Sora Takahashi requested client sign-off for Apex 3D Monogram.",
    type: "approval",
    is_read: 0,
    link: "/#approvals"
  });

  db.insert("notifications", {
    id: "notif_02",
    user_id: userDesigner.id,
    title: "Client Feedback Received",
    message: "Sarah Jenkins commented on task 'Synthesize 3D Dynamic Monogram Logo'.",
    type: "mention",
    is_read: 1,
    link: "/#tasks"
  });

  // 9. Initial Activities
  db.logActivity(userAdmin.id, "project", proj1.id, "PROJECT_CREATED", "Initialized project 'Apex 2026 Global Brand Transformation'");
  db.logActivity(userDesigner.id, "approval", "appr_01", "APPROVAL_REQUESTED", "Submitted 3D Monogram for client sign-off");
  db.logActivity(userClient.id, "approval", "appr_02", "APPROVAL_GRANTED", "Sarah Jenkins approved Manifesto Copy Deck");

  console.log("[DB] Database seeded successfully with 5 users, 3 clients, 3 projects, 6 tasks, 2 approvals, 2 files, 2 comments!");
}
