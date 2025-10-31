import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(path.join(__dirname, '..', 'firebase-service-account.json'), 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'rajesh-sweet-stall'
});

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Products
app.get('/api/products', async (req, res) => {
  try {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, image_url } = req.body;
  if (!name || !description || !price || !image_url) {
    return res.status(400).json({ error: 'Missing required fields: name, description, price, image_url' });
  }

  try {
    const productsRef = db.collection('products');
    const docRef = await productsRef.add({
      name,
      description,
      price: parseFloat(price),
      image_url,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    const newDoc = await docRef.get();
    res.json({ id: docRef.id, ...newDoc.data() });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Images
app.get('/api/images', async (req, res) => {
  try {
    const imagesRef = db.collection('images');
    const snapshot = await imagesRef.get();
    const images = [];
    snapshot.forEach(doc => {
      images.push({ id: doc.id, ...doc.data() });
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.get('/api/images/:id', async (req, res) => {
  const imageId = req.params.id;
  try {
    const imageDoc = await db.collection('images').doc(imageId).get();
    if (!imageDoc.exists) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ id: imageDoc.id, ...imageDoc.data() });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

app.post('/api/images', async (req, res) => {
  const { name, url, category = 'product' } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Missing name or url' });

  try {
    const imagesRef = db.collection('images');
    const docRef = await imagesRef.add({
      name,
      url,
      category,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    const newDoc = await docRef.get();
    res.json({ id: docRef.id, ...newDoc.data() });
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

app.put('/api/images/:id', async (req, res) => {
  const imageId = req.params.id;
  const { name, url, category } = req.body;

  try {
    const imageRef = db.collection('images').doc(imageId);
    await imageRef.update({
      ...(name && { name }),
      ...(url && { url }),
      ...(category && { category }),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    const updatedDoc = await imageRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

app.delete('/api/images/:id', async (req, res) => {
  const imageId = req.params.id;

  try {
    await db.collection('images').doc(imageId).delete();
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
    });

    // Set custom claims for admin if needed
    const isAdmin = email.toLowerCase() === 'ramprasath143m@gmail.com';
    if (isAdmin) {
      await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    }

    // Create user profile in Firestore
    const userProfile = {
      id: userRecord.uid,
      email: userRecord.email,
      is_admin: isAdmin,
      name: '',
      phone: '',
      address: '',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(userRecord.uid).set(userProfile);

    const user = {
      id: userRecord.uid,
      email: userRecord.email,
      is_admin: isAdmin,
      created_at: new Date(userRecord.metadata.creationTime).toISOString()
    };
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({ error: 'User already exists' });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    // Firebase Auth doesn't allow server-side password verification
    // We'll use Firebase Auth REST API for verification
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY || 'AIzaSyA7Ayn_c2npdIfglADFCfJAcR7ff23BA7A'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userRecord = await auth.getUser(data.localId);
    const customClaims = userRecord.customClaims || {};
    const user = {
      id: userRecord.uid,
      email: userRecord.email,
      is_admin: customClaims.admin || false,
      created_at: new Date(userRecord.metadata.creationTime).toISOString()
    };
    res.json(user);
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Cart items
app.get('/api/cart', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });

  try {
    const cartRef = db.collection('cart').where('user_id', '==', userId);
    const snapshot = await cartRef.get();
    const items = [];
    for (const doc of snapshot.docs) {
      const itemData = doc.data();
      // Get product details
      const productDoc = await db.collection('products').doc(itemData.product_id).get();
      if (productDoc.exists) {
        const productData = productDoc.data();
        items.push({
          id: doc.id,
          ...itemData,
          product_name: productData.name,
          product_price: productData.price,
          image_url: productData.image_url
        });
      }
    }
    res.json(items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

app.post('/api/cart', async (req, res) => {
  const { user_id, product_id, quantity = 1 } = req.body;
  if (!user_id || !product_id) return res.status(400).json({ error: 'Missing user_id or product_id' });

  try {
    // Check if item already exists in cart
    const existingQuery = db.collection('cart').where('user_id', '==', user_id).where('product_id', '==', product_id);
    const existingSnapshot = await existingQuery.get();

    if (!existingSnapshot.empty) {
      // Update existing item
      const existingDoc = existingSnapshot.docs[0];
      const newQuantity = existingDoc.data().quantity + quantity;
      await existingDoc.ref.update({ quantity: newQuantity });
      const updatedDoc = await existingDoc.ref.get();
      return res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } else {
      // Add new item
      const cartRef = db.collection('cart');
      const docRef = await cartRef.add({
        user_id,
        product_id,
        quantity,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const newDoc = await docRef.get();
      return res.json({ id: docRef.id, ...newDoc.data() });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;

  try {
    const cartRef = db.collection('cart').doc(id);
    if (quantity <= 0) {
      await cartRef.delete();
      return res.json({ ok: true });
    }
    await cartRef.update({ quantity });
    const updatedDoc = await cartRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await db.collection('cart').doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { user_id, total_amount, delivery_address, phone } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  try {
    // Create order
    const orderRef = db.collection('orders');
    const orderDocRef = await orderRef.add({
      user_id,
      total_amount,
      delivery_address,
      phone,
      status: 'pending',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Move cart items to order items
    const cartQuery = db.collection('cart').where('user_id', '==', user_id);
    const cartSnapshot = await cartQuery.get();

    const batch = db.batch();
    const orderItemsRef = db.collection('order_items');

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();
      // Get product details
      const productDoc = await db.collection('products').doc(cartData.product_id).get();
      if (productDoc.exists) {
        const productData = productDoc.data();
        const orderItemRef = orderItemsRef.doc();
        batch.set(orderItemRef, {
          order_id: orderDocRef.id,
          product_id: cartData.product_id,
          product_name: productData.name,
          quantity: cartData.quantity,
          price: productData.price,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      // Delete cart item
      batch.delete(cartDoc.ref);
    }

    await batch.commit();
    res.json({ id: orderDocRef.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  const userId = req.query.user_id;

  try {
    let ordersQuery = db.collection('orders').orderBy('created_at', 'desc');
    if (userId) {
      ordersQuery = ordersQuery.where('user_id', '==', userId);
    }

    const snapshot = await ordersQuery.get();
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Users management endpoints
app.get('/api/users', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, phone, address } = req.body;

  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      name: name || '',
      phone: phone || '',
      address: address || '',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    const updatedDoc = await userRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
