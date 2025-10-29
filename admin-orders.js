import { getAllOrders, updateOrderStatus, getCurrentUser, logout } from './db.js';

let currentOrders = [];
let currentUser = null;

async function init() {
  currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.is_admin) {
    alert('Access denied. Admin only.');
    window.location.href = 'index.html';
    return;
  }

  await loadOrders();
  setupEventListeners();
}

async function loadOrders() {
  const container = document.getElementById('orders-content');

  try {
    currentOrders = await getAllOrders();

    if (currentOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <h3>No orders yet</h3>
          <p>Waiting for customers to place orders...</p>
        </div>
      `;
      return;
    }

    displayOrders(currentOrders);
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<p class="loading">Error loading orders. Please try again.</p>';
  }
}

function displayOrders(orders) {
  const container = document.getElementById('orders-content');

  container.innerHTML = orders.map(order => `
    <div class="order-card admin-order-card">
      <div class="order-header">
        <div>
          <h3>Order #${order.id.substring(0, 8)}</h3>
          <p class="order-date">${new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        <div class="order-actions">
          <span class="order-status-badge ${order.status}">
            ${getStatusText(order.status)}
          </span>
          <select class="status-select" data-order-id="${order.id}" value="${order.status}">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </div>
      </div>

      <div class="order-items">
        ${order.order_items.map(item => `
          <div class="order-item">
            ${item.products ? `<img src="${item.products.image_url}" alt="${item.product_name}" class="order-item-image">` : ''}
            <div class="order-item-details">
              <h4>${item.product_name}</h4>
              <p>Quantity: ${item.quantity} kg</p>
              <p class="order-item-price">₹${item.price}/kg</p>
            </div>
            <div class="order-item-total">
              <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="order-footer">
        <div class="order-address">
          <strong>Customer Info:</strong>
          <p>${order.delivery_address}</p>
          <p>Phone: ${order.phone}</p>
        </div>
        <div class="order-total">
          <strong>Total: ₹${order.total_amount.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  `).join('');

  // Attach event listeners to status select elements
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.value;
      await updateOrderStatusHandler(orderId, newStatus);
    });
  });
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'delivered': 'Delivered'
  };
  return statusMap[status] || status;
}

async function updateOrderStatusHandler(orderId, newStatus) {
  try {
    await updateOrderStatus(orderId, newStatus);
    
    // Update the order in the local array
    const order = currentOrders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
    }
    
    // Show success message (you can customize this)
    const statusBadge = document.querySelector(`.status-select[data-order-id="${orderId}"]`).previousElementSibling;
    statusBadge.className = `order-status-badge ${newStatus}`;
    statusBadge.textContent = getStatusText(newStatus);
    
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Error updating order status: ' + error.message);
    // Reload orders on error
    await loadOrders();
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  const statusFilter = document.getElementById('status-filter');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = 'index.html';
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      const filterValue = e.target.value;
      if (filterValue === 'all') {
        displayOrders(currentOrders);
      } else {
        const filtered = currentOrders.filter(order => order.status === filterValue);
        displayOrders(filtered);
      }
    });
  }
}

init();


