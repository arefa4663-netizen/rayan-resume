import React, { useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';

export default function Security({ user, setUser, toast }) {
  const [form, setForm] = useState({ current: '', username: user.username || '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (form.password || form.confirm) {
      if (form.password !== form.confirm) {
        toast('error', 'رمز جدید و تکرار آن یکسان نیستند.');
        return;
      }
      if (form.password.length < 6) {
        toast('error', 'رمز جدید باید حداقل ۶ نویسه باشد.');
        return;
      }
    }
    setBusy(true);
    try {
      const d = await api.updateCredentials({
        current: form.current,
        username: form.username.trim(),
        password: form.password,
        confirm: form.confirm,
      });
      localStorage.setItem('rayan_admin_token', d.token);
      setUser({ username: d.username });
      setForm({ current: '', username: d.username, password: '', confirm: '' });
      toast('success', 'اطلاعات ورود با موفقیت به‌روزرسانی شد.');
    } catch (e) {
      toast('error', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>امنیت حساب مدیر</h3>
          <p>رمز عبور به‌صورت هش‌شده (scrypt) ذخیره می‌شود و هرگز قابل مشاهده نیست.</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field wide">
          <label>رمز عبور فعلی (برای تأیید)</label>
          <input dir="ltr" type="password" autoComplete="current-password" value={form.current} onChange={set('current')} />
        </div>
        <div className="field">
          <label>نام کاربری جدید</label>
          <input dir="ltr" type="text" autoComplete="username" value={form.username} onChange={set('username')} />
        </div>
        <div className="field">
          <label>رمز عبور جدید (اختیاری)</label>
          <input dir="ltr" type="password" autoComplete="new-password" placeholder="خالی = بدون تغییر" value={form.password} onChange={set('password')} />
        </div>
        <div className="field wide">
          <label>تکرار رمز عبور جدید</label>
          <input dir="ltr" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
          <small>اگر رمز جدید را خالی بگذارید، فقط نام کاربری تغییر می‌کند.</small>
        </div>
      </div>

      <hr className="divider" />

      <button className="btn-x primary" onClick={submit} disabled={busy}>
        {busy ? <span className="spin">⏳</span> : <Save size={16} />} ذخیره اطلاعات ورود
      </button>

      <hr className="divider" />

      <div className="alert success" style={{ marginBottom: 0 }}>
        <ShieldCheck size={18} />
        <span>
          بعد از تغییر رمز، نشست‌های دیگر (از جمله موبایل یا لپ‌تاپ دیگر) به‌صورت خودکار از پنل خارج می‌شوند.
        </span>
      </div>
    </section>
  );
}
