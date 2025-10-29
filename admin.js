import { getProducts, addProduct, updateProduct, deleteProduct, getCurrentUser, logout } from './db.js';

let currentProducts = [];
let editingProductId = null;

async function init() {
  const user = await getCurrentUser();

  if (!user || !user.is_admin) {
    alert('Access denied. Admin only.');
    window.location.href = 'index.html';
    return;
  }

  await loadAdminProducts();
  setupEventListeners();
}

async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-list');

  try {
    currentProducts = await getProducts();

    if (currentProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading">No products yet. Add your first sweet!</td></tr>';
      return;
    }

    tbody.innerHTML = currentProducts.map(product => `
      <tr>
        <td><img src="${product.image_url}" alt="${product.name}"></td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>₹${product.price}</td>
        <td>
          <button class="action-btn edit-btn" onclick="window.editProduct('${product.id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="window.deleteProductConfirm('${product.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Error loading products.</td></tr>';
  }
}

function setupEventListeners() {
  const addBtn = document.getElementById('add-product-btn');
  const modal = document.getElementById('product-form-modal');
  const closeBtn = document.querySelector('.close');
  const form = document.getElementById('product-form');
  const logoutBtn = document.getElementById('admin-logout-btn');

  addBtn.addEventListener('click', () => {
    editingProductId = null;
    document.getElementById('form-title').textContent = 'Add New Sweet';
    form.reset();
    document.getElementById('form-message').textContent = '';
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  form.addEventListener('submit', handleFormSubmit);

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    window.location.href = 'index.html';
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const messageDiv = document.getElementById('form-message');
  const modal = document.getElementById('product-form-modal');

  const product = {
    name: document.getElementById('product-name').value,
    description: document.getElementById('product-description').value,
    price: parseFloat(document.getElementById('product-price').value),
    image_url: document.getElementById('product-image').value
  };

  try {
    messageDiv.textContent = editingProductId ? 'Updating product...' : 'Adding product...';
    messageDiv.className = 'message';

    if (editingProductId) {
      await updateProduct(editingProductId, product);
      messageDiv.textContent = 'Product updated successfully!';
    } else {
      await addProduct(product);
      messageDiv.textContent = 'Product added successfully!';
    }

    messageDiv.className = 'message success';

    setTimeout(() => {
      modal.style.display = 'none';
      loadAdminProducts();
    }, 1000);
  } catch (error) {
    messageDiv.textContent = error.message;
    messageDiv.className = 'message error';
  }
}

window.editProduct = function(id) {
  const product = currentProducts.find(p => p.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById('form-title').textContent = 'Edit Sweet';
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-description').value = product.description;
  document.getElementById('product-price').value = product.price;
  document.getElementById('product-image').value = product.image_url;
  document.getElementById('form-message').textContent = '';
  document.getElementById('product-form-modal').style.display = 'block';
};

window.deleteProductConfirm = async function(id) {
  if (!confirm('Are you sure you want to delete this sweet?')) return;

  try {
    await deleteProduct(id);
    await loadAdminProducts();
  } catch (error) {
    alert('Error deleting product: ' + error.message);
  }
};

init();
