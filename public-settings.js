// GET /api/public-settings — تنظیمات عمومی سایت (قابل کش در لبه)
import { json, error } from './_lib/http.js';
import { readSettings, publicView } from './_lib/settings.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return error(res, 405, 'متد مجاز نیست.');
  try {
    const settings = await readSettings();
    json(res, 200, { settings: publicView(settings) }, {
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
    });
  } catch {
    // حتی اگر ذخیره‌سازی در دسترس نبود، سایت با ظاهر پیش‌فرض بالا می‌آید
    json(res, 200, { settings: {} }, { 'Cache-Control': 'no-store' });
  }
}
