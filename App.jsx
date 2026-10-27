import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Messages from './components/Messages.jsx';
import Appearance from './components/Appearance.jsx';
import ContentTab from './components/ContentTab.jsx';
import ProfileMedia from './components/ProfileMedia.jsx';
import ContactTab from './components/ContactTab.jsx';
import Security from './components/Security.jsx';
import { Toasts, ConfirmModal } from './components/Ui.jsx';

export const DEFAULT_SETTINGS = {
  primary_color: '#378C3F',
  background_color: '',
  site_title: '',
  tagline: '',
  profile_name: '',
  footer_name: '',
  footer_text: '',
  about_1: '',
  about_2: '',
  age: '',
  email: '',
  phone: '',
  address: '',
  language: '',
  telegram_account_1: '',
  telegram_account_2: '',
  social_telegram: '',
  social_instagram: '',
  social_facebook: '',
  social_twitter: '',
  social_whatsapp: '',
  social_linkedin: '',
  social_youtube: '',
  social_github: '',
  profile_image: '',
  logo_image: '',
  hero_image: '',
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [pageErr, setPageErr] = useState('');
  const [pageOk, setPageOk] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);

  /* ---------- توست ---------- */
  const toast = useCallback((type, text) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, hide: true } : x))), 3200);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  /* ---------- مودال تأیید ---------- */
  const confirmDialog = useCallback((opts) => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState(opts);
    });
  }, []);
  const closeConfirm = (result) => {
    setConfirmState(null);
    if (confirmResolver.current) confirmResolver.current(result);
  };

  /* ---------- رنگ اکسنت پنل = رنگ سایت ---------- */
  useEffect(() => {
    const c = draft.primary_color || '#378C3F';
    const root = document.documentElement;
    root.style.setProperty('--accent', c);
    const n = parseInt(c.slice(1), 16);
    const dk = (v, f) => Math.max(0, Math.min(255, Math.round(v * (1 + f))));
    const dark =
      '#' +
      [dk((n >> 16) & 255, -0.18), dk((n >> 8) & 255, -0.18), dk(n & 255, -0.18)]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');
    root.style.setProperty('--accent-dark', dark);
    root.style.setProperty('--accent-soft', `${c}22`);
  }, [draft.primary_color]);

  /* ---------- بارگذاری داده ---------- */
  const load = useCallback(async () => {
    setBusy(true);
    setPageErr('');
    try {
      const d = await api.bootstrap();
      setUser(d.user);
      setMessages(d.messages || []);
      const merged = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
      if (typeof merged.skills === 'string') {
        try {
          merged.skills = JSON.parse(merged.skills || '[]');
        } catch {
          merged.skills = [];
        }
      }
      setDraft(merged);
      setSaved(merged);
      return true;
    } catch (e) {
      if (e.code === 401) {
        setToken('');
        setUser(null);
      } else {
        setPageErr(e.message);
      }
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getToken()) await load();
      setReady(true);
    })();
  }, [load]);

  // هر بار که تب پیام‌ها باز می‌شود، پیام‌های جدید بارگیری شوند
  useEffect(() => {
    if (user && tab === 'messages') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ---------- عملیات ---------- */
  const handleLogin = async (username, password) => {
    const d = await api.login(username, password);
    setToken(d.token);
    setUser({ username: d.username });
    await load();
    toast('success', 'خوش آمدید! با موفقیت وارد شدید.');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setMessages([]);
    setDraft(DEFAULT_SETTINGS);
    setSaved(DEFAULT_SETTINGS);
    setTab('dashboard');
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const saveSettings = async (extra) => {
    setBusy(true);
    setPageErr('');
    setPageOk('');
    try {
      const payload = { ...draft, ...(extra || {}) };
      const clone = { ...payload };
      clone.skills = JSON.stringify(payload.skills || []);
      const clean = {};
      Object.keys(clone).forEach((k) => {
        if (clone[k] !== undefined && clone[k] !== null) clean[k] = clone[k];
      });
      await api.saveSettings(clean);
      const next = { ...draft, ...(extra || {}) };
      setSaved(next);
      setDraft(next);
      setPageOk('تغییرات با موفقیت ذخیره شد و به‌زودی روی سایت اعمال می‌شود.');
      toast('success', 'تنظیمات ذخیره شد ✓');
      return true;
    } catch (e) {
      setPageErr(e.message);
      toast('error', 'ذخیره‌سازی ناموفق بود');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const messageAction = async (id, action) => {
    try {
      const d = await api.messageAction(id, action);
      if (action === 'delete') {
        setMessages((m) => m.filter((x) => x.id !== id));
        toast('success', 'پیام حذف شد.');
      } else {
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, is_read: d.is_read } : x)));
        toast('success', d.is_read ? 'به‌عنوان خوانده‌شده علامت خورد.' : 'به حالت خوانده‌نشده برگشت.');
      }
    } catch (e) {
      toast('error', e.message);
    }
  };

  if (!ready) {
    return (
      <div className="login">
        <span className="blob b1" />
        <span className="blob b2" />
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="logo">R</div>
          <p style={{ marginBottom: 0 }}>در حال بارگذاری پنل…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toasts toasts={toasts} />
      </>
    );
  }

  const tabs = {
    dashboard: { title: 'داشبورد', sub: 'نمای کلی از سایت و پیام‌های کاربران' },
    messages: { title: 'نظرات و پیام‌ها', sub: 'پیام‌های ارسال‌شده از فرم «ارتباط با من» سایت' },
    appearance: { title: 'ظاهر و تم', sub: 'رنگ اصلی سایت را به دلخواه خودتان تغییر دهید' },
    content: { title: 'محتوای سایت', sub: 'عنوان‌ها، معرفی، متن‌های درباره من و مهارت‌ها' },
    profile: { title: 'پروفایل و تصاویر', sub: 'نام، عکس پروفایل، لوگو و پس‌زمینه هدر' },
    contact: { title: 'تماس و شبکه‌های اجتماعی', sub: 'تلفن، ایمیل، آدرس و لینک شبکه‌های اجتماعی' },
    security: { title: 'امنیت', sub: 'تغییر نام کاربری و رمز عبور پنل' },
  };

  return (
    <div className="layout">
      <Sidebar
        tab={tab}
        setTab={setTab}
        unread={messages.filter((m) => !m.is_read).length}
        onLogout={handleLogout}
        username={user.username}
      />
      <main className="main">
        <Topbar
          title={tabs[tab].title}
          sub={tabs[tab].sub}
          username={user.username}
          onLogout={handleLogout}
        />
        <div className="main-inner">
          {pageErr && <div className="alert error">⚠ {pageErr}</div>}
          {pageOk && <div className="alert success">✓ {pageOk}</div>}

          {tab === 'dashboard' && (
            <Dashboard
              user={user}
              messages={messages}
              draft={draft}
              busy={busy}
              setTab={setTab}
              messageAction={messageAction}
            />
          )}
          {tab === 'messages' && (
            <Messages
              messages={messages}
              messageAction={messageAction}
              confirmDialog={confirmDialog}
              busy={busy}
              onRefresh={load}
            />
          )}
          {tab === 'appearance' && (
            <Appearance draft={draft} setDraft={setDraft} save={saveSettings} busy={busy} dirty={dirty} />
          )}
          {tab === 'content' && (
            <ContentTab draft={draft} setDraft={setDraft} save={saveSettings} busy={busy} dirty={dirty} />
          )}
          {tab === 'profile' && (
            <ProfileMedia
              draft={draft}
              setDraft={setDraft}
              save={saveSettings}
              busy={busy}
              dirty={dirty}
              toast={toast}
            />
          )}
          {tab === 'contact' && (
            <ContactTab draft={draft} setDraft={setDraft} save={saveSettings} busy={busy} dirty={dirty} />
          )}
          {tab === 'security' && (
            <Security
              user={user}
              setUser={setUser}
              setToken_={(t) => localStorage.setItem('rayan_admin_token', t)}
              toast={toast}
            />
          )}

          <div className="admin-footer">
            پنل مدیریت رزومه — نسخه ۲.۰ ساخته‌شده برای Vercel · <a href="/" target="_blank" rel="noreferrer">مشاهده سایت</a>
          </div>
        </div>
      </main>
      <Toasts toasts={toasts} />
      {confirmState && <ConfirmModal state={confirmState} onClose={closeConfirm} />}
    </div>
  );
}
