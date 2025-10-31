import { getFromStorage, setInStorage } from './db.js';

const sampleProducts = [
  // Sweet Category
  {
    id: '1',
    name: 'Mysore Pak',
    description: 'Traditional South Indian sweet made with finest besan flour and pure ghee',
    price: 399,
    image_url: '/images/mysore-pak.jpg',
    category: 'Sweet',
    stock: 40
  },
  {
    id: '2',
    name: 'Kaju Barfi',
    description: 'Premium cashew fudge with pure silver foil garnish, perfect gift for special occasions',
    price: 599,
    image_url: '/images/kaju-barfi.jpg',
    category: 'Sweet',
    stock: 35
  },
  {
    id: '3',
    name: 'Gulab Jamun',
    description: 'Soft khoya dumplings soaked in cardamom and rose-scented sugar syrup',
    price: 249,
    image_url: '/images/gulab-jamun.jpg',
    category: 'Sweet',
    stock: 60
  },
  {
    id: '4',
    name: 'Rasgulla',
    description: 'Bengali specialty: Soft and spongy cottage cheese balls in light sugar syrup',
    price: 299,
    image_url: '/images/rasgulla.jpg',
    category: 'Sweet',
    stock: 45
  },
  {
    id: '5',
    name: 'Badam Halwa',
    description: 'Rich almond pudding made with pure ghee and garnished with nuts',
    price: 499,
    image_url: '/images/badam-halwa.jpg',
    category: 'Sweet',
    stock: 30
  },
  {
    id: '6',
    name: 'Pista Roll',
    description: 'Delicate rolled sweet filled with crushed pistachios and cardamom',
    price: 449,
    image_url: '/images/pista-roll.jpg',
    category: 'Sweet',
    stock: 40
  },
  {
    id: '7',
    name: 'Laddu',
    description: 'Traditional besan laddus made with ghee and cardamom, perfect for festivals',
    price: 349,
    image_url: '/images/laddu.webp',
    category: 'Sweet',
    stock: 55
  },
  {
    id: '8',
    name: 'Soan Papdi',
    description: 'Crispy and flaky sweet made with besan flour and ghee',
    price: 299,
    image_url: '/images/soan-pabdi.webp',
    category: 'Sweet',
    stock: 45
  },

  // Spicy Category
  {
    id: '9',
    name: 'Spicy Murukku',
    description: 'Crispy rice flour spirals with red chili and sesame seeds',
    price: 199,
    image_url: '/images/murukku.webp',
    category: 'Spicy',
    stock: 70
  },
  {
    id: '10',
    name: 'Chili Jalebi',
    description: 'Traditional jalebi infused with spicy chili oil for a unique twist',
    price: 249,
    image_url: '/images/jalebi.webp',
    category: 'Spicy',
    stock: 40
  },

  // Salty Category
  {
    id: '11',
    name: 'Butter Murukku',
    description: 'Traditional South Indian savory snack made with rice flour and butter',
    price: 179,
    image_url: '/images/murukku.webp',
    category: 'Salty',
    stock: 80
  },
  {
    id: '12',
    name: 'Chakli',
    description: 'Spiral-shaped savory snack made with rice flour and spices',
    price: 229,
    image_url: '/images/chakli.webp',
    category: 'Salty',
    stock: 60
  },

  // Combinations Category
  {
    id: '13',
    name: 'Chocolate Truffle',
    description: 'Rich chocolate truffle with a smooth ganache center, decorated with cocoa powder',
    price: 299,
    image_url: '/images/chocolate-truffle.jpg',
    category: 'Combinations',
    stock: 50
  },
  {
    id: '14',
    name: 'Jalebi',
    description: 'Crispy, syrup-soaked spirals with saffron and cardamom flavor, served warm',
    price: 199,
    image_url: '/images/jalebi.jpg',
    category: 'Combinations',
    stock: 70
  },
  {
    id: '15',
    name: 'Barfi Mix',
    description: 'Assortment of different barfi varieties - kaju, pista, and chocolate',
    price: 699,
    image_url: '/images/barfi-mix.webp',
    category: 'Combinations',
    stock: 25
  },
  {
    id: '16',
    name: 'Halwa Mix',
    description: 'Delicious mix of badam halwa and carrot halwa with nuts',
    price: 549,
    image_url: '/images/halwa-mix.webp',
    category: 'Combinations',
    stock: 30
  }
];

export function initializeProducts() {
  const existingProducts = getFromStorage('products');
  if (!existingProducts || existingProducts.length === 0) {
    setInStorage('products', sampleProducts);
    console.log('Sample products initialized');
  }
}