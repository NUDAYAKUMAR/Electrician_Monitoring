/* =========================================
   Electrician Contractor Management System
   Main JavaScript
   ========================================= */

'use strict';

/* ---- Mock Data Store ---- */
const MOCK_DATA = {
  users: [
    { id: 1, name: 'Divya', email: 'admin@gmail.com', password: 'admin123', role: 'admin', phone: '+91 70195 17964', avatar: 'DV', status: 'active' },
    { id: 2, name: 'Kavya', email: 'electrician@gmail.com', password: 'elec123', role: 'electrician', phone: '+91 70195 17977', avatar: 'KV', status: 'active', specialization: 'Industrial', rating: 4.8 },
    { id: 3, name: 'Soumya', email: 'user1@gmail.com', password: 'user123', role: 'user', phone: '+91 70195 17988', avatar: 'SO', status: 'active' },
    { id: 4, name: 'Ranjeetha', email: 'chris@gmail.com', password: 'pass123', role: 'electrician', phone: '+91 70195 17999', avatar: 'RA', status: 'active', specialization: 'Residential', rating: 4.5 },
    { id: 5, name: 'Reena', email: 'dana@gmail.com', password: 'pass123', role: 'electrician', phone: '+91 70195 18000', avatar: 'RE', status: 'inactive', specialization: 'Commercial', rating: 4.2 },
    { id: 6, name: 'Prema', email: 'pat@gmail.com', password: 'pass123', role: 'electrician', phone: '+91 70195 18011', avatar: 'PR', status: 'active', specialization: 'Solar', rating: 4.9 },
  ],
  jobs: [
    { id: 1, title: 'Residential Rewiring', location: 'No. 45, 3rd Cross, Vijayanagar, Mysuru', assignedTo: 2, deadline: '2026-04-10', status: 'inprogress', priority: 'high', desc: 'Full rewiring of 3-bed house' },
    { id: 2, title: 'Commercial Panel Upgrade', location: 'No. 200, Brigade Road, Hubli', assignedTo: 4, deadline: '2026-04-15', status: 'pending', priority: 'medium', desc: 'Upgrade 200A to 400A panel' },
    { id: 3, title: 'Solar Installation', location: 'No. 78, Kuvempunagar, Hubli', assignedTo: 6, deadline: '2026-04-08', status: 'completed', priority: 'low', desc: '12-panel rooftop solar system' },
    { id: 4, title: 'Industrial Wiring', location: 'Peenya Industrial Area, Bengaluru', assignedTo: 2, deadline: '2026-05-01', status: 'pending', priority: 'high', desc: 'New factory floor wiring' },
    { id: 5, title: 'Office Renovation', location: 'Whitefield IT Park, Bengaluru', assignedTo: 5, deadline: '2026-04-20', status: 'cancelled', priority: 'low', desc: 'Rewire open office floor' },
    { id: 6, title: 'Outdoor Lighting', location: 'KRS Road Park Area, Mysuru', assignedTo: 4, deadline: '2026-04-25', status: 'inprogress', priority: 'medium', desc: 'Install pathway lighting' },
  ],
  tasks: [
    { id: 1, title: 'Inspect existing wiring', jobId: 1, assignedTo: 2, progress: 100, status: 'completed', due: '2026-03-28' },
    { id: 2, title: 'Install new conduit', jobId: 1, assignedTo: 2, progress: 65, status: 'inprogress', due: '2026-04-05' },
    { id: 3, title: 'Source panel components', jobId: 2, assignedTo: 4, progress: 30, status: 'pending', due: '2026-04-12' },
    { id: 4, title: 'Panel mounting', jobId: 2, assignedTo: 4, progress: 0, status: 'pending', due: '2026-04-14' },
    { id: 5, title: 'Mount solar panels', jobId: 3, assignedTo: 6, progress: 100, status: 'completed', due: '2026-04-06' },
    { id: 6, title: 'Inverter wiring', jobId: 3, assignedTo: 6, progress: 100, status: 'completed', due: '2026-04-07' },
    { id: 7, title: 'Load capacity analysis', jobId: 4, assignedTo: 2, progress: 20, status: 'inprogress', due: '2026-04-15' },
    { id: 8, title: 'Conduit pathway planning', jobId: 4, assignedTo: 2, progress: 0, status: 'pending', due: '2026-04-20' },
  ],
  materials: [
    { id: 1, name: 'Copper Wire (12AWG)', qty: 500, unit: 'ft', used: 230, category: 'Wire' },
    { id: 2, name: 'Circuit Breaker 20A', qty: 48, unit: 'pcs', used: 15, category: 'Breakers' },
    { id: 3, name: 'PVC Conduit 1"', qty: 200, unit: 'ft', used: 80, category: 'Conduit' },
    { id: 4, name: 'Junction Box', qty: 30, unit: 'pcs', used: 12, category: 'Boxes' },
    { id: 5, name: 'LED Panel 60x60', qty: 40, unit: 'pcs', used: 28, category: 'Lighting' },
    { id: 6, name: 'Copper Wire (14AWG)', qty: 300, unit: 'ft', used: 145, category: 'Wire' },
    { id: 7, name: 'GFCI Outlet', qty: 25, unit: 'pcs', used: 10, category: 'Outlets' },
    { id: 8, name: 'Electrical Tape', qty: 60, unit: 'rolls', used: 22, category: 'Supplies' },
  ],
};

