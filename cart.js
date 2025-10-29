import { getCartItems, updateCartQuantity, deleteCartItem, createOrder, getCurrentUser, logout } from './db.js';

let cartItems = [];
let currentUser = null;

async function init() {
  currentUser = await getCurrentUser();

  if (!currentUser) {
    alert('Please login to view your cart');
    window.location.href = 'auth.html';
    return;
  }

  updateNavBar(currentUser);
  await loadCart();
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

async function loadCart() {
  const container = document.getElementById('cart-content');
  const summary = document.getElementById('cart-summary');

  try {
    cartItems = await getCartItems(currentUser.id);

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <h3>Your cart is empty</h3>
          <p>Add some delicious sweets to your cart!</p>
          <a href="index.html#products" class="cta-button">Browse Sweets</a>
        </div>
      `;
      summary.style.display = 'none';
      updateCartCount(0);
      return;
    }

    container.innerHTML = `
      <div class="cart-items">
        ${cartItems.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.products.image_url}" alt="${item.products.name}" class="cart-item-image">
            <div class="cart-item-info">
              <h3>${item.products.name}</h3>
              <p class="cart-item-price">₹${item.products.price}/kg</p>
              <p class="cart-item-quantity">Quantity: ${formatQuantity(item.quantity)}</p>
            </div>
            <div class="cart-item-controls">
              <button class="qty-btn" onclick="window.decreaseQuantity('${item.id}', ${item.quantity})">-</button>
              <input type="number" value="${item.quantity}" min="0.25" step="0.25" class="qty-input" data-id="${item.id}" onchange="window.updateQuantityFromInput('${item.id}', this.value)">
              <span class="qty-unit">kg</span>
              <button class="qty-btn" onclick="window.increaseQuantity('${item.id}', ${item.quantity})">+</button>
            </div>
            <div class="cart-item-total">
              <p>₹${(item.products.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="delete-cart-btn" onclick="window.removeFromCart('${item.id}')">×</button>
          </div>
        `).join('')}
      </div>
    `;

    updateSummary();
    summary.style.display = 'block';
    updateCartCount(cartItems.length);
  } catch (error) {
    console.error('Error loading cart:', error);
    container.innerHTML = '<p class="loading">Error loading cart. Please try again.</p>';
  }
}

function updateSummary() {
  const subtotal = cartItems.reduce((sum, item) =>
    sum + (item.products.price * item.quantity), 0
  );
  const delivery = 50;
  const total = subtotal + delivery;

  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

function updateCartCount(count) {
  const badge = document.getElementById('cart-count');
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function formatQuantity(qty) {
  if (qty === 1) return '1 kg';
  if (qty === 0.25) return '1/4 kg';
  if (qty === 0.5) return '1/2 kg';
  if (qty === 0.75) return '3/4 kg';
  return `${qty} kg`;
}

window.decreaseQuantity = async function(cartItemId, currentQty) {
  const newQuantity = Math.max(0.25, currentQty - 0.25);
  if (newQuantity < 0.25) {
    return window.removeFromCart(cartItemId);
  }
  
  try {
    await updateCartQuantity(cartItemId, newQuantity);
    await loadCart();
  } catch (error) {
    alert('Error updating quantity: ' + error.message);
  }
};

window.increaseQuantity = async function(cartItemId, currentQty) {
  const newQuantity = currentQty + 0.25;
  
  try {
    await updateCartQuantity(cartItemId, newQuantity);
    await loadCart();
  } catch (error) {
    alert('Error updating quantity: ' + error.message);
  }
};

window.updateQuantityFromInput = async function(cartItemId, value) {
  const newQuantity = parseFloat(value) || 0.25;
  
  if (newQuantity < 0.25) {
    return window.removeFromCart(cartItemId);
  }
  
  try {
    await updateCartQuantity(cartItemId, newQuantity);
    await loadCart();
  } catch (error) {
    alert('Error updating quantity: ' + error.message);
  }
};

window.removeFromCart = async function(cartItemId) {
  if (!confirm('Remove this item from cart?')) return;

  try {
    await deleteCartItem(cartItemId);
    await loadCart();
  } catch (error) {
    alert('Error removing item: ' + error.message);
  }
};

function setupEventListeners() {
  const logoutBtn = document.getElementById('logout-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.querySelector('.close');
  const checkoutForm = document.getElementById('checkout-form');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      window.location.href = 'index.html';
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      const subtotal = cartItems.reduce((sum, item) =>
        sum + (item.products.price * item.quantity), 0
      );
      const total = subtotal + 50;
      document.getElementById('order-total').textContent = `₹${total.toFixed(2)}`;
      modal.style.display = 'block';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleCheckout();
    });
  }
}

async function handleCheckout() {
  const messageDiv = document.getElementById('checkout-message');
  const address = document.getElementById('delivery-address').value;
  const phone = document.getElementById('phone').value;
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (item.products.price * item.quantity), 0
  );
  const total = subtotal + 50;

  try {
    // If online payment selected, simulate payment gateway
    if (paymentMethod === 'online') {
      messageDiv.textContent = 'Redirecting to payment gateway...';
      messageDiv.className = 'message';
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would redirect to payment gateway and come back
      // For demo, we'll just proceed with the order
    }

    messageDiv.textContent = 'Placing your order...';
    messageDiv.className = 'message';

    await createOrder(currentUser.id, {
      total_amount: total,
      delivery_address: address,
      phone: phone,
      payment_method: paymentMethod
    }, cartItems);

    messageDiv.textContent = `Order placed successfully! ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} confirmed.`;
    messageDiv.className = 'message success';

    setTimeout(() => {
      window.location.href = 'orders.html';
    }, 1500);
  } catch (error) {
    messageDiv.textContent = 'Error placing order: ' + error.message;
    messageDiv.className = 'message error';
  }
}

init();
