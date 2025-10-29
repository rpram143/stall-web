import { getFromStorage, setInStorage, getCurrentUser, logout } from './db.js';

let users = [];

async function init() {
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    alert('Access denied. Admin only.');
    window.location.href = 'index.html';
    return;
  }

  loadUsers();
  setupEvents();
}

function setupEvents() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = 'index.html';
    });
  }
}

function loadUsers() {
  users = getFromStorage('users') || [];
  const tbody = document.getElementById('admin-users-list');

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">No users yet.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${escapeHtml(u.email)}</td>
      <td>
        <span class="role-badge ${u.is_admin ? 'role-admin' : 'role-user'}">${u.is_admin ? 'Admin' : 'User'}</span>
      </td>
      <td>${formatDate(u.created_at)}</td>
      <td>
        <button class="action-btn edit-btn" onclick="window.toggleAdmin('${u.id}')">${u.is_admin ? 'Revoke Admin' : 'Make Admin'}</button>
        <button class="action-btn delete-btn" onclick="window.deleteUser('${u.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.toggleAdmin = function(userId) {
  users = getFromStorage('users') || [];
  const user = users.find(u => u.id === userId);
  if (!user) return;
  user.is_admin = !user.is_admin;
  setInStorage('users', users);
  loadUsers();
};

window.deleteUser = function(userId) {
  users = getFromStorage('users') || [];
  const user = users.find(u => u.id === userId);
  if (!user) return;
  if (!confirm(`Delete user ${user.email}?`)) return;
  const filtered = users.filter(u => u.id !== userId);
  setInStorage('users', filtered);
  loadUsers();
};

function formatDate(iso) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

init();