/* ---- Session ---- */
let currentUser = null;

function getSession() {
  const s = sessionStorage.getItem('ecms_user');
  if (s) currentUser = JSON.parse(s);
  return currentUser;
}

function setSession(user) {
  currentUser = user;
  sessionStorage.setItem('ecms_user', JSON.stringify(user));
}

function clearSession() {
  currentUser = null;
  sessionStorage.removeItem('ecms_user');
}

/* ---- Auth ---- */
function login(emailOrUser, password) {
  const user = MOCK_DATA.users.find(u =>
    (u.email === emailOrUser || u.name.toLowerCase() === emailOrUser.toLowerCase()) &&
    u.password === password
  );
  if (!user) return null;
  setSession(user);
  return user;
}

function register(data) {
  const exists = MOCK_DATA.users.find(u => u.email === data.email);
  if (exists) return { error: 'Email already registered.' };
  const newUser = {
    id: MOCK_DATA.users.length + 1,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    role: data.role,
    avatar: data.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(),
    status: 'active',
    specialization: data.role === 'electrician' ? 'General' : '',
    rating: 0,
  };
  MOCK_DATA.users.push(newUser);
  setSession(newUser);
  return { user: newUser };
}

/* ---- Guard ---- */
function requireAuth() {
  if (!getSession()) {
    window.location.href = '../pages/login.html';
    return false;
  }
  return true;
}

function requireRole(...roles) {
  const u = getSession();
  if (!u || !roles.includes(u.role)) {
    window.location.href = '../pages/login.html';
    return false;
  }
  return true;
}

/* ---- Redirect after login ---- */
function redirectDashboard(role) {
  const map = {
    admin: 'admin-dashboard.html',
    electrician: 'elec-dashboard.html',
    user: 'user-dashboard.html',
  };
  window.location.href = map[role] || 'login.html';
}

/* ---- Toast Notifications ---- */
function showToast(msg, type = 'info') {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-circle' };
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]} toast-icon"></i><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = '.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ---- Modal ---- */
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
function closeAllModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open')); }

/* ---- Sidebar Toggle ---- */
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const hamburger = document.querySelector('.hamburger');
  if (!sidebar) return;
  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
  // Active link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === currentPage) item.classList.add('active');
    item.addEventListener('click', () => {
      window.location.href = item.dataset.page;
    });
  });
  // Logout
  document.querySelector('.logout-btn')?.addEventListener('click', () => {
    clearSession();
    window.location.href = '../index.html';
  });
}

/* ---- Render Sidebar User ---- */
function renderSidebarUser() {
  const u = getSession();
  if (!u) return;
  const nameEl = document.querySelector('.sidebar-user .name');
  const roleEl = document.querySelector('.sidebar-user .role');
  const avatarEl = document.querySelector('.sidebar-user .user-avatar');
  const badgeEl = document.querySelector('.sidebar-user .role-badge');
  if (nameEl) nameEl.textContent = u.name;
  if (roleEl) roleEl.textContent = u.role;
  if (avatarEl) avatarEl.textContent = u.avatar || u.name[0];
  if (badgeEl) {
    badgeEl.textContent = u.role;
    badgeEl.className = `role-badge role-${u.role}`;
  }
}

