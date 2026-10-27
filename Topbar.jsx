import React from 'react';

export default function Topbar({ title, sub, username, onLogout }) {
  return (
    <header className="topbar" style={{ padding: '22px 32px 0' }}>
      <div>
        <span className="eyebrow">پنل کنترل</span>
        <h1>{title}</h1>
        <div className="sub">{sub}</div>
      </div>
      <div className="user-chip">
        <span className="avatar">{(username || 'R')[0].toUpperCase()}</span>
        <div>
          <b dir="ltr" style={{ textAlign: 'right' }}>{username}</b>
          <small>مدیر سایت</small>
        </div>
      </div>
    </header>
  );
}
