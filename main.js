import { getProducts, getCurrentUser, logout, addToCart, getCartItems } from './db.js';
import { initializeProducts } from './init-data.js';

let currentUser = null;

async function init() {
  // Initialize sample products if none exist
  initializeProducts();
  currentUser = await getCurrentUser();
  updateNavBar(currentUser);
  await loadProducts();
  if (currentUser) {
    await updateCartCount();
  }
}

function updateNavBar(user) {
  const adminLink = document.getElementById('admin-link');
  const authLink = document.getElementById('auth-link');
  const logoutLink = document.getElementById('logout-link');
  const cartLink = document.getElementById('cart-link');
  const ordersLink = document.getElementById('orders-link');

  if (user) {
    authLink.style.display = 'none';
    logoutLink.style.display = 'block';
    cartLink.style.display = 'block';
    ordersLink.style.display = 'block';

    if (user.is_admin) {
      adminLink.style.display = 'block';
    }
  } else {
    authLink.style.display = 'block';
    logoutLink.style.display = 'none';
    adminLink.style.display = 'none';
    cartLink.style.display = 'none';
    ordersLink.style.display = 'none';
  }
}

async function updateCartCount() {
  if (!currentUser) return;

  try {
    const cartItems = await getCartItems(currentUser.id);
    const badge = document.getElementById('cart-count');
    if (cartItems.length > 0) {
      badge.textContent = cartItems.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}

async function loadProducts() {
  const grid = document.getElementById('products-grid');

  try {
    const products = await getProducts();

    if (products.length === 0) {
      grid.innerHTML = '<p class="loading">No products available yet.</p>';
      return;
    }

    grid.innerHTML = products.map(product => `
      <div class="product-card">
        <img src="${product.image_url}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <p class="product-price">₹${product.price}/kg</p>
          ${currentUser ? `<button class="add-to-cart-btn" onclick="window.handleAddToCart('${product.id}')">Add to Cart</button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<p class="loading">Error loading products. Please try again later.</p>';
  }
}

window.handleAddToCart = async function(productId) {
  if (!currentUser) {
    alert('Please login to add items to cart');
    window.location.href = 'auth.html';
    return;
  }

  try {
    await addToCart(currentUser.id, productId, 1);
    await updateCartCount();

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Added to cart!';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  } catch (error) {
    alert('Error adding to cart: ' + error.message);
  }
};

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    window.location.href = 'index.html';
  });
}

init();
