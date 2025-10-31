import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '..', 'firebase-service-account.json'), 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'rajesh-sweet-stall'
});

const db = admin.firestore();

const sampleProducts = [
  {
    id: '1',
    name: 'Chocolate Truffle',
    description: 'Rich chocolate truffle with a smooth ganache center, decorated with cocoa powder',
    price: 299,
    image_url: '/images/chocolate-truffle.jpg',
    category: 'Chocolates',
    stock: 50
  },
  {
    id: '2',
    name: 'Mysore Pak',
    description: 'Traditional South Indian sweet made with finest besan flour and pure ghee',
    price: 399,
    image_url: '/images/mysore-pak.jpg',
    category: 'Traditional',
    stock: 40
  },
  {
    id: '3',
    name: 'Kaju Barfi',
    description: 'Premium cashew fudge with pure silver foil garnish, perfect gift for special occasions',
    price: 599,
    image_url: '/images/kaju-barfi.jpg',
    category: 'Traditional',
    stock: 35
  },
  {
    id: '4',
    name: 'Gulab Jamun',
    description: 'Soft khoya dumplings soaked in cardamom and rose-scented sugar syrup',
    price: 249,
    image_url: '/images/gulab-jamun.jpg',
    category: 'Traditional',
    stock: 60
  },
  {
    id: '5',
    name: 'Rasgulla',
    description: 'Bengali specialty: Soft and spongy cottage cheese balls in light sugar syrup',
    price: 299,
    image_url: '/images/rasgulla.jpg',
    category: 'Traditional',
    stock: 45
  },
  {
    id: '6',
    name: 'Jalebi',
    description: 'Crispy, syrup-soaked spirals with saffron and cardamom flavor, served warm',
    price: 199,
    image_url: '/images/jalebi.jpg',
    category: 'Traditional',
    stock: 70
  },
  {
    id: '7',
    name: 'Badam Halwa',
    description: 'Rich almond pudding made with pure ghee and garnished with nuts',
    price: 499,
    image_url: '/images/badam-halwa.jpg',
    category: 'Traditional',
    stock: 30
  },
  {
    id: '8',
    name: 'Pista Roll',
    description: 'Delicate rolled sweet filled with crushed pistachios and cardamom',
    price: 449,
    image_url: '/images/pista-roll.jpg',
    category: 'Traditional',
    stock: 40
  }
];

async function seedFirestore() {
  try {
    console.log('Seeding Firestore...');

    // Seed products
    const productsRef = db.collection('products');
    for (const product of sampleProducts) {
      await productsRef.doc(product.id).set({
        ...product,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Products seeded.');

    // Seed images metadata (store image URLs in Firestore for better management)
    const imagesRef = db.collection('images');
    const imageMetadata = [
      { id: 'chocolate-truffle', name: 'Chocolate Truffle', url: '/images/chocolate-truffle.jpg', category: 'product' },
      { id: 'mysore-pak', name: 'Mysore Pak', url: '/images/mysore-pak.jpg', category: 'product' },
      { id: 'kaju-barfi', name: 'Kaju Barfi', url: '/images/kaju-barfi.jpg', category: 'product' },
      { id: 'gulab-jamun', name: 'Gulab Jamun', url: '/images/gulab-jamun.jpg', category: 'product' },
      { id: 'rasgulla', name: 'Rasgulla', url: '/images/rasgulla.jpg', category: 'product' },
      { id: 'jalebi', name: 'Jalebi', url: '/images/jalebi.jpg', category: 'product' },
      { id: 'badam-halwa', name: 'Badam Halwa', url: '/images/badam-halwa.jpg', category: 'product' },
      { id: 'pista-roll', name: 'Pista Roll', url: '/images/pista-roll.jpg', category: 'product' }
    ];

    for (const image of imageMetadata) {
      await imagesRef.doc(image.id).set({
        ...image,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Images metadata seeded.');

    // Create demo user (you'll need to create this user via Firebase Auth separately)
    // For now, we'll just note it - users are managed via Firebase Auth
    console.log('Demo user: Create via Firebase Auth with email: demo@example.com, password: demo123');

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  } finally {
    admin.app().delete();
  }
}

seedFirestore();
