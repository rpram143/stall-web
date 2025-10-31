// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7Ayn_c2npdIfglADFCfJAcR7ff23BA7A",
  authDomain: "rajesh-sweet-stall.firebaseapp.com",
  projectId: "rajesh-sweet-stall",
  storageBucket: "rajesh-sweet-stall.firebasestorage.app",
  messagingSenderId: "425836527227",
  appId: "1:425836527227:web:0510e10b81d4767324acde",
  measurementId: "G-M8K4T4GXNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility functions for localStorage (fallback)
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

// Initialize storage with default data if empty (fallback)
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

// Initialize storage on load (fallback)
initializeStorage();

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_EMAIL = 'ramprasath143m@gmail.com';

export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
    // Also create a user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), { email, is_admin: isAdmin, created_at: serverTimestamp() });
    return {
      id: user.uid,
      email: user.email,
      is_admin: isAdmin,
      created_at: new Date(user.metadata.creationTime).toISOString()
    };
  } catch (firebaseError) {
    console.error("Error registering user with Firebase:", firebaseError);
    throw firebaseError;
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
    return {
      id: user.uid,
      email: user.email,
      is_admin: isAdmin,
      created_at: new Date(user.metadata.creationTime).toISOString()
    };
  } catch (firebaseError) {
    console.error("Error logging in with Firebase:", firebaseError);
    throw firebaseError;
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

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
  }
  // Clear both session and persistent login so user is fully logged out
  sessionStorage.removeItem('currentUser');
  localStorage.removeItem('currentUser');
}

export async function getProducts() {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(query(productsCol, orderBy('name')));
    return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting products from Firestore:", error);
    throw error;
  }
}

export async function addProduct(product) {
  try {
    const productsCol = collection(db, 'products');
    const docRef = await addDoc(productsCol, { ...product, created_at: serverTimestamp() });
    return { id: docRef.id, ...product };
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    throw error;
  }
}

export async function updateProduct(id, product) {
  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, product);
    return { id, ...product };
  } catch (error) {
    console.error("Error updating product in Firestore:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    throw error;
  }
}

export async function getCartItems(userId) {
  try {
    const q = query(collection(db, 'cart'), where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    const items = await Promise.all(snapshot.docs.map(async (doc) => {
      const item = { id: doc.id, ...doc.data() };
      const productDoc = await getDoc(doc(db, 'products', item.product_id));
      item.products = { id: productDoc.id, ...productDoc.data() };
      return item;
    }));
    return items;
  } catch (error) {
    console.error("Error getting cart items from Firestore:", error);
    throw error;
  }
}

export async function addToCart(userId, productId, quantity = 1) {
  try {
    const q = query(collection(db, 'cart'), where('user_id', '==', userId), where('product_id', '==', productId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const cartDoc = snapshot.docs[0];
      const newQuantity = cartDoc.data().quantity + quantity;
      await updateDoc(cartDoc.ref, { quantity: newQuantity });
      return { id: cartDoc.id, quantity: newQuantity };
    } else {
      const docRef = await addDoc(collection(db, 'cart'), { user_id: userId, product_id: productId, quantity });
      return { id: docRef.id, quantity };
    }
  } catch (error) {
    console.error("Error adding to cart in Firestore:", error);
    throw error;
  }
}

export async function updateCartQuantity(cartItemId, quantity) {
  try {
    if (quantity <= 0) {
      return await deleteCartItem(cartItemId);
    }
    const itemRef = doc(db, 'cart', cartItemId);
    await updateDoc(itemRef, { quantity });
    return { id: cartItemId, quantity };
  } catch (error) {
    console.error("Error updating cart quantity in Firestore:", error);
    throw error;
  }
}

export async function deleteCartItem(cartItemId) {
  try {
    await deleteDoc(doc(db, 'cart', cartItemId));
    return { ok: true };
  } catch (error) {
    console.error("Error deleting cart item from Firestore:", error);
    throw error;
  }
}

export async function clearCart(userId) {
  try {
    const q = query(collection(db, 'cart'), where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error clearing cart from Firestore:", error);
    throw error;
  }
}

export async function createOrder(userId, orderData, cartItems) {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      user_id: userId,
      total_amount: orderData.total_amount,
      delivery_address: orderData.delivery_address,
      phone: orderData.phone,
      status: 'pending',
      created_at: serverTimestamp()
    });

    const orderItemsPromises = cartItems.map(item => addDoc(collection(db, 'order_items'), {
      order_id: orderRef.id,
      product_id: item.product_id,
      product_name: item.products.name,
      quantity: item.quantity,
      price: item.products.price
    }));
    await Promise.all(orderItemsPromises);

    await clearCart(userId);

    return { id: orderRef.id };
  } catch (error) {
    console.error("Error creating order in Firestore:", error);
    throw error;
  }
}

export async function getOrders(userId) {
  try {
    const q = query(collection(db, 'orders'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return Promise.all(snapshot.docs.map(async (doc) => {
      const order = { id: doc.id, ...doc.data() };
      const itemsQuery = query(collection(db, 'order_items'), where('order_id', '==', order.id));
      const itemsSnapshot = await getDocs(itemsQuery);
      order.order_items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }));
      return order;
    }));
  } catch (error) {
    console.error("Error getting orders from Firestore:", error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return Promise.all(snapshot.docs.map(async (doc) => {
      const order = { id: doc.id, ...doc.data() };
      const itemsQuery = query(collection(db, 'order_items'), where('order_id', '==', order.id));
      const itemsSnapshot = await getDocs(itemsQuery);
      order.order_items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }));
      return order;
    }));
  } catch (error) {
    console.error("Error getting all orders from Firestore:", error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    return { id: orderId, status };
  } catch (error) {
    console.error("Error updating order status in Firestore:", error);
    throw error;
  }
}
