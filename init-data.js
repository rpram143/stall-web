import { getFromStorage, setInStorage } from './db.js';

const sampleProducts = [
  {
    id: '1',
    name: 'Chocolate Truffle',
    description: 'Rich chocolate truffle with a smooth ganache center, decorated with cocoa powder',
    price: 299,
    image_url: '/images/chocolate%20truffle.webp',
    category: 'Chocolates',
    stock: 50
  },
  {
    id: '2',
    name: 'Mysore Pak',
    description: 'Traditional South Indian sweet made with finest besan flour and pure ghee',
    price: 399,
    image_url: '/images/mysore%20pak.webp',
    category: 'Traditional',
    stock: 40
  },
  {
    id: '3',
    name: 'Kaju Barfi',
    description: 'Premium cashew fudge with pure silver foil garnish, perfect gift for special occasions',
    price: 599,
    image_url: '/images/kaju%20barfi.webp',
    category: 'Traditional',
    stock: 35
  },
  {
    id: '4',
    name: 'Gulab Jamun',
    description: 'Soft khoya dumplings soaked in cardamom and rose-scented sugar syrup',
    price: 249,
    image_url: '/images/gulab%20jamun.webp',
    category: 'Traditional',
    stock: 60
  },
  {
    id: '5',
    name: 'Rasgulla',
    description: 'Bengali specialty: Soft and spongy cottage cheese balls in light sugar syrup',
    price: 299,
    image_url: '/images/rasagulla.webp',
    category: 'Traditional',
    stock: 45
  },
  {
    id: '6',
    name: 'Jalebi',
    description: 'Crispy, syrup-soaked spirals with saffron and cardamom flavor, served warm',
    price: 199,
    image_url: '/images/jalebi.webp',
    category: 'Traditional',
    stock: 70
  },
  {
    id: '7',
    name: 'Badam Halwa',
    description: 'Rich almond pudding made with pure ghee and garnished with nuts',
    price: 499,
    image_url: '/images/badam%20halwa.webp',
    category: 'Traditional',
    stock: 30
  },
  {
    id: '8',
    name: 'Pista Roll',
    description: 'Delicate rolled sweet filled with crushed pistachios and cardamom',
    price: 449,
    image_url: '/images/pista%20roll.webp',
    category: 'Traditional',
    stock: 40
  },
  {
    id: '9',
    name: 'Laddu',
    description: 'Round, melt-in-mouth sweet balls made with gram flour, sugar and ghee',
    price: 179,
    image_url: '/images/laddu.webp',
    category: 'Traditional',
    stock: 80
  },
  {
    id: '10',
    name: 'Barfi Mix',
    description: 'Assorted barfi with different flavors including plain, chocolate, and pistachio',
    price: 399,
    image_url: '/images/barfi%20mix.webp',
    category: 'Traditional',
    stock: 50
  },
  {
    id: '11',
    name: 'Soan Papdi',
    description: 'Flaky, crispy sweet made with flour, sugar, ghee and cardamom',
    price: 219,
    image_url: '/images/soan%20pabdi.webp',
    category: 'Traditional',
    stock: 45
  },
  {
    id: '12',
    name: 'Halwa Mix',
    description: 'Assorted halwa including carrot, sooji, and besan halwa with dry fruits',
    price: 329,
    image_url: '/images/halwa%20mix.webp',
    category: 'Traditional',
    stock: 40
  }
];

export function initializeProducts() {
  const existingProducts = getFromStorage('products') || [];
  
  // Check if we need to add new products
  const newProducts = sampleProducts.filter(sp => 
    !existingProducts.find(ep => ep.id === sp.id)
  );
  
  if (existingProducts.length === 0) {
    // No products exist, initialize all
    setInStorage('products', sampleProducts);
    console.log('Sample products initialized');
  } else if (newProducts.length > 0) {
    // Add only new products that don't exist
    const updatedProducts = [...existingProducts, ...newProducts];
    setInStorage('products', updatedProducts);
    console.log(`Added ${newProducts.length} new products`);
  }
}