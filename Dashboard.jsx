import React from 'react';
import { MessageSquare, Mail, Palette, Activity, ArrowLeft, ExternalLink } from 'lucide-react';
import { faDate } from '../api.js';

export default function Dashboard({ user, messages, draft, busy, setTab, messageAction }) {
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <>
      <section className="welcome">
        <div>
          <span className="eyebrow light">خوش آمدید</span>
          <h2>سلام {user.username} 👋</h2>
          <p>
            از این پنل می‌توانید متن‌ها، عکس پروفایل، لوگو، اطلاعات تماس، رنگ (تم) سایت و
            نظرات کاربران را مدیریت کنید؛ همه‌چیز بلافاصله روی سایت اعمال می‌شود.
          </p>
        </div>
        <a className="light-button" href="/" target="_blank" rel="noreferrer">
          مشاهده سایت <ExternalLink size={15} />
        </a>
      </section>

      <div className="stats">
        <article className="stat">
          <span className="stat-icon green"><MessageSquare size={21} /></span>
          <small>کل پیام‌های دریافتی</small>
          <strong>{messages.length}</strong>
        </article>
        <article className="stat">
          <span className="stat-icon orange"><Mail size={21} /></span>
          <small>خوانده‌نشده</small>
          <strong>{unread}</strong>
        </article>
        <article className="stat">
          <span className="stat-icon blue"><Palette size={21} /></span>
          <small>رنگ فعلی سایت</small>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 30, height: 30, borderRadius: 9, display: 'inline-block',
                background: draft.primary_color || '#378C3F',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.6), 0 4px 10px rgba(0,0,0,.15)',
              }}
            />
            <span dir="ltr" style={{ fontSize: 15 }}>{draft.primary_color || '#378C3F'}</span>
          </strong>
        </article>
        <article className="stat">
          <span className="stat-icon violet"><Activity size={21} /></span>
          <small>وضعیت اتصال</small>
          <strong className="status"><span className="dot" /> متصل و فعال</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>آخرین پیام‌ها</h3>
            <p>جدیدترین پیام‌های دریافتی از فرم «ارتباط با من»</p>
          </div>
          <button className="btn-x secondary sm" onClick={() => setTab('messages')}>
            مشاهده همه <ArrowLeft size={15} />
          </button>
        </div>
        {busy && <div className="skeleton" />}
        {messages.slice(0, 3).map((m) => (
          <article key={m.id} className={`message ${!m.is_read ? 'unread' : ''}`}>
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
            {m.subject && <h4>موضوع: {m.subject}</h4>}
            <p className="message-text clamped">{m.message}</p>
          </article>
        ))}
        {!busy && !messages.length && (
          <div className="empty">
            <div className="empty-ico"><MessageSquare size={30} /></div>
            <b>هنوز پیامی ثبت نشده است</b>
            <p>هر وقت بازدیدکنندگان از فرم تماس سایت پیام بدهند، اینجا نمایش داده می‌شود.</p>
          </div>
        )}
      </section>
    </>
  );
}
