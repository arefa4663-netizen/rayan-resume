// POST /api/messages — عملیات روی پیام‌ها: خوانده‌شده/خوانده‌نشده، حذف
import { json, error, readBody } from './_lib/http.js';
import { requireAuth } from './_lib/auth.js';
import { getJSON, putJSON, deleteKey } from './_lib/store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 405, 'متد مجاز نیست.');
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    const b = await readBody(req);
    const id = String(b.id ?? '').trim();
    const action = String(b.action ?? '');
    if (!id || !/^[\w\-]+$/.test(id)) return error(res, 422, 'شناسه پیام معتبر نیست.');

    const key = `messages/${id}.json`;
    if (action === 'delete') {
      await deleteKey(key);
      return json(res, 200, { ok: true, deleted: true });
    }
    if (action === 'read') {
      const msg = await getJSON(key);
      if (!msg) return error(res, 404, 'پیام پیدا نشد.');
      msg.is_read = !msg.is_read;
      await putJSON(key, msg);
      return json(res, 200, { ok: true, is_read: msg.is_read });
    }
    error(res, 422, 'عملیات نامعتبر است.');
  } catch {
    error(res, 500, 'خطای داخلی سرور.');
  }
}