/* ---- Helpers ---- */
function getUserById(id) { return MOCK_DATA.users.find(u => u.id === id); }
function getElectricians() { return MOCK_DATA.users.filter(u => u.role === 'electrician'); }
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function statusBadge(status) {
  const map = {
    active: 'badge-active', pending: 'badge-pending',
    completed: 'badge-completed', cancelled: 'badge-cancelled',
    inprogress: 'badge-inprogress', inactive: 'badge-cancelled',
  };
  const label = { active:'Active', pending:'Pending', completed:'Completed', cancelled:'Cancelled', inprogress:'In Progress', inactive:'Inactive' };
  return `<span class="status-badge ${map[status]||''}">${label[status]||status}</span>`;
}
function priorityBadge(p) {
  const map = { high:'badge-cancelled', medium:'badge-pending', low:'badge-completed' };
  return `<span class="status-badge ${map[p]||''}">${p}</span>`;
}
function avatarColor(idx) {
  const colors = ['#1e6fd9','#00b37d','#f5a623','#e5303a','#7c3aed','#0ea5e9'];
  return colors[idx % colors.length];
}

/* ---- Table Search ---- */
function initTableSearch(inputSel, tableSel) {
  const input = document.querySelector(inputSel);
  const rows = document.querySelectorAll(`${tableSel} tbody tr`);
  if (!input) return;
  input.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ---- Confirm Dialog ---- */
function confirmAction(msg, callback) {
  if (confirm(msg)) callback();
}

/* ---- Scroll nav styling ---- */
function initScrollNav() {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ---- Login Form ---- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const emailVal = form.querySelector('#loginEmail').value.trim();
    const passVal = form.querySelector('#loginPass').value;
    if (!emailVal || !passVal) { showToast('Please fill in all fields.', 'error'); return; }
    const user = login(emailVal, passVal);
    if (!user) { showToast('Invalid credentials. Try again.', 'error'); return; }
    showToast(`Welcome back, ${user.name}!`, 'success');
    setTimeout(() => redirectDashboard(user.role), 700);
  });
  // Demo credentials
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelector('#loginEmail').value = btn.dataset.email;
      form.querySelector('#loginPass').value = btn.dataset.pass;
    });
  });
  // Toggle password visibility
  form.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') { input.type = 'text'; btn.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
      else { input.type = 'password'; btn.innerHTML = '<i class="fas fa-eye"></i>'; }
    });
  });
}

/* ---- Register Form ---- */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      name: form.querySelector('#regName').value.trim(),
      phone: form.querySelector('#regPhone').value.trim(),
      email: form.querySelector('#regEmail').value.trim(),
      role: form.querySelector('#regRole').value,
      password: form.querySelector('#regPass').value,
    };
    if (!data.name || !data.email || !data.password || !data.role) {
      showToast('Please fill all required fields.', 'error'); return;
    }
    if (data.password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
    const result = register(data);
    if (result.error) { showToast(result.error, 'error'); return; }
    showToast('Account created! Redirecting...', 'success');
    setTimeout(() => redirectDashboard(result.user.role), 800);
  });
}

/* ---- Init on Load ---- */
document.addEventListener('DOMContentLoaded', () => {
  initScrollNav();
  initSidebar();
  renderSidebarUser();
  initLoginForm();
  initRegisterForm();

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", function () {
      // remove active from all
      navItems.forEach(i => i.classList.remove("active"));
      // add active to clicked
      this.classList.add("active");
    });
  });
});


  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Notification panel toggle
  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', e => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
    });
    document.addEventListener('click', () => notifPanel.classList.remove('open'));
    notifPanel.addEventListener('click', e => e.stopPropagation());
  }
});

/* =====================
   PAGE-SPECIFIC SCRIPTS
   ===================== */

