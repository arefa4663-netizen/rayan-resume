// GET /api/serve?key=uploads/xxx — سرو فایل‌های آپلودشده فقط در حالت محلی (بدون Vercel Blob)
import { error } from './_lib/http.js';
import { isBlobMode } from './_lib/store.js';
import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export default async function handler(req, res) {
  if (isBlobMode()) return error(res, 404, 'در حالت ابری این مسیر استفاده نمی‌شود.');
  try {
    const url = new URL(req.url, 'http://local');
    const key = url.searchParams.get('key') || '';
    if (!/^uploads\/[\w.\-]+$/.test(key)) return error(res, 400, 'مسیر نامعتبر است.');
    const p = path.join(process.cwd(), '.data', key);
    if (!fs.existsSync(p)) return error(res, 404, 'فایل پیدا نشد.');
    res.setHeader('Content-Type', MIME[path.extname(p).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    fs.createReadStream(p).pipe(res);
  } catch {
    error(res, 500, 'خطا در نمایش فایل.');
  }
}
