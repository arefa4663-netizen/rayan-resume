import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ساخت پنل مدیریت (React) → پوشه admin/
// سایت اصلی (index.html) هیچ تغییری در بیلد نمی‌کند و همان فایل‌های خودش را می‌خواند.
export default defineConfig({
  plugins: [react()],
  root: 'admin-src',
  base: '/admin/',
  build: {
    outDir: '../admin',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    host: true,
    // در حالت dev پنل، درخواست‌های API به سرور محلی (node server.js) منتقل می‌شوند
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
