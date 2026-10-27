/* server.js — اجرای کامل سایت + پنل + API روی سیستم خودتان
 *
 *   npm install   → یک بار
 *   node server.js→ سپس:  http://localhost:3000
 *   سایت:  http://localhost:3000
 *   پنل:   http://localhost:3000/admin/
 *
 * داده‌ها در پوشه .data ذخیره می‌شوند (در حالت ابری، Vercel Blob جایگزین می‌شود)
 */
import http from 'node:http';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
};

// مسیرهایی که نباید از بیرون سرو شوند
const BLOCKED = ['.data', 'node_modules', '.env', '.git', '.vercel', 'server.js'];

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);

    /* ---------- API ---------- */
    if (pathname.startsWith('/api/')) {
      const name = pathname.slice(5).split('/')[0].replace(/\.js$/, '');
      const valid = /^(public-settings|contact|login|bootstrap|settings|messages|credentials|upload|serve)$/.test(name);
      if (!valid) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'مسیر پیدا نشد.' }));
      }
      const mod = await import(`./api/${name}.js?ts=${Date.now()}`);
      return mod.default(req, res);
    }

    /* ---------- ریدایرکت‌های تمیز ---------- */
    if (pathname === '/admin') {
      res.statusCode = 301;
      res.setHeader('Location', '/admin/');
      return res.end();
    }

    /* ---------- فایل استاتیک ---------- */
    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }
    if (BLOCKED.some((b) => filePath.includes(path.join(ROOT, b)))) {
      res.statusCode = 404;
      return res.end('Not found');
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      // fallback به index.html سایت
      const fallback = path.join(ROOT, 'index.html');
      if (!existsSync(fallback)) {
        res.statusCode = 404;
        return res.end('Not found');
      }
      res.setHeader('Content-Type', MIME['.html']);
      return res.end(await fsp.readFile(fallback));
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(await fsp.readFile(filePath));
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log('──────────────────────────────────────────');
  console.log('  سایت:  http://localhost:' + PORT);
  console.log('  پنل:   http://localhost:' + PORT + '/admin/');
  console.log('──────────────────────────────────────────');
});
