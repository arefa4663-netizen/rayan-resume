// POST /api/upload — آپلود تصویر (لوگو / عکس پروفایل / پس‌زمینه هدر)
// تصویر در سمت مرورگر کوچک و به base64 تبدیل شده و اینجا در Blob (یا .data محلی) ذخیره می‌شود.
import { json, error, readBody } from './_lib/http.js';
import { requireAuth } from './_lib/auth.js';
import { putFile, newId } from './_lib/store.js';

const ALLOWED = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 405, 'متد مجاز نیست.');
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    const b = await readBody(req, 1024 * 1024 * 4);
    const dataUrl = String(b.data ?? '');
    const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(dataUrl);
    if (!m) return error(res, 422, 'فایل ارسالی معتبر نیست.');
    const [, mime, base64] = m;
    const ext = ALLOWED[mime];
    if (!ext) return error(res, 422, 'فقط تصویر PNG، JPG یا WebP مجاز است.');

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 3 * 1024 * 1024) return error(res, 422, 'حجم تصویر باید کمتر از ۳ مگابایت باشد.');

    const key = `uploads/${Date.now().toString(36)}-${newId()}.${ext}`;
    const { url } = await putFile(key, buffer, mime);
    json(res, 200, { ok: true, url });
  } catch {
    error(res, 500, 'خطا در ذخیره فایل.');
  }
}
