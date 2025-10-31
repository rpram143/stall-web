# Rajesh Sweet Stall - Sweet E-commerce Platform

A modern web application for ordering traditional Indian sweets, built with Firebase for scalable backend services.

## Features

- **User Authentication**: Secure registration and login with Firebase Auth
- **Product Management**: Browse and manage sweet products with real-time inventory
- **Shopping Cart**: Add, update, and remove items from cart
- **Order Management**: Place orders with delivery details and track order status
- **Admin Panel**: Manage users, orders, and products (for admin users)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Firebase Setup

This project uses Firebase for backend services. To set up:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "rajesh-sweet-stall"
   - Enable Firestore Database and Authentication

2. **Enable Authentication**:
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Get Service Account Key**:
   - Go to Project Settings > Service accounts
   - Generate a new private key (JSON)
   - Save it as `firebase-service-account.json` in the project root

4. **Firebase Config**:
   - The config is already included in `db.js` and `server/index.js`
   - Make sure your Firebase project matches the config values

## Running the Application

### Backend Server (Firebase + Express)

1. Install server dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

The server runs on http://localhost:4000 and provides REST API endpoints.

### Frontend (Vanilla JS + HTML/CSS)

1. Install frontend dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - Get all products
- `GET /api/images` - Get all images
- `GET /api/images/:id` - Get image by ID
- `POST /api/images` - Add new image
- `PUT /api/images/:id` - Update image
- `DELETE /api/images/:id` - Delete image
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/cart?user_id=<id>` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Place new order
- `GET /api/orders?user_id=<id>` - Get user's orders

## Demo Credentials

- **Email**: demo@example.com
- **Password**: demo123

## Project Structure

```
├── server/                 # Express backend server
│   ├── index.js           # Main server file with Firebase integration
│   ├── seed-firebase.js   # Script to seed Firestore with products
│   └── package.json       # Server dependencies
├── public/                # Static assets
│   └── images/           # Product images
├── db.js                  # Client-side Firebase utilities
├── auth.js               # Authentication logic
├── *.html               # HTML pages
├── *.js                 # Client-side JavaScript
├── firebase-service-account.json  # Firebase service account (add this)
└── README.md            # This file
```

Sharing Your Project as ZIP
-----------------------------

**YES, you can share your project as a ZIP file!** The database will work perfectly.

1. **Compress the project folder** into a ZIP file (all files except `node_modules`)
2. **Share the ZIP** with your friends
3. **When they extract and open it:**
   - They can directly open `index.html` in a web browser
   - The app automatically uses **localStorage** (browser storage) if the server isn't running
   - All features work: login, products, cart, orders - everything!
   - Each user's data is stored in their own browser

**Note:** The server (`server/` folder) is optional. The app works perfectly without it using browser localStorage. The server is only needed if you want a shared database across multiple users on the same network.
