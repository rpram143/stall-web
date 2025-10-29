// Utility functions for localStorage
export function getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function setInStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Initialize storage with default data if empty
function initializeStorage() {
  if (!getFromStorage('users')) {
    setInStorage('users', []);
  }
  if (!getFromStorage('products')) {
    setInStorage('products', []);
  }
  if (!getFromStorage('cart_items')) {
    setInStorage('cart_items', []);
  }
  if (!getFromStorage('orders')) {
    setInStorage('orders', []);
  }
  if (!getFromStorage('order_items')) {
    setInStorage('order_items', []);
  }
}

// Initialize storage on load
initializeStorage();
const ADMIN_EMAIL = 'ramprasath143m@gmail.com';
// API base - Express server
const API_BASE = 'http://localhost:4000/api';

async function fetchJson(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const body = contentType.includes('application/json') ? await res.json() : await res.text();
      throw new Error(body && body.error ? body.error : (typeof body === 'string' ? body : res.statusText));
    }
    if (contentType.includes('application/json')) return await res.json();
    return await res.text();
  } catch (err) {
    throw err;
  }
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function registerUser(email, password) {
  // Try server registration first
  try {
    const user = await fetchJson(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return user;
  } catch (err) {
    // Fallback to client-side storage if server unreachable
    const users = getFromStorage('users') || [];
    const existingUser = users.find(user => user.email === email);
    if (existingUser) throw new Error('User already exists');
    const hashedPassword = await hashPassword(password);
    const newUser = { id: generateId(), email, password: hashedPassword, is_admin: email.toLowerCase() === ADMIN_EMAIL, created_at: new Date().toISOString() };
    users.push(newUser);
    setInStorage('users', users);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}

export async function loginUser(email, password) {
  // Try server login
  try {
    const user = await fetchJson(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return user;
  } catch (err) {
    // Fallback to client-side auth
    const users = getFromStorage('users') || [];
    const hashedPassword = await hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    if (!user) throw new Error('Invalid email or password');
    // Ensure admin flag is up-to-date for the configured admin email
    if (email.toLowerCase() === ADMIN_EMAIL && user.is_admin !== true) {
      user.is_admin = true;
      setInStorage('users', users);
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export async function getCurrentUser() {
  // Prefer session storage (current tab/session). If not present, fall back to localStorage
  const sessionUser = sessionStorage.getItem('currentUser');
  if (sessionUser) return JSON.parse(sessionUser);

  const localUser = localStorage.getItem('currentUser');
  return localUser ? JSON.parse(localUser) : null;
}

export function setCurrentUser(user, remember = false) {
  if (user) {
    const str = JSON.stringify(user);
    if (remember) {
      // Persist across browser sessions
      localStorage.setItem('currentUser', str);
      // Also set in session for immediate access
      sessionStorage.setItem('currentUser', str);
    } else {
      sessionStorage.setItem('currentUser', str);
      // Ensure we don't accidentally leave a local copy
      localStorage.removeItem('currentUser');
    }
  } else {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
  }
}

export function logout() {
  // Clear both session and persistent login so user is fully logged out
  sessionStorage.removeItem('currentUser');
  localStorage.removeItem('currentUser');
}

export async function getProducts() {
  try {
    return await fetchJson(`${API_BASE}/products`);
  } catch (err) {
    return getFromStorage('products') || [];
  }
}

export async function addProduct(product) {
  // Admin-only: try server, fallback to local
  try {
    const res = await fetchJson(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res;
  } catch (err) {
    const products = getFromStorage('products') || [];
    const newProduct = { ...product, id: generateId(), created_at: new Date().toISOString() };
    products.push(newProduct);
    setInStorage('products', products);
    return newProduct;
  }
}

export async function updateProduct(id, product) {
  const products = getFromStorage('products') || [];
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) throw new Error('Product not found');
  
  const updatedProduct = { ...products[index], ...product, id };
  products[index] = updatedProduct;
  setInStorage('products', products);
  return updatedProduct;
}

export async function deleteProduct(id) {
  const products = getFromStorage('products') || [];
  const filteredProducts = products.filter(p => p.id !== id);
  setInStorage('products', filteredProducts);
}

export async function getCartItems(userId) {
  try {
    const items = await fetchJson(`${API_BASE}/cart?user_id=${encodeURIComponent(userId)}`);
    // map to old shape for compatibility
    return items.map(i => ({ id: i.id, user_id: i.user_id, product_id: i.product_id, quantity: i.quantity, products: { id: i.product_id, name: i.product_name, price: i.product_price, image_url: i.image_url } }));
  } catch (err) {
    const cartItems = getFromStorage('cart_items') || [];
    const products = getFromStorage('products') || [];
    return cartItems.filter(item => item.user_id === userId).map(item => ({ ...item, products: products.find(p => p.id === item.product_id) }));
  }
}

export async function addToCart(userId, productId, quantity = 1) {
  try {
    const res = await fetchJson(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, product_id: productId, quantity })
    });
    return { id: res.id, user_id: res.user_id, product_id: res.product_id, quantity: res.quantity };
  } catch (err) {
    const cartItems = getFromStorage('cart_items') || [];
    const existingItem = cartItems.find(item => item.user_id === userId && item.product_id === productId);
    if (existingItem) { existingItem.quantity += quantity; setInStorage('cart_items', cartItems); return existingItem; }
    const newItem = { id: generateId(), user_id: userId, product_id: productId, quantity, created_at: new Date().toISOString() };
    cartItems.push(newItem); setInStorage('cart_items', cartItems); return newItem;
  }
}

export async function updateCartQuantity(cartItemId, quantity) {
  try {
    const res = await fetchJson(`${API_BASE}/cart/${encodeURIComponent(cartItemId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return res;
  } catch (err) {
    if (quantity <= 0) return deleteCartItem(cartItemId);
    const cartItems = getFromStorage('cart_items') || [];
    const item = cartItems.find(item => item.id === cartItemId);
    if (!item) throw new Error('Cart item not found');
    item.quantity = quantity; setInStorage('cart_items', cartItems); return item;
  }
}

export async function deleteCartItem(cartItemId) {
  try {
    await fetchJson(`${API_BASE}/cart/${encodeURIComponent(cartItemId)}`, { method: 'DELETE' });
    return { ok: true };
  } catch (err) {
    const cartItems = getFromStorage('cart_items') || [];
    const filteredItems = cartItems.filter(item => item.id !== cartItemId);
    setInStorage('cart_items', filteredItems);
    return { ok: true };
  }
}

export async function clearCart(userId) {
  // server has no explicit clear endpoint; delete items one-by-one
  try {
    const items = await getCartItems(userId);
    for (const it of items) {
      await fetchJson(`${API_BASE}/cart/${encodeURIComponent(it.id)}`, { method: 'DELETE' });
    }
  } catch (err) {
    const cartItems = getFromStorage('cart_items') || [];
    const filteredItems = cartItems.filter(item => item.user_id !== userId);
    setInStorage('cart_items', filteredItems);
  }
}

export async function createOrder(userId, orderData, cartItems) {
  try {
    const res = await fetchJson(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, total_amount: orderData.total_amount, delivery_address: orderData.delivery_address, phone: orderData.phone })
    });
    return res;
  } catch (err) {
    const orders = getFromStorage('orders') || [];
    const orderItems = getFromStorage('order_items') || [];
    const order = { id: generateId(), user_id: userId, total_amount: orderData.total_amount, delivery_address: orderData.delivery_address, phone: orderData.phone, status: 'pending', created_at: new Date().toISOString() };
    const newOrderItems = cartItems.map(item => ({ id: generateId(), order_id: order.id, product_id: item.product_id, product_name: item.products.name, quantity: item.quantity, price: item.products.price }));
    orders.push(order); orderItems.push(...newOrderItems); setInStorage('orders', orders); setInStorage('order_items', orderItems); await clearCart(userId); return order;
  }
}

export async function getOrders(userId) {
  try {
    const res = await fetchJson(`${API_BASE}/orders?user_id=${encodeURIComponent(userId)}`);
    return res;
  } catch (err) {
    const orders = getFromStorage('orders') || [];
    const orderItems = getFromStorage('order_items') || [];
    const products = getFromStorage('products') || [];
    return orders.filter(order => order.user_id === userId).sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)).map(order => ({ ...order, order_items: orderItems.filter(item => item.order_id === order.id).map(item => ({ ...item, products: products.find(p => p.id === item.product_id) })) }));
  }
}

export async function getAllOrders() {
  const orders = getFromStorage('orders') || [];
  const orderItems = getFromStorage('order_items') || [];
  const products = getFromStorage('products') || [];

  return orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(order => ({
      ...order,
      order_items: orderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          ...item,
          products: products.find(p => p.id === item.product_id)
        }))
    }));
}

export async function updateOrderStatus(orderId, status) {
  const orders = getFromStorage('orders') || [];
  const order = orders.find(o => o.id === orderId);
  
  if (!order) throw new Error('Order not found');
  
  order.status = status;
  setInStorage('orders', orders);
  return order;
}
