-- SQL seed for Rajesh Sweet Stall demo
-- This file creates simple tables and inserts sample data so you can present the project as having a backing SQL database.
-- You can load into SQLite or Postgres for demonstrations.

-- Drop existing (safe for demo DBs)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TEXT
);

-- Products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER
);

-- Cart items
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  delivery_address TEXT,
  phone TEXT,
  status TEXT,
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Order items
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT,
  quantity INTEGER,
  price INTEGER,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Sample products (from init-data.js)
INSERT INTO products (id, name, description, price, image_url, category, stock) VALUES
('1', 'Chocolate Truffle', 'Rich chocolate truffle with a smooth ganache center, decorated with cocoa powder', 299, '/images/chocolate%20truffle.webp', 'Chocolates', 50),
('2', 'Mysore Pak', 'Traditional South Indian sweet made with finest besan flour and pure ghee', 399, '/images/mysore%20pak.webp', 'Traditional', 40),
('3', 'Kaju Barfi', 'Premium cashew fudge with pure silver foil garnish, perfect gift for special occasions', 599, '/images/kaju%20barfi.webp', 'Traditional', 35),
('4', 'Gulab Jamun', 'Soft khoya dumplings soaked in cardamom and rose-scented sugar syrup', 249, '/images/gulab%20jamun.webp', 'Traditional', 60),
('5', 'Rasgulla', 'Bengali specialty: Soft and spongy cottage cheese balls in light sugar syrup', 299, '/images/rasagulla.webp', 'Traditional', 45),
('6', 'Jalebi', 'Crispy, syrup-soaked spirals with saffron and cardamom flavor, served warm', 199, '/images/jalebi.webp', 'Traditional', 70),
('7', 'Badam Halwa', 'Rich almond pudding made with pure ghee and garnished with nuts', 499, '/images/badam%20halwa.webp', 'Traditional', 30),
('8', 'Pista Roll', 'Delicate rolled sweet filled with crushed pistachios and cardamom', 449, '/images/pista%20roll.webp', 'Traditional', 40);

-- Demo user (replace PASSWORD_HASH placeholder with actual SHA-256 hash if you want)
-- NOTE: For security, do NOT store plaintext passwords in production. This is for offline demo only.
-- Demo account: email: demo@example.com password: demo123
-- Password stored below is SHA-256(demo123)
INSERT INTO users (id, email, password, is_admin, created_at) VALUES
('u_demo', 'demo@example.com', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 0, datetime('now'));

-- Example cart item showing the demo user has product 1 in the cart
INSERT INTO cart_items (id, user_id, product_id, quantity, created_at) VALUES
('c1', 'u_demo', '1', 2, datetime('now'));

-- Example order (empty by default) and order_items - uncomment and adjust if you want to show an order
-- INSERT INTO orders (id, user_id, total_amount, delivery_address, phone, status, created_at) VALUES
-- ('o1', 'u_demo', 648, '123 Demo St, City', '1234567890', 'pending', datetime('now'));
-- INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) VALUES
-- ('oi1', 'o1', '1', 'Chocolate Truffle', 2, 299);

-- End of seed
