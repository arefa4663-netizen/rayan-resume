// احراز هویت مدیر: توکن امضاشده HMAC + هش رمز با scrypt
// نام کاربری و رمز پیش‌فرض: rayan1234 / 123456 (قابل تغییر با متغیرهای محیطی یا از خود پنل)
import crypto from 'node:crypto';
import { getJSON, putJSON } from './store.js';

const SETTINGS_KEY = 'settings.json';
const DEFAULT_USER = process.env.ADMIN_USERNAME || 'rayan1234';
const DEFAULT_PASS = process.env.ADMIN_PASSWORD || '123456';
const TOKEN_DAYS = 7;

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function hmac(secret, data) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// رمز عبور را به هش scrypt تبدیل می‌کند
export function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), s, 64).toString('hex');
  return { salt: s, hash };
}

export function verifyPassword(password, salt, hash) {
  try {
    const calc = crypto.scryptSync(String(password), salt, 64).toString('hex');
    return timingSafeEqualStr(calc, hash);
  } catch {
    return false;
  }
}

// مشخصات مدیر: اگر از پنل تغییر داده شده باشد در settings.json ذخیره شده،
// وگرنه از متغیرهای محیطی (یا پیش‌فرض) استفاده می‌شود
export async function getAdminAccount() {
  const settings = (await getJSON(SETTINGS_KEY)) || {};
  const a = settings.admin || {};
  if (a.username && a.salt && a.hash) {
    return { username: a.username, salt: a.salt, hash: a.hash, fromStore: true };
  }
  return { username: DEFAULT_USER, envPassword: DEFAULT_PASS, fromStore: false };
}

export async function checkCredentials(username, password) {
  const acc = await getAdminAccount();
  if (String(username) !== acc.username) return false;
  if (acc.fromStore) return verifyPassword(password, acc.salt, acc.hash);
  return timingSafeEqualStr(String(password), acc.envPassword);
}

// ذخیره نام کاربری/رمز جدید در settings.json
export async function saveAdminAccount(username, password) {
  const settings = (await getJSON(SETTINGS_KEY)) || {};
  const { salt, hash } = hashPassword(password);
  settings.admin = { ...(settings.admin || {}), username, salt, hash };
  await putJSON(SETTINGS_KEY, settings);
  return true;
}

// کلید امضای توکن: متغیر محیطی، وگرنه یک کلید تصادفی که یک بار ساخته و ذخیره می‌شود
export async function getSecret() {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  const settings = (await getJSON(SETTINGS_KEY)) || {};
  if (settings.admin && settings.admin.secret) return settings.admin.secret;
  const secret = crypto.randomBytes(32).toString('hex');
  settings.admin = { ...(settings.admin || {}), secret };
  await putJSON(SETTINGS_KEY, settings);
  return secret;
}

export async function issueToken(username) {
  const secret = await getSecret();
  const payload = b64url(JSON.stringify({ u: username, exp: Date.now() + TOKEN_DAYS * 864e5 }));
  return `${payload}.${hmac(secret, payload)}`;
}

export async function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  try {
    const secret = await getSecret();
    if (!timingSafeEqualStr(hmac(secret, payload), sig)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.u || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

// استخراج توکن از هدر Authorization
export function tokenFromReq(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}

// محافظت مسیرهای مدیریتی — در صورت نامعتبر بودن، پاسخ 401 می‌دهد و false برمی‌گرداند
export async function requireAuth(req, res) {
  const data = await verifyToken(tokenFromReq(req));
  if (!data) {
    const { error } = await import('./http.js');
    error(res, 401, 'ابتدا وارد پنل شوید.');
    return null;
  }
  return data;
}

// محدودیت تلاش ناموفق ورود (به ازای هر نمونه تابع)
const attempts = new Map();
export function loginThrottle(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const list = (attempts.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= 10) {
    attempts.set(ip, list);
    return false;
  }
  list.push(now);
  attempts.set(ip, list);
  return true;
}
