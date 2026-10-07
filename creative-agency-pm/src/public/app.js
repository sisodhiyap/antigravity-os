// Aura Studio OS — Frontend Client Engine

// Global State
let currentTab = "dashboard";
let projectsCache = [];
let clientsCache = [];
let teamCache = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupTheme();
  setupSearch();
  setupNotifications();
  loadAllData();
});

// 1. Navigation & Tabs
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  document.getElementById("btn-quick-create")?.addEventListener("click", () => {
    openModal("modal-project");
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.getAttribute("data-tab") === tabId));
  document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.toggle("active", pane.id === `tab-${tabId}`));
}

// 2. Theme Switching (Dark / Light)
function setupTheme() {
  const themeBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const savedTheme = localStorage.getItem("aura_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";

  themeBtn?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("aura_theme", next);
    themeIcon.textContent = next === "dark" ? "🌙" : "☀️";
  });
}

// 3. Search Engine
function setupSearch() {
  const searchInput = document.getElementById("global-search-input");
  const dropdown = document.getElementById("search-dropdown");

  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  searchInput?.addEventListener("input", async (e) => {
    const q = e.target.value.trim();
    if (!q) {
      dropdown.classList.remove("active");
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (json.results && json.results.length > 0) {
      dropdown.innerHTML = json.results
        .map(
          (r) => `
        <div class="search-item" onclick="handleSearchResultClick('${r.type}', '${r.id}')">
          <div>
            <strong>${r.title}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${r.subtitle}</div>
          </div>
          <span class="badge badge-outline">${r.type}</span>
        </div>`
        )
        .join("");
      dropdown.classList.add("active");
    } else {
      dropdown.innerHTML = `<div style="padding: 0.8rem; font-size: 0.85rem; color: var(--text-muted);">No results found</div>`;
      dropdown.classList.add("active");
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      dropdown?.classList.remove("active");
    }
  });
}

function handleSearchResultClick(type, id) {
  document.getElementById("search-dropdown")?.classList.remove("active");
  if (type === "project") switchTab("projects");
  else if (type === "task") switchTab("kanban");
  else if (type === "client") switchTab("clients");
  else if (type === "file") switchTab("vault");
}

// 4. Notifications Engine
function setupNotifications() {
  const notifBtn = document.getElementById("notif-btn");
  const notifDropdown = document.getElementById("notif-dropdown");
  const markReadBtn = document.getElementById("mark-all-read-btn");

  notifBtn?.addEventListener("click", () => {
    notifDropdown?.classList.toggle("active");
  });

  markReadBtn?.addEventListener("click", async () => {
    await fetch("/api/notifications/mark-read", { method: "POST" });
    loadNotifications();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".notif-wrapper")) {
      notifDropdown?.classList.remove("active");
    }
  });
}

async function loadNotifications() {
  const res = await fetch("/api/notifications");
  const json = await res.json();
  const list = document.getElementById("notif-list");
  const dot = document.getElementById("notif-badge");

  if (dot) dot.style.display = json.unread_count > 0 ? "block" : "none";
  if (list && json.data) {
    list.innerHTML = json.data
      .map(
        (n) => `
      <div style="padding: 0.6rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.85rem;">
        <strong>${n.title}</strong>
        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem;">${n.message}</p>
        <span style="font-size: 0.7rem; color: var(--primary);">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>`
      )
      .join("");
  }
}

// 5. Load All Data
async function loadAllData() {
  await Promise.all([
    loadAnalytics(),
    loadProjects(),
    loadTasks(),
    loadApprovals(),
    loadClients(),
    loadFiles(),
    loadTeam(),
    loadActivities(),
    loadNotifications()
  ]);
}

