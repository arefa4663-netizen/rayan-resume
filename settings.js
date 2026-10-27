// کلیدهای مجاز تنظیمات و اعتبارسنجی مقادیر
import { getJSON, putJSON } from './store.js';

export const SETTINGS_KEY = 'settings.json';

// کلیدهایی که به‌صورت عمومی در اختیار سایت قرار می‌گیرند
export const PUBLIC_KEYS = [
  'primary_color', 'background_color',
  'site_title', 'tagline', 'profile_name', 'footer_name', 'footer_text',
  'about_1', 'about_2',
  'age', 'email', 'phone', 'address', 'language',
  'telegram_account_1', 'telegram_account_2',
  'social_telegram', 'social_instagram', 'social_facebook', 'social_twitter',
  'social_whatsapp', 'social_linkedin', 'social_youtube', 'social_github',
  'profile_image', 'logo_image', 'hero_image',
  'skills',
];

const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function safeUrl(v) {
  const s = String(v).trim();
  if (!s) return '';
  if (/^(javascript|data|vbscript):/i.test(s)) return null;
  if (/^https?:\/\//i.test(s) || /^mailto:/i.test(s) || /^tg:\/\//i.test(s) || /^\//.test(s)) return s;
  // مقادیر ساده مثل @username را می‌پذیریم (در اسکریپت سایت به لینک تبدیل می‌شوند)
  if (/^@[\w.\-]+$/.test(s)) return s;
  return null;
}

// اعتبارسنجی و پاکسازی مقادیر ارسالی از پنل
export function sanitize(input) {
  const out = {};
  for (const key of PUBLIC_KEYS) {
    if (!(key in input)) continue;
    const v = input[key];
    if (v === null || v === undefined) continue;
    if (key === 'skills') {
      let arr = v;
      if (typeof arr === 'string') {
        try { arr = JSON.parse(arr); } catch { arr = null; }
      }
      if (!Array.isArray(arr)) return { error: 'فهرست مهارت‌ها معتبر نیست.' };
      if (arr.length > 6) return { error: 'حداکثر ۶ مهارت مجاز است.' };
      const clean = [];
      for (const it of arr) {
        const name = String(it?.name ?? '').trim().slice(0, 60);
        let value = Number(it?.value ?? 0);
        if (!isFinite(value)) value = 0;
        value = Math.max(0, Math.min(100, Math.round(value)));
        clean.push({ name, value });
      }
      out[key] = JSON.stringify(clean);
      continue;
    }
    const s = String(v).trim();
    if (s.length > 5000) return { error: 'یکی از مقادیر بیش از حد طولانی است.' };
    if (key === 'primary_color' || key === 'background_color') {
      if (s && !COLOR_RE.test(s)) return { error: 'فرمت رنگ معتبر نیست (مثال: #378C3F).' };
      out[key] = s;
      continue;
    }
    if (key.startsWith('social_') || key === 'profile_image' || key === 'logo_image' || key === 'hero_image') {
      const u = safeUrl(s);
      if (u === null) return { error: 'لینک واردشده معتبر نیست.' };
      out[key] = u;
      continue;
    }
    out[key] = s;
  }
  return { value: out };
}

export async function readSettings() {
  return (await getJSON(SETTINGS_KEY)) || {};
}

export async function writeSettings(settings) {
  await putJSON(SETTINGS_KEY, settings);
}

// نسخه عمومی تنظیمات (بدون اطلاعات مدیر)
export function publicView(settings) {
  const out = {};
  for (const k of PUBLIC_KEYS) if (settings[k] !== undefined) out[k] = settings[k];
  return out;
}
