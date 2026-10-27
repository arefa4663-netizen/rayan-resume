// POST /api/credentials — تغییر نام کاربری / رمز عبور مدیر
import crypto from 'node:crypto';
import { json, error, readBody } from './_lib/http.js';
import {
  requireAuth, checkCredentials, saveAdminAccount, issueToken,
  getAdminAccount,
} from './_lib/auth.js';
import { getJSON, putJSON } from './_lib/store.js';
import { SETTINGS_KEY } from './_lib/settings.js';

async function rotateSecret() {
  const settings = (await getJSON(SETTINGS_KEY)) || {};
  if (settings.admin) settings.admin.secret = crypto.randomBytes(32).toString('hex');
  await putJSON(SETTINGS_KEY, settings);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return error(res, 405, 'متد مجاز نیست.');
  const auth = await requireAuth(req, res);
  if (!auth) return;
  try {
    const b = await readBody(req);
    const current = String(b.current ?? '');
    const username = String(b.username ?? '').trim();
    const password = String(b.password ?? '');
    const confirm = String(b.confirm ?? '');

    if (!(await checkCredentials(auth.u, current))) return error(res, 422, 'رمز فعلی صحیح نیست.');
    if (username.length < 3 || username.length > 80)
      return error(res, 422, 'نام کاربری باید بین ۳ تا ۸۰ نویسه باشد.');
    if (password || confirm) {
      if (password !== confirm) return error(res, 422, 'رمز جدید و تکرار آن یکسان نیستند.');
      if (password.length < 6) return error(res, 422, 'رمز جدید باید حداقل ۶ نویسه باشد.');
    }

    const account = await getAdminAccount();
    if (password) {
      // رمز جدید ذخیره می‌شود
      await saveAdminAccount(username, password);
    } else if (account.fromStore) {
      // فقط نام کاربری عوض می‌شود؛ هش رمز قبلی حفظ می‌شود
      const settings = (await getJSON(SETTINGS_KEY)) || {};
      settings.admin = { ...(settings.admin || {}), username };
      await putJSON(SETTINGS_KEY, settings);
    } else {
      // حساب هنوز در دیتابیس نیست؛ رمز فعلی (متغیر محیطی) به‌صورت هش ذخیره می‌شود
      await saveAdminAccount(username, account.envPassword);
    }

    await rotateSecret(); // باطل‌کردن نشست‌های قدیمی
    const token = await issueToken(username);
    json(res, 200, { ok: true, token, username });
  } catch {
    error(res, 500, 'خطای داخلی سرور.');
  }
}
