import { getOrders, getCurrentUser, logout } from './db.js';

let currentUser = null;

async function init() {
  currentUser = await getCurrentUser();

  if (!currentUser) {
    alert('Please login to view your orders');
    window.location.href = 'auth.html';
    return;
  }

  updateNavBar(currentUser);
  await loadOrders();
  setupEventListeners();
}

function updateNavBar(user) {
  const adminLink = document.getElementById('admin-link');
  const authLink = document.getElementById('auth-link');
  const logoutLink = document.getElementById('logout-link');

  if (user) {
    authLink.style.display = 'none';
    logoutLink.style.display = 'block';

    if (user.is_admin) {
      adminLink.style.display = 'block';
    }
  }
}

async function loadOrders() {
  const container = document.getElementById('orders-content');

  try {
    const orders = await getOrders(currentUser.id);

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <h3>No orders yet</h3>
          <p>Start shopping for delicious Tamil Nadu sweets!</p>
          <a href="index.html#products" class="cta-button">Browse Sweets</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
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
          <div class="order-status ${order.status}">
            ${getStatusText(order.status)}
          </div>
        </div>

        <div class="order-items">
          ${order.order_items.map(item => `
            <div class="order-item">
              <img src="${item.products.image_url}" alt="${item.product_name}" class="order-item-image">
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
            <strong>Delivery Address:</strong>
            <p>${order.delivery_address}</p>
            <p>Phone: ${order.phone}</p>
          </div>
          <div class="order-total">
            <strong>Total: ₹${order.total_amount.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<p class="loading">Error loading orders. Please try again.</p>';
  }
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'delivered': 'Delivered'
  };
  return statusMap[status] || status;
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = 'index.html';
    });
  }
}

init();
