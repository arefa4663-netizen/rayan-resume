import React, { useState } from 'react';
import {
  LayoutDashboard, MessageSquare, Palette, FileText, UserCircle,
  Phone, ShieldCheck, LogOut, ExternalLink, Menu, X,
} from 'lucide-react';

const NAV = [
  ['dashboard', 'داشبورد', LayoutDashboard],
  ['messages', 'نظرات و پیام‌ها', MessageSquare],
  ['appearance', 'ظاهر و تم', Palette],
  ['content', 'محتوای سایت', FileText],
  ['profile', 'پروفایل و تصاویر', UserCircle],
  ['contact', 'تماس و شبکه‌ها', Phone],
  ['security', 'امنیت', ShieldCheck],
];

export default function Sidebar({ tab, setTab, unread, onLogout }) {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setTab(id);
    setOpen(false);
  };

  return (
    <>
      {/* نوار بالای موبایل */}
      <div className="mobile-top">
        <button
          className="btn-x ghost"
          style={{ color: '#fff' }}
          onClick={() => setOpen(true)}
          aria-label="باز کردن منو"
        >
          <Menu size={22} />
        </button>
        <b style={{ fontSize: 14 }}>پنل مدیریت رزومه</b>
        <a className="btn-x ghost" style={{ color: '#fff' }} href="/" target="_blank" rel="noreferrer" aria-label="سایت">
          <ExternalLink size={19} />
        </a>
      </div>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-icon">R</span>
          <div>
            <b>Rayan Admin</b>
            <small>پنل مدیریت رزومه</small>
          </div>
          <button
            className="btn-x ghost close-nav"
            style={{ marginRight: 'auto', color: '#8892a8' }}
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {NAV.map(([id, label, Icon]) => (
            <button key={id} className={`nav-item-btn ${tab === id ? 'active' : ''}`} onClick={() => go(id)}>
              <Icon size={18} />
              {label}
              {id === 'messages' && unread > 0 && <em className="nav-badge">{unread}</em>}
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          <a className="side-link" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={17} /> مشاهده سایت
          </a>
          <button className="nav-item-btn" onClick={onLogout}>
            <LogOut size={18} /> خروج از حساب
          </button>
        </div>
      </aside>
    </>
  );
}
