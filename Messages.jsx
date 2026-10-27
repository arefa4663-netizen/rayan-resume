import React, { useMemo, useState } from 'react';
import { Search, Check, RefreshCw, Trash2, MailOpen, Inbox } from 'lucide-react';
import { faDate } from '../api.js';

export default function Messages({ messages, messageAction, confirmDialog, busy, onRefresh }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = messages;
    if (filter === 'unread') list = list.filter((m) => !m.is_read);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(t) ||
          (m.email || '').toLowerCase().includes(t) ||
          (m.subject || '').toLowerCase().includes(t) ||
          (m.message || '').toLowerCase().includes(t)
      );
    }
    return list;
  }, [messages, q, filter]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const askDelete = async (m) => {
    const ok = await confirmDialog({
      title: 'حذف پیام',
      text: `پیام «${m.name || 'بدون نام'}» برای همیشه حذف می‌شود. مطمئن هستید؟`,
      danger: true,
    });
    if (ok) messageAction(m.id, 'delete');
  };

  return (
    <section className="panel" style={{ minHeight: 300 }}>
      <div className="panel-head">
        <div>
          <h3>نظرات و پیام‌های کاربران</h3>
          <p>خواندن، علامت‌گذاری و حذف پیام‌های ارسال‌شده از فرم تماس سایت</p>
        </div>
        <button className="btn-x secondary sm" onClick={onRefresh} disabled={busy}>
          <RefreshCw size={14} className={busy ? 'spin' : ''} /> تازه‌سازی
        </button>
      </div>

      <div className="msg-toolbar">
        <div className="chips">
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            همه <span className="cnt">{messages.length}</span>
          </button>
          <button className={`chip ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            خوانده‌نشده <span className="cnt">{unreadCount}</span>
          </button>
        </div>
        <label className="msg-search">
          <Search size={17} />
          <input
            placeholder="جست‌وجو در نام، ایمیل، موضوع یا متن پیام…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>

      {busy && <div className="skeleton" />}

      {!busy && !filtered.length && (
        <div className="empty">
          <div className="empty-ico">
            {messages.length ? <Search size={30} /> : <Inbox size={30} />}
          </div>
          <b>{messages.length ? 'نتیجه‌ای پیدا نشد' : 'صندوق پیام خالی است'}</b>
          <p>
            {messages.length
              ? 'عبارت جست‌وجو یا فیلتر را تغییر دهید.'
              : 'پیام‌هایی که بازدیدکنندگان از فرم «ارتباط با من» ارسال می‌کنند، اینجا ظاهر می‌شوند.'}
          </p>
        </div>
      )}

      {!busy &&
        filtered.map((m) => (
          <MessageCard key={m.id} m={m} messageAction={messageAction} askDelete={askDelete} />
        ))}
    </section>
  );
}

function MessageCard({ m, messageAction, askDelete }) {
  const [expanded, setExpanded] = useState(false);
  const long = (m.message || '').length > 260;
  const mailto = m.email
    ? `mailto:${m.email}?subject=${encodeURIComponent('پاسخ: ' + (m.subject || 'پیام شما'))}`
    : null;

  return (
    <article className={`message ${!m.is_read ? 'unread' : ''}`}>
      <div className="message-top">
        <span className="avatar">{(m.name || '?').trim()[0]}</span>
        <div>
          <b>
            {m.name || 'بدون نام'}
            {!m.is_read && <span className="unread-dot" title="خوانده‌نشده" />}
          </b>
          <small>{m.email || 'ایمیل ثبت نشده'}</small>
        </div>
        <time>{faDate(m.created_at)}</time>
      </div>
      {m.subject && <h4>{m.subject}</h4>}
      <p className={`message-text ${long && !expanded ? 'clamped' : ''}`}>{m.message}</p>
      {long && (
        <button className="btn-x ghost sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'نمایش کمتر' : 'نمایش کامل پیام'}
        </button>
      )}
      <div className="msg-actions">
        <button className="btn-x secondary sm" onClick={() => messageAction(m.id, 'read')}>
          {m.is_read ? <RefreshCw size={14} /> : <Check size={14} />}
          {m.is_read ? 'علامت‌گذاری خوانده‌نشده' : 'خوانده‌شده'}
        </button>
        {mailto && (
          <a className="btn-x secondary sm" href={mailto}>
            <MailOpen size={14} /> پاسخ با ایمیل
          </a>
        )}
        <button className="btn-x danger sm" onClick={() => askDelete(m)}>
          <Trash2 size={14} /> حذف
        </button>
      </div>
    </article>
  );
}
