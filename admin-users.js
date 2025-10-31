import { getAllUsers, getCurrentUser, logout } from './db.js';

let users = [];

async function init() {
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    alert('Access denied. Admin only.');
    window.location.href = 'index.html';
    return;
  }

  await loadUsers();
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

async function loadUsers() {
  const tbody = document.getElementById('admin-users-list');
  tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading users...</td></tr>';

  try {
    users = await getAllUsers();

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
  } catch (error) {
    console.error('Error loading users:', error);
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Error loading users. Please try again.</td></tr>';
  }
}

window.toggleAdmin = function(userId) {
  // Note: Firebase Auth doesn't allow changing admin status from client side
  // This would need to be done via Firebase Admin SDK on the server
  alert('Admin status changes require server-side implementation. Please contact the developer.');
};

window.deleteUser = function(userId) {
  // Note: Firebase Auth doesn't allow deleting users from client side
  // This would need to be done via Firebase Admin SDK on the server
  alert('User deletion requires server-side implementation. Please contact the developer.');
};

function formatDate(iso) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

init();