/* ---- ADMIN DASHBOARD ---- */
function initAdminDashboard() {
  if (!requireRole('admin')) return;
  // Stat counts
  const electricians = getElectricians();
  const jobs = MOCK_DATA.jobs;
  const tasks = MOCK_DATA.tasks;
  const el = id => document.getElementById(id);
  if (el('stat-electricians')) el('stat-electricians').textContent = electricians.length;
  if (el('stat-active-jobs')) el('stat-active-jobs').textContent = jobs.filter(j => j.status === 'inprogress').length;
  if (el('stat-pending')) el('stat-pending').textContent = tasks.filter(t => t.status === 'pending').length;
  if (el('stat-completed')) el('stat-completed').textContent = jobs.filter(j => j.status === 'completed').length;

  // Recent jobs table
  const tbody = document.querySelector('#recentJobsTable tbody');
  if (tbody) {
    tbody.innerHTML = jobs.slice(0,5).map((j,i) => {
      const elec = getUserById(j.assignedTo);
      return `<tr>
        <td><span class="avatar-cell">
          <span class="avatar-sm" style="background:${avatarColor(i)}">${elec?.avatar||'?'}</span>
          ${j.title}
        </span></td>
        <td>${j.location}</td>
        <td>${elec?.name||'Unassigned'}</td>
        <td>${formatDate(j.deadline)}</td>
        <td>${statusBadge(j.status)}</td>
      </tr>`;
    }).join('');
  }

  // Activity feed
  const feed = document.getElementById('activityFeed');
  if (feed) {
    const activities = [
      { type: 'blue', icon: 'fa-bolt', text: 'Jordan Lee started Residential Rewiring', time: '2 hours ago' },
      { type: 'green', icon: 'fa-check', text: 'Solar Installation marked as completed', time: '5 hours ago' },
      { type: 'yellow', icon: 'fa-user-plus', text: 'New electrician Pat Ohm registered', time: 'Yesterday' },
      { type: 'blue', icon: 'fa-tasks', text: 'Task "Install new conduit" updated', time: 'Yesterday' },
      { type: 'red', icon: 'fa-times', text: 'Office Renovation job cancelled', time: '2 days ago' },
    ];
    feed.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-dot ${a.type}"><i class="fas ${a.icon}"></i></div>
        <div class="activity-content">
          <div class="act-title">${a.text}</div>
          <div class="act-time">${a.time}</div>
        </div>
      </div>`).join('');
  }
}

/* ---- ELECTRICIAN MANAGEMENT ---- */
function initElectricianMgmt() {
  if (!requireRole('admin')) return;
  const tbody = document.querySelector('#elecTable tbody');
  let elecs = getElectricians();
  let editId = null;

  function render(data) {
    tbody.innerHTML = data.map((e,i) => `
      <tr>
        <td><div class="avatar-cell">
          <span class="avatar-sm" style="background:${avatarColor(i)}">${e.avatar}</span>
          <div><div style="font-weight:600;color:var(--text-dark)">${e.name}</div>
          <div style="font-size:.78rem;color:var(--grey-text)">${e.email}</div></div>
        </div></td>
        <td>${e.phone}</td>
        <td>${e.specialization||'General'}</td>
        <td>${MOCK_DATA.jobs.filter(j=>j.assignedTo===e.id&&j.status==='inprogress').length}</td>
        <td>${statusBadge(e.status)}</td>
        <td class="actions-cell">
          <button class="btn-view btn-sm" onclick="viewElec(${e.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-edit btn-sm" onclick="editElec(${e.id})"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-del btn-sm" onclick="deleteElec(${e.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');
    initTableSearch('#elecSearch input', '#elecTable');
  }
  render(elecs);

  window.editElec = function(id) {
    editId = id;
    const e = MOCK_DATA.users.find(u => u.id === id);
    document.getElementById('ef-name').value = e.name;
    document.getElementById('ef-email').value = e.email;
    document.getElementById('ef-phone').value = e.phone;
    document.getElementById('ef-spec').value = e.specialization || '';
    document.getElementById('ef-status').value = e.status;
    document.getElementById('elecModalTitle').textContent = 'Edit Electrician';
    openModal('elecModal');
  };

  window.viewElec = function(id) {
    const e = MOCK_DATA.users.find(u => u.id === id);
    showToast(`Viewing ${e.name} — ${e.email}`, 'info');
  };

  window.deleteElec = function(id) {
    confirmAction('Are you sure you want to remove this electrician?', () => {
      const idx = MOCK_DATA.users.findIndex(u => u.id === id);
      if (idx > -1) { MOCK_DATA.users.splice(idx, 1); elecs = getElectricians(); render(elecs); showToast('Electrician removed.', 'success'); }
    });
  };

  document.getElementById('addElecBtn')?.addEventListener('click', () => {
    editId = null;
    document.getElementById('elecForm').reset();
    document.getElementById('elecModalTitle').textContent = 'Add Electrician';
    openModal('elecModal');
  });

  document.getElementById('elecForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('ef-name').value.trim();
    const email = document.getElementById('ef-email').value.trim();
    const phone = document.getElementById('ef-phone').value.trim();
    const spec = document.getElementById('ef-spec').value.trim();
    const status = document.getElementById('ef-status').value;
    if (editId) {
      const u = MOCK_DATA.users.find(u => u.id === editId);
      Object.assign(u, { name, email, phone, specialization: spec, status });
      showToast('Electrician updated.', 'success');
    } else {
      MOCK_DATA.users.push({ id: Date.now(), name, email, phone, role: 'electrician', password: 'pass123', avatar: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(), status, specialization: spec, rating: 0 });
      showToast('Electrician added.', 'success');
    }
    elecs = getElectricians(); render(elecs); closeModal('elecModal');
  });

  document.getElementById('cancelElecModal')?.addEventListener('click', () => closeModal('elecModal'));
}

/* ---- JOB MANAGEMENT ---- */
function initJobMgmt() {
  if (!requireAuth()) return;
  const u = getSession();
  const isAdmin = u?.role === 'admin';
  const tbody = document.querySelector('#jobTable tbody');
  let jobs = isAdmin ? MOCK_DATA.jobs : MOCK_DATA.jobs.filter(j => j.assignedTo === u.id);
  let editId = null;

  // Populate electrician select
  const elecSel = document.getElementById('jf-electrician');
  if (elecSel && isAdmin) {
    getElectricians().forEach(e => {
      elecSel.innerHTML += `<option value="${e.id}">${e.name}</option>`;
    });
  }

  function render(data) {
    tbody.innerHTML = data.map((j,i) => {
      const elec = getUserById(j.assignedTo);
      return `<tr>
        <td style="font-weight:600;color:var(--text-dark)">${j.title}</td>
        <td><i class="fas fa-map-marker-alt" style="color:var(--blue-main);margin-right:5px"></i>${j.location}</td>
        <td><div class="avatar-cell"><span class="avatar-sm" style="background:${avatarColor(i)}">${elec?.avatar||'?'}</span>${elec?.name||'—'}</div></td>
        <td>${formatDate(j.deadline)}</td>
        <td>${priorityBadge(j.priority)}</td>
        <td>${statusBadge(j.status)}</td>
        <td class="actions-cell">
          ${isAdmin ? `<button class="btn-edit btn-sm" onclick="editJob(${j.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-del btn-sm" onclick="deleteJob(${j.id})"><i class="fas fa-trash"></i></button>` :
          `<button class="btn-view btn-sm" onclick="showToast('Job details loaded','info')"><i class="fas fa-eye"></i></button>`}
        </td>
      </tr>`;
    }).join('');
  }
  render(jobs);

  window.editJob = function(id) {
    editId = id;
    const j = MOCK_DATA.jobs.find(j => j.id === id);
    document.getElementById('jf-title').value = j.title;
    document.getElementById('jf-location').value = j.location;
    document.getElementById('jf-deadline').value = j.deadline;
    document.getElementById('jf-priority').value = j.priority;
    document.getElementById('jf-status').value = j.status;
    if (elecSel) elecSel.value = j.assignedTo;
    document.getElementById('jf-desc').value = j.desc || '';
    document.getElementById('jobModalTitle').textContent = 'Edit Job';
    openModal('jobModal');
  };

  window.deleteJob = function(id) {
    confirmAction('Delete this job?', () => {
      const idx = MOCK_DATA.jobs.findIndex(j => j.id === id);
      if (idx > -1) { MOCK_DATA.jobs.splice(idx, 1); jobs = MOCK_DATA.jobs; render(jobs); showToast('Job deleted.', 'success'); }
    });
  };

  document.getElementById('addJobBtn')?.addEventListener('click', () => {
    editId = null;
    document.getElementById('jobForm')?.reset();
    document.getElementById('jobModalTitle').textContent = 'Add Job';
    openModal('jobModal');
  });

  document.getElementById('jobForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title: document.getElementById('jf-title').value.trim(),
      location: document.getElementById('jf-location').value.trim(),
      deadline: document.getElementById('jf-deadline').value,
      priority: document.getElementById('jf-priority').value,
      status: document.getElementById('jf-status').value,
      assignedTo: parseInt(elecSel?.value) || 2,
      desc: document.getElementById('jf-desc').value.trim(),
    };
    if (editId) {
      Object.assign(MOCK_DATA.jobs.find(j => j.id === editId), data);
      showToast('Job updated.', 'success');
    } else {
      MOCK_DATA.jobs.push({ id: Date.now(), ...data });
      showToast('Job created.', 'success');
    }
    jobs = isAdmin ? MOCK_DATA.jobs : MOCK_DATA.jobs.filter(j => j.assignedTo === u.id);
    render(jobs); closeModal('jobModal');
  });

  document.getElementById('cancelJobModal')?.addEventListener('click', () => closeModal('jobModal'));

  // Status filter
  document.getElementById('statusFilter')?.addEventListener('change', e => {
    const val = e.target.value;
    render(val ? jobs.filter(j => j.status === val) : jobs);
  });
}

