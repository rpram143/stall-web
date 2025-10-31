import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5178,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        auth: './auth.html',
        admin: './admin.html',
        cart: './cart.html',
        orders: './orders.html',
        sweets: './sweets.html'
      }
    }
  }
});
