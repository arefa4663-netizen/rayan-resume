// POST /api/login — ورود مدیر و دریافت توکن
import { json, error, readBody, clientIp } from './_lib/http.js';
import { checkCredentials, issueToken, loginThrottle } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 405, 'متد مجاز نیست.');
  try {
    const ip = clientIp(req);
    if (!loginThrottle(ip)) return error(res, 429, 'تلاش‌های ناموفق زیاد است. ۵ دقیقه بعد دوباره امتحان کنید.');

    const b = await readBody(req);
    const username = String(b.username ?? '').trim();
    const password = String(b.password ?? '');
    if (!username || !password) return error(res, 422, 'نام کاربری و رمز عبور الزامی است.');

    const ok = await checkCredentials(username, password);
    if (!ok) return error(res, 401, 'نام کاربری یا رمز عبور اشتباه است.');

    const token = await issueToken(username);
    json(res, 200, { ok: true, token, username });
  } catch {
    error(res, 500, 'خطای داخلی سرور.');
  }
}