/* ---- TASK TRACKING ---- */
function initTasks() {
  if (!requireAuth()) return;
  const u = getSession();
  const isAdmin = u?.role === 'admin';
  const tbody = document.querySelector('#taskTable tbody');
  let tasks = isAdmin ? MOCK_DATA.tasks : MOCK_DATA.tasks.filter(t => t.assignedTo === u.id);

  function render(data) {
    tbody.innerHTML = data.map(t => {
      const elec = getUserById(t.assignedTo);
      const job = MOCK_DATA.jobs.find(j => j.id === t.jobId);
      return `<tr>
        <td style="font-weight:600;color:var(--text-dark)">${t.title}</td>
        <td>${job?.title||'—'}</td>
        <td>${elec?.name||'—'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="progress-bar" style="flex:1;min-width:80px">
              <div class="progress-fill ${t.progress>=100?'green':t.progress>50?'':''}" style="width:${t.progress}%"></div>
            </div>
            <span style="font-size:.8rem;font-weight:600;color:var(--text-dark);white-space:nowrap">${t.progress}%</span>
          </div>
        </td>
        <td>${statusBadge(t.status)}</td>
        <td>${formatDate(t.due)}</td>
        <td class="actions-cell">
          ${isAdmin ? `<button class="btn-edit btn-sm" onclick="editTask(${t.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-del btn-sm" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button>` :
          `<button class="btn-primary btn-sm" onclick="updateProgress(${t.id})"><i class="fas fa-sync"></i> Update</button>`}
        </td>
      </tr>`;
    }).join('');
  }
  render(tasks);

  window.editTask = function(id) {
    const t = MOCK_DATA.tasks.find(t => t.id === id);
    const newProg = prompt(`Update progress for "${t.title}" (0-100):`, t.progress);
    if (newProg !== null) {
      t.progress = Math.min(100, Math.max(0, parseInt(newProg) || 0));
      if (t.progress === 100) t.status = 'completed';
      else if (t.progress > 0) t.status = 'inprogress';
      render(tasks); showToast('Task updated.', 'success');
    }
  };

  window.updateProgress = window.editTask;

  window.deleteTask = function(id) {
    confirmAction('Delete this task?', () => {
      const idx = MOCK_DATA.tasks.findIndex(t => t.id === id);
      if (idx > -1) { MOCK_DATA.tasks.splice(idx, 1); tasks = isAdmin ? MOCK_DATA.tasks : MOCK_DATA.tasks.filter(t => t.assignedTo === u.id); render(tasks); showToast('Task deleted.', 'success'); }
    });
  };

  document.getElementById('addTaskBtn')?.addEventListener('click', () => {
    const title = prompt('Task title:'); if (!title) return;
    MOCK_DATA.tasks.push({ id: Date.now(), title, jobId: 1, assignedTo: u.id, progress: 0, status: 'pending', due: '2026-05-01' });
    tasks = isAdmin ? MOCK_DATA.tasks : MOCK_DATA.tasks.filter(t => t.assignedTo === u.id);
    render(tasks); showToast('Task added.', 'success');
  });
}

