// GET /api/bootstrap — داده اولیه پنل: کاربر، پیام‌ها و تنظیمات
import { json, error } from './_lib/http.js';
import { requireAuth } from './_lib/auth.js';
import { listJSON } from './_lib/store.js';
import { readSettings, publicView } from './_lib/settings.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return error(res, 405, 'متد مجاز نیست.');
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    const rows = await listJSON('messages/');
    const messages = rows
      .map((r) => r.data)
      .filter((m) => m && m.id)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 1000)
      .map((m) => ({
        id: m.id,
        name: m.name || '',
        email: m.email || '',
        subject: m.subject || '',
        message: m.message || '',
        created_at: m.created_at || '',
        is_read: !!m.is_read,
      }));
    const settings = await readSettings();
    json(res, 200, {
      user: { username: auth.u },
      messages,
      settings: publicView(settings),
    });
  } catch {
    error(res, 500, 'خطای داخلی سرور.');
  }
}
