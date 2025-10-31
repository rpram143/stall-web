import { defineConfig } from 'vite';

export default defineConfig({
  base: '/stall-web/',
  server: {
    port: 5178,
    open: true
  },
  build: {
    outDir: 'docs',
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