/* ---- MATERIALS ---- */
function initMaterials() {
  if (!requireAuth()) return;
  const u = getSession();
  const isAdmin = u?.role === 'admin';
  const tbody = document.querySelector('#matTable tbody');
  let mats = MOCK_DATA.materials;

  function render(data) {
    tbody.innerHTML = data.map(m => {
      const pct = Math.round((m.used / m.qty) * 100);
      return `<tr>
        <td style="font-weight:600;color:var(--text-dark)">${m.name}</td>
        <td>${m.category}</td>
        <td>${m.qty} ${m.unit}</td>
        <td>${m.used} ${m.unit}</td>
        <td>${m.qty - m.used} ${m.unit}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="progress-bar" style="flex:1">
              <div class="progress-fill ${pct>80?'yellow':''}" style="width:${pct}%"></div>
            </div>
            <span style="font-size:.8rem;font-weight:600;white-space:nowrap">${pct}%</span>
          </div>
        </td>
        ${isAdmin ? `<td class="actions-cell">
          <button class="btn-edit btn-sm" onclick="editMat(${m.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-del btn-sm" onclick="deleteMat(${m.id})"><i class="fas fa-trash"></i></button>
        </td>` : '<td>—</td>'}
      </tr>`;
    }).join('');
  }
  render(mats);

  window.editMat = function(id) {
    const m = MOCK_DATA.materials.find(m => m.id === id);
    const newUsed = prompt(`Update used quantity for "${m.name}":`, m.used);
    if (newUsed !== null) {
      m.used = Math.min(m.qty, Math.max(0, parseInt(newUsed) || 0));
      render(mats); showToast('Material updated.', 'success');
    }
  };

  window.deleteMat = function(id) {
    confirmAction('Delete this material?', () => {
      const idx = MOCK_DATA.materials.findIndex(m => m.id === id);
      if (idx > -1) { MOCK_DATA.materials.splice(idx, 1); mats = MOCK_DATA.materials; render(mats); showToast('Material removed.', 'success'); }
    });
  };

  document.getElementById('addMatBtn')?.addEventListener('click', () => openModal('matModal'));
  document.getElementById('cancelMatModal')?.addEventListener('click', () => closeModal('matModal'));
  document.getElementById('matForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('mf-name').value.trim();
    const qty = parseInt(document.getElementById('mf-qty').value);
    const unit = document.getElementById('mf-unit').value.trim();
    const cat = document.getElementById('mf-cat').value.trim();
    MOCK_DATA.materials.push({ id: Date.now(), name, qty, unit, category: cat, used: 0 });
    render(MOCK_DATA.materials); closeModal('matModal'); showToast('Material added.', 'success');
  });

  document.getElementById('catFilter')?.addEventListener('change', e => {
    render(e.target.value ? mats.filter(m => m.category === e.target.value) : mats);
  });
}

