import React, { useState } from 'react';
import { LogIn, Globe, Loader2 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await onLogin(form.username.trim(), form.password);
    } catch (ex) {
      setErr(ex.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login">
      <span className="blob b1" />
      <span className="blob b2" />
      <a className="login-home-link" href="/" target="_blank" rel="noreferrer">
        <Globe size={15} /> مشاهده سایت
      </a>
      <form className={`login-card ${shake ? 'shake' : ''}`} onSubmit={submit}>
        <div className="logo">R</div>
        <h1>پنل مدیریت رزومه</h1>
        <p>مدیریت سایت، تم، اطلاعات تماس و نظرات کاربران</p>
        {err && <div className="alert error">⚠ {err}</div>}
        <label>
          نام کاربری
          <input
            dir="ltr"
            autoComplete="username"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>
          رمز عبور
          <input
            dir="ltr"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button className="login-btn" type="submit" disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={17} className="spin" style={{ verticalAlign: '-3px' }} /> در حال بررسی…
            </>
          ) : (
            <>
              <LogIn size={17} style={{ verticalAlign: '-3px' }} /> ورود به پنل
            </>
          )}
        </button>
        <small>برای امنیت بیشتر، بعد از اولین ورود رمز عبور را از بخش «امنیت» تغییر دهید.</small>
      </form>
    </main>
  );
}
