// POST /api/contact — دریافت پیام کاربران از فرم «ارتباط با من»
import { json, error, readBody, clientIp } from './_lib/http.js';
import { putJSON, newId } from './_lib/store.js';

// محدودیت نرخ ارسال برای هر نمونه تابع
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  const limited = list.length >= 5;
  list.push(now);
  hits.set(ip, list);
  return limited;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 405, 'متد مجاز نیست.');
  try {
    const b = await readBody(req, 512 * 1024);
    // تله اسپم (honeypot)
    if (String(b.website ?? '').trim() !== '') return json(res, 200, { ok: true });

    const ip = clientIp(req);
    if (rateLimited(ip)) return error(res, 429, 'تعداد درخواست‌ها زیاد است، کمی بعد دوباره تلاش کنید.');

    const name = String(b.name ?? '').trim();
    const email = String(b.email ?? '').trim();
    const subject = String(b.subject ?? '').trim();
    const message = String(b.message ?? '').trim();

    if (!name || name.length > 100) return error(res, 422, 'نام را وارد کنید (حداکثر ۱۰۰ نویسه).');
    if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
      return error(res, 422, 'ایمیل معتبر نیست.');
    if (subject.length > 200) return error(res, 422, 'موضوع بیش از حد طولانی است.');
    if (!message || message.length > 3000) return error(res, 422, 'متن پیام را وارد کنید (حداکثر ۳۰۰۰ نویسه).');

    const id = newId();
    await putJSON(`messages/${id}.json`, {
      id,
      name,
      email,
      subject,
      message,
      created_at: new Date().toISOString(),
      is_read: false,
    });
    json(res, 200, { ok: true });
  } catch {
    error(res, 500, 'خطای داخلی سرور.');
  }
}