/* ---- REPORTS ---- */
function initReports() {
  if (!requireAuth()) return;
  document.querySelectorAll('.report-download-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('Report download started (demo)', 'info'));
  });
  document.querySelectorAll('.report-generate-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('Generating report...', 'info'));
  });
}

/* ---- PROFILE ---- */
function initProfile() {
  if (!requireAuth()) return;
  const u = getSession();
  const el = (id) => document.getElementById(id);
  if (el('prof-avatar')) el('prof-avatar').textContent = u.avatar || u.name[0];
  if (el('prof-name')) el('prof-name').textContent = u.name;
  if (el('prof-role')) el('prof-role').textContent = u.role;
  if (el('prof-email')) el('prof-email').textContent = u.email;
  if (el('pf-name')) el('pf-name').value = u.name;
  if (el('pf-email')) el('pf-email').value = u.email;
  if (el('pf-phone')) el('pf-phone').value = u.phone || '';

  document.getElementById('profileForm')?.addEventListener('submit', e => {
    e.preventDefault();
    u.name = el('pf-name').value.trim() || u.name;
    u.phone = el('pf-phone').value.trim();
    setSession(u);
    showToast('Profile updated successfully.', 'success');
    if (el('prof-name')) el('prof-name').textContent = u.name;
  });

  document.getElementById('profileLogout')?.addEventListener('click', () => {
    clearSession(); window.location.href = '../index.html';
  });
}

/* ---- ELECTRICIAN DASHBOARD ---- */
function initElecDashboard() {
  if (!requireRole('electrician')) return;
  const u = getSession();
  const myJobs = MOCK_DATA.jobs.filter(j => j.assignedTo === u.id);
  const myTasks = MOCK_DATA.tasks.filter(t => t.assignedTo === u.id);

  const el = id => document.getElementById(id);
  if (el('my-jobs-count')) el('my-jobs-count').textContent = myJobs.length;
  if (el('my-active-count')) el('my-active-count').textContent = myJobs.filter(j => j.status === 'inprogress').length;
  if (el('my-tasks-count')) el('my-tasks-count').textContent = myTasks.filter(t => t.status === 'pending').length;
  if (el('my-done-count')) el('my-done-count').textContent = myTasks.filter(t => t.status === 'completed').length;

  const grid = document.getElementById('myJobsGrid');
  if (grid) {
    grid.innerHTML = myJobs.map(j => `
      <div class="my-job-card">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
          <div class="job-title">${j.title}</div>
          ${statusBadge(j.status)}
        </div>
        <div class="job-meta">
          <div class="job-meta-item"><i class="fas fa-map-marker-alt"></i>${j.location}</div>
          <div class="job-meta-item"><i class="fas fa-calendar"></i>${formatDate(j.deadline)}</div>
          <div class="job-meta-item"><i class="fas fa-flag"></i>${j.priority}</div>
        </div>
        <div style="font-size:.85rem;color:var(--grey-text)">${j.desc}</div>
      </div>`).join('') || '<div style="color:var(--grey-text);padding:20px">No jobs assigned yet.</div>';
  }

  const taskList = document.getElementById('myTaskList');
  if (taskList) {
    taskList.innerHTML = myTasks.map(t => `
      <div class="activity-item">
        <div class="activity-dot ${t.status==='completed'?'green':t.status==='inprogress'?'blue':'yellow'}">
          <i class="fas ${t.status==='completed'?'fa-check':t.status==='inprogress'?'fa-spinner':'fa-clock'}"></i>
        </div>
        <div class="activity-content" style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div class="act-title">${t.title}</div>
            ${statusBadge(t.status)}
          </div>
          <div class="act-time">Due: ${formatDate(t.due)}</div>
          <div class="progress-bar" style="margin-top:8px">
            <div class="progress-fill ${t.progress>=100?'green':''}" style="width:${t.progress}%"></div>
          </div>
        </div>
      </div>`).join('') || '<div style="color:var(--grey-text);padding:20px">No tasks assigned yet.</div>';
  }
}

