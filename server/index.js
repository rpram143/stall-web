import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'demo.db');

async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Products
app.get('/api/products', async (req, res) => {
  const db = await openDb();
  const products = await db.all('SELECT * FROM products');
  res.json(products);
});

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const db = await openDb();
  const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const id = 'u_' + Date.now().toString(36);
  const created_at = new Date().toISOString();

  await db.run('INSERT INTO users (id, email, password, is_admin, created_at) VALUES (?, ?, ?, ?, ?)', id, email, hash, 0, created_at);
  const user = { id, email, is_admin: 0, created_at };
  res.json(user);
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const db = await openDb();
  const row = await db.get('SELECT id, email, password, is_admin, created_at FROM users WHERE email = ?', email);
  if (!row) return res.status(401).json({ error: 'Invalid email or password' });

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== row.password) return res.status(401).json({ error: 'Invalid email or password' });

  const { password: _, ...userWithoutPassword } = row;
  res.json(userWithoutPassword);
});

// Cart items
app.get('/api/cart', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });
  const db = await openDb();
  const items = await db.all(`SELECT c.*, p.name AS product_name, p.price AS product_price, p.image_url
    FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?`, userId);
  res.json(items);
});

app.post('/api/cart', async (req, res) => {
  const { user_id, product_id, quantity = 1 } = req.body;
  if (!user_id || !product_id) return res.status(400).json({ error: 'Missing user_id or product_id' });
  const db = await openDb();
  const existing = await db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', user_id, product_id);
  if (existing) {
    await db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', quantity, existing.id);
    const updated = await db.get('SELECT * FROM cart_items WHERE id = ?', existing.id);
    return res.json(updated);
  }
  const id = 'c_' + Date.now().toString(36);
  const created_at = new Date().toISOString();
  await db.run('INSERT INTO cart_items (id, user_id, product_id, quantity, created_at) VALUES (?, ?, ?, ?, ?)', id, user_id, product_id, quantity, created_at);
  const inserted = await db.get('SELECT * FROM cart_items WHERE id = ?', id);
  res.json(inserted);
});

app.put('/api/cart/:id', async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  const db = await openDb();
  if (quantity <= 0) {
    await db.run('DELETE FROM cart_items WHERE id = ?', id);
    return res.json({ ok: true });
  }
  await db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', quantity, id);
  const updated = await db.get('SELECT * FROM cart_items WHERE id = ?', id);
  res.json(updated);
});

app.delete('/api/cart/:id', async (req, res) => {
  const id = req.params.id;
  const db = await openDb();
  await db.run('DELETE FROM cart_items WHERE id = ?', id);
  res.json({ ok: true });
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { user_id, total_amount, delivery_address, phone } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  const db = await openDb();
  const orderId = 'o_' + Date.now().toString(36);
  const created_at = new Date().toISOString();
  await db.run('INSERT INTO orders (id, user_id, total_amount, delivery_address, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', orderId, user_id, total_amount, delivery_address, phone, 'pending', created_at);
  // Move cart_items to order_items
  const cartItems = await db.all('SELECT c.*, p.name as product_name, p.price as price FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ?', user_id);
  for (const it of cartItems) {
    const oi = 'oi_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6);
    await db.run('INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)', oi, orderId, it.product_id, it.product_name, it.quantity, it.price);
  }
  await db.run('DELETE FROM cart_items WHERE user_id = ?', user_id);
  res.json({ id: orderId });
});

app.get('/api/orders', async (req, res) => {
  const userId = req.query.user_id;
  const db = await openDb();
  let orders = [];
  if (userId) {
    orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', userId);
  } else {
    orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
  }
  res.json(orders);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
