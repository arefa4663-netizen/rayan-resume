import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Trash2 } from 'lucide-react';

/* ---------- توست‌ها ---------- */
export function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.hide ? 'hide' : ''} t-${t.type}`}>
          {t.type === 'success' ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- مودال تأیید ---------- */
export function ConfirmModal({ state, onClose }) {
  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ico">
          {state.danger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>
        <h3>{state.title || 'آیا مطمئن هستید؟'}</h3>
        <p>{state.text || 'این عملیات قابل بازگشت نیست.'}</p>
        <div className="modal-actions">
          <button className={`btn-x ${state.danger ? 'danger' : 'primary'}`} onClick={() => onClose(true)}>
            بله، انجام بده
          </button>
          <button className="btn-x secondary" onClick={() => onClose(false)}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