/* ---- USER DASHBOARD ---- */
function initUserDashboard() {
  if (!requireRole('user')) return;
  const el = id => document.getElementById(id);
  const session = getSession();

  // Welcome message
  if (el('welcomeMsg')) el('welcomeMsg').textContent = `Welcome back, ${session?.name || 'Client'}!`;
  if (el('navAvatar')) el('navAvatar').textContent = (session?.name||'U')[0].toUpperCase();
  if (el('sidebarAvatar')) el('sidebarAvatar').textContent = (session?.name||'U')[0].toUpperCase();
  if (el('sidebarName')) el('sidebarName').textContent = session?.name || 'Client';

  // Stat cards
  const activeElecs = getElectricians().filter(e=>e.status==='active').length;
  const openJobs = MOCK_DATA.jobs.filter(j=>j.status==='pending'||j.status==='in-progress').length;
  const doneJobs = MOCK_DATA.jobs.filter(j=>j.status==='completed').length;
  const progJobs = MOCK_DATA.jobs.filter(j=>j.status==='in-progress').length;

  if (el('statElec')) el('statElec').textContent = activeElecs;
  if (el('statOpen')) el('statOpen').textContent = openJobs;
  if (el('statDone')) el('statDone').textContent = doneJobs;
  if (el('statProg')) el('statProg').textContent = progJobs;
  if (el('elecCount')) el('elecCount').textContent = getElectricians().length + ' specialists';

  // Electrician cards grid
  const elecGrid = el('elecGrid');
  if (elecGrid) {
    elecGrid.innerHTML = getElectricians().map((e,i) => `
      <div class="feature-card" style="text-align:center;padding:28px 20px">
        <div style="width:64px;height:64px;border-radius:50%;background:${avatarColor(i)};display:grid;place-items:center;margin:0 auto 14px;color:#fff;font-family:var(--font-head);font-size:1.4rem;font-weight:800">${e.avatar}</div>
        <h3 style="font-size:1rem;margin-bottom:4px;color:var(--blue-dark)">${e.name}</h3>
        <p style="font-size:.82rem;color:var(--grey-text);margin-bottom:10px">${e.specialization||'General Electrician'}</p>
        <div style="display:flex;justify-content:center;gap:3px;margin-bottom:12px">
          ${Array.from({length:5},(_,j)=>`<i class="fas fa-star" style="color:${j<Math.floor(e.rating||4)?'var(--warning)':'var(--grey-mid)'}; font-size:.78rem"></i>`).join('')}
        </div>
        ${statusBadge(e.status)}
      </div>`).join('');
  }

  // Recent jobs table
  const tbody = el('jobsTableBody');
  if (tbody) {
    const jobs = MOCK_DATA.jobs.slice(0, 5);
    tbody.innerHTML = jobs.map(j => {
      const assignee = getElectricians().find(e => e.id === j.electricianId);
      return `<tr>
        <td><strong>${j.title}</strong></td>
        <td><i class="fa-solid fa-location-dot" style="color:var(--grey-text);margin-right:4px"></i>${j.location}</td>
        <td>${assignee ? `<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:${avatarColor(0)};display:grid;place-items:center;color:#fff;font-size:.7rem;font-weight:700">${assignee.avatar}</div>${assignee.name}</div>` : '—'}</td>
        <td>${formatDate(j.deadline)}</td>
        <td>${statusBadge(j.status)}</td>
      </tr>`;
    }).join('');
  }
}

// Expose page init functions globally
window.initAdminDashboard = initAdminDashboard;
window.initElectricians = initElectricianMgmt;
window.initJobs = initJobMgmt;
window.initTasks = initTasks;
window.initMaterials = initMaterials;
window.initReports = initReports;
window.initProfile = initProfile;
window.initElecDashboard = initElecDashboard;
window.initUserDashboard = initUserDashboard;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