// Analytics View
async function loadAnalytics() {
  const res = await fetch("/api/analytics");
  const data = await res.json();

  document.getElementById("kpi-active-projects").textContent = data.kpis.active_projects;
  document.getElementById("kpi-pending-approvals").textContent = data.kpis.pending_approvals;
  document.getElementById("kpi-budget").textContent = `$${data.kpis.total_budget.toLocaleString()}`;
  document.getElementById("kpi-margin").textContent = `${data.kpis.margin_percent}%`;

  // Render SVG Chart for Sprint Velocity
  const chart = document.getElementById("velocity-chart");
  if (chart && data.velocity) {
    const maxVal = 40;
    const bars = data.velocity
      .map((d, i) => {
        const h = (d.hoursLogged / maxVal) * 160;
        const x = 30 + i * 85;
        return `
        <rect x="${x}" y="${180 - h}" width="42" height="${h}" rx="6" fill="url(#cyanGrad)" />
        <text x="${x + 21}" y="200" fill="var(--text-muted)" font-size="12" text-anchor="middle">${d.day}</text>
        <text x="${x + 21}" y="${170 - h}" fill="var(--primary)" font-size="11" font-weight="700" text-anchor="middle">${d.hoursLogged}h</text>
      `;
      })
      .join("");

    chart.innerHTML = `
      <svg viewBox="0 0 460 220" style="width: 100%; height: 220px;">
        <defs>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#2563eb" />
          </linearGradient>
        </defs>
        ${bars}
      </svg>`;
  }

  // Pipeline breakdown
  const pipe = document.getElementById("pipeline-breakdown");
  if (pipe && data.task_distribution) {
    const total = data.kpis.total_tasks || 1;
    pipe.innerHTML = Object.entries(data.task_distribution)
      .map(([status, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
        <div style="margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.25rem;">
            <span>${status}</span>
            <span style="color: var(--text-muted);">${count} (${pct}%)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>`;
      })
      .join("");
  }
}

// Projects View
async function loadProjects() {
  const res = await fetch("/api/projects");
  const json = await res.json();
  projectsCache = json.data || [];

  document.getElementById("badge-projects").textContent = projectsCache.length;
  const container = document.getElementById("projects-container");
  const selectProj = document.getElementById("select-task-project");
  const selectAppr = document.getElementById("select-approval-project");
  const selectFile = document.getElementById("select-file-project");

  if (selectProj) {
    selectProj.innerHTML = projectsCache.map((p) => `<option value="${p.id}">${p.name} (${p.code})</option>`).join("");
  }
  if (selectAppr) {
    selectAppr.innerHTML = selectProj ? selectProj.innerHTML : "";
  }
  if (selectFile) {
    selectFile.innerHTML = selectProj ? selectProj.innerHTML : "";
  }

  if (container) {
    container.innerHTML = projectsCache
      .map(
        (p) => `
      <div class="project-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <span class="badge badge-outline">${p.code}</span>
            <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--primary);">${p.status}</span>
          </div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">${p.name}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${p.description}</p>
        </div>

        <div style="margin-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
            <span>Sprint Progress</span>
            <span style="font-weight: 700; color: var(--accent);">${p.progress_percent}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${p.progress_percent}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-top: 0.75rem;">
            <span>Budget: <strong>$${p.budget.toLocaleString()}</strong></span>
            <span>Due: <strong>${p.due_date}</strong></span>
          </div>
        </div>
      </div>`
      )
      .join("");
  }
}

// Kanban Tasks View
async function loadTasks() {
  const res = await fetch("/api/tasks");
  const json = await res.json();
  const tasks = json.data || [];

  document.getElementById("badge-tasks").textContent = tasks.length;

  const cols = ["Backlog", "In Design", "Client Review", "Approved", "Completed"];
  cols.forEach((colName) => {
    const colId = "col-" + colName.replace(/\s+/g, "-");
    const countId = "count-" + colName;
    const container = document.getElementById(colId);
    const countEl = document.getElementById(countId);

    const filtered = tasks.filter((t) => t.status === colName);
    if (countEl) countEl.textContent = filtered.length;

    if (container) {
      container.innerHTML = filtered
        .map(
          (t) => `
        <div class="task-card" id="task-${t.id}">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="badge" style="font-size: 0.7rem; background: rgba(255,255,255,0.06);">${t.project_name}</span>
            <span class="badge" style="font-size: 0.7rem; background: ${getPriorityColor(t.priority)};">${t.priority}</span>
          </div>
          <h4 style="font-size: 0.9rem; margin-bottom: 0.4rem;">${t.title}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem;">${t.description || ""}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
            <span>${t.assignee_name}</span>
            <select class="input" style="width: auto; padding: 0.2rem 0.4rem; font-size: 0.7rem;" onchange="moveTask('${t.id}', this.value)">
              ${cols.map((c) => `<option value="${c}" ${c === colName ? "selected" : ""}>Move: ${c}</option>`).join("")}
            </select>
          </div>
        </div>`
        )
        .join("");
    }
  });
}

function getPriorityColor(p) {
  if (p === "Urgent") return "rgba(239, 68, 68, 0.2); color: #f87171";
  if (p === "High") return "rgba(245, 158, 11, 0.2); color: #fbbf24";
  return "rgba(56, 189, 248, 0.2); color: #38bdf8";
}

async function moveTask(taskId, newStatus) {
  await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  });
  loadTasks();
  loadAnalytics();
  loadActivities();
}

// Approvals View
async function loadApprovals() {
  const res = await fetch("/api/approvals");
  const json = await res.json();
  const approvals = json.data || [];

  const pendingCount = approvals.filter((a) => a.status === "Pending").length;
  document.getElementById("badge-approvals").textContent = pendingCount;
  const container = document.getElementById("approvals-container");

  if (container) {
    container.innerHTML = approvals
      .map(
        (a) => `
      <div class="approval-card">
        <div>
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
            <span class="badge" style="background: ${a.status === "Approved" ? "rgba(16, 185, 129, 0.2); color: #34d399" : a.status === "Pending" ? "rgba(245, 158, 11, 0.2); color: #fbbf24" : "rgba(239, 68, 68, 0.2); color: #f87171"};">${a.status}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${a.project_name}</span>
          </div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${a.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${a.comments || ""}</p>
          <div style="font-size: 0.75rem; color: var(--text-faint); margin-top: 0.5rem;">
            Requested by <strong>${a.requested_by_name}</strong> on ${new Date(a.requested_at).toLocaleDateString()}
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          ${
            a.status === "Pending"
              ? `
            <button class="btn btn-secondary" onclick="reviewApproval('${a.id}', 'Changes Requested')">Request Changes</button>
            <button class="btn btn-primary" onclick="reviewApproval('${a.id}', 'Approved')">✓ Approve Asset</button>
          `
              : `<span style="font-size: 0.85rem; color: var(--text-muted);">Reviewed: ${a.reviewed_at ? new Date(a.reviewed_at).toLocaleDateString() : ""}</span>`
          }
        </div>
      </div>`
      )
      .join("");
  }
}

async function reviewApproval(approvalId, status) {
  await fetch(`/api/approvals/${approvalId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadApprovals();
  loadAnalytics();
  loadActivities();
}

// Clients View
async function loadClients() {
  const res = await fetch("/api/clients");
  const json = await res.json();
  clientsCache = json.data || [];

  const selectProjClient = document.getElementById("select-project-client");
  if (selectProjClient) {
    selectProjClient.innerHTML = clientsCache.map((c) => `<option value="${c.id}">${c.name} (${c.company})</option>`).join("");
  }

  const container = document.getElementById("clients-container");
  if (container) {
    container.innerHTML = clientsCache
      .map(
        (c) => `
      <div class="client-card">
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="badge badge-outline">${c.tier}</span>
            <span class="badge" style="background: rgba(16,185,129,0.15); color: var(--accent);">${c.status}</span>
          </div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${c.company}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${c.name} • ${c.contact_email}</p>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-faint); margin-top: 1rem;">${c.notes || "Active enterprise relationship."}</p>
      </div>`
      )
      .join("");
  }
}

// Vault Files View
async function loadFiles() {
  const res = await fetch("/api/files");
  const json = await res.json();
  const files = json.data || [];
  const container = document.getElementById("files-container");

  if (container) {
    container.innerHTML = files
      .map(
        (f) => `
      <div class="file-card">
        <div>
          <span class="badge badge-outline" style="margin-bottom: 0.5rem; display: inline-block;">v${f.version}</span>
          <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${f.original_name}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted);">${(f.size_bytes / 1024 / 1024).toFixed(2)} MB • ${f.mime_type}</p>
        </div>
        <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--primary);">Sandboxed</span>
          <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="downloadFile('${f.filename}')">Download</button>
        </div>
      </div>`
      )
      .join("");
  }
}

async function downloadFile(filename) {
  const res = await fetch(`/api/files/download?path=${encodeURIComponent(filename)}`);
  const json = await res.json();
  if (json.success) {
    alert(`[Sandboxed Vault] Verified download for: ${json.file}`);
  } else {
    alert(`Error: ${json.error}`);
  }
}

// Team View
async function loadTeam() {
  const res = await fetch("/api/team");
  const json = await res.json();
  teamCache = json.data || [];

  const selectAssignee = document.getElementById("select-task-assignee");
  if (selectAssignee) {
    selectAssignee.innerHTML = teamCache.map((u) => `<option value="${u.id}">${u.name} (${u.title})</option>`).join("");
  }

  const container = document.getElementById("team-container");
  if (container) {
    container.innerHTML = teamCache
      .map(
        (u) => `
      <div class="team-card">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}" class="avatar" style="width: 48px; height: 48px;">
          <div>
            <h4 style="font-size: 1rem;">${u.name}</h4>
            <span style="font-size: 0.8rem; color: var(--primary);">${u.title}</span>
          </div>
        </div>
        <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; font-size: 0.8rem;">
          <span>Active Tasks: <strong>${u.active_task_count}</strong></span>
          <span>Completed: <strong>${u.completed_task_count}</strong></span>
        </div>
      </div>`
      )
      .join("");
  }
}

// Activity Timeline View
async function loadActivities() {
  const res = await fetch("/api/activities");
  const json = await res.json();
  const activities = json.data || [];
  const container = document.getElementById("activity-timeline");

  if (container) {
    container.innerHTML = activities
      .map(
        (a) => `
      <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 1rem; align-items: center; font-size: 0.85rem;">
        <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--primary); font-size: 0.7rem;">${a.action}</span>
        <div style="flex: 1;">
          <strong>${a.user_name}</strong> ${a.description}
        </div>
        <span style="color: var(--text-faint); font-size: 0.75rem;">${new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>`
      )
      .join("");
  }
}

// Modal Handlers
function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

async function handleCreateProject(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    client_id: form.client_id.value,
    code: form.code.value,
    priority: form.priority.value,
    budget: form.budget.value,
    due_date: form.due_date.value,
    description: form.description.value
  };
  await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  closeModal("modal-project");
  form.reset();
  loadAllData();
}

async function handleCreateTask(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.title.value,
    project_id: form.project_id.value,
    assignee_id: form.assignee_id.value,
    priority: form.priority.value,
    estimated_hours: form.estimated_hours.value,
    due_date: form.due_date.value,
    description: form.description.value
  };
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  closeModal("modal-task");
  form.reset();
  loadTasks();
  loadAnalytics();
  loadActivities();
}

async function handleCreateApproval(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    title: form.title.value,
    project_id: form.project_id.value,
    comments: form.comments.value
  };
  await fetch("/api/approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  closeModal("modal-approval");
  form.reset();
  loadApprovals();
  loadAnalytics();
  loadActivities();
}

async function handleCreateClient(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    company: form.company.value,
    contact_email: form.contact_email.value,
    tier: form.tier.value
  };
  await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  closeModal("modal-client");
  form.reset();
  loadClients();
  loadAnalytics();
}

async function handleCreateFile(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    filename: form.filename.value,
    project_id: form.project_id.value,
    mime_type: form.mime_type.value,
    version: form.version.value
  };
  await fetch("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  closeModal("modal-file");
  form.reset();
  loadFiles();
}
