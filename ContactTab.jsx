import React from 'react';
import {
  Save, Phone, Mail, MapPin, Languages, CalendarDays, Send, Globe,
} from 'lucide-react';

const SOCIALS = [
  ['telegram', 'تلگرام', '#229ED9', 'fa-telegram'],
  ['instagram', 'اینستاگرام', 'linear-gradient(135deg,#f58529,#dd2a7b 55%,#8134af)', 'fa-instagram'],
  ['whatsapp', 'واتساپ', '#25D366', 'fa-whatsapp'],
  ['twitter', 'توییتر (X)', '#111111', 'fa-twitter'],
  ['facebook', 'فیسبوک', '#1877F2', 'fa-facebook'],
  ['linkedin', 'لینکدین', '#0A66C2', 'fa-linkedin'],
  ['youtube', 'یوتیوب', '#FF0000', 'fa-youtube-play'],
  ['github', 'گیت‌هاب', '#333333', 'fa-github'],
];

export default function ContactTab({ draft, setDraft, save, busy, dirty }) {
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>اطلاعات تماس</h3>
          <p>این اطلاعات در بخش «اطلاعات پایه» و «ارتباط با من» سایت نمایش داده می‌شود.</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label><Phone size={15} /> شماره تلفن</label>
          <input className="ltr" type="text" placeholder="09138116975" value={draft.phone} onChange={set('phone')} />
        </div>
        <div className="field">
          <label><Mail size={15} /> ایمیل</label>
          <input className="ltr" type="email" placeholder="name@example.com" value={draft.email} onChange={set('email')} />
        </div>
        <div className="field wide">
          <label><MapPin size={15} /> آدرس</label>
          <input
            type="text"
            placeholder="ایران، استان اصفهان، فولادشهر"
            value={draft.address}
            onChange={set('address')}
          />
        </div>
        <div className="field">
          <label><CalendarDays size={15} /> سن</label>
          <input className="ltr" type="text" placeholder="17" value={draft.age} onChange={set('age')} />
        </div>
        <div className="field">
          <label><Languages size={15} /> زبان‌ها</label>
          <input type="text" placeholder="انگلیسی، فارسی" value={draft.language} onChange={set('language')} />
        </div>
      </div>

      <hr className="divider" />

      <div className="panel-head">
        <div>
          <h3>اکانت‌های تلگرام (بخش تماس سایت)</h3>
          <p>دو اکانت فعال تلگرام که در بخش «ارتباط با من» نوشته می‌شوند</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label><Send size={15} /> اکانت اول</label>
          <input className="ltr" type="text" placeholder="1. @Mirkad87" value={draft.telegram_account_1} onChange={set('telegram_account_1')} />
        </div>
        <div className="field">
          <label><Send size={15} /> اکانت دوم</label>
          <input className="ltr" type="text" placeholder="2. @xt7_web" value={draft.telegram_account_2} onChange={set('telegram_account_2')} />
        </div>
      </div>

      <hr className="divider" />

      <div className="panel-head">
        <div>
          <h3>شبکه‌های اجتماعی</h3>
          <p>
            لینک کامل یا آیدی را وارد کنید (مثلاً <span dir="ltr">@rayan87fighter</span> یا آدرس کامل). چیزی که خالی بماند،
            دست‌نخورده باقی می‌ماند. واتساپ/لینکدین/یوتیوب/گیت‌هاب فقط در صورت پر شدن به سایت اضافه می‌شوند.
          </p>
        </div>
      </div>

      <div className="social-grid">
        {SOCIALS.map(([key, label, color, fa]) => (
          <div className="field social-field" key={key}>
            <span className="soc-label">
              <span className="soc-ico" style={{ background: color }}>
                <i className={`fa ${fa}`} style={{ fontSize: 14 }} aria-hidden="true" />
              </span>
              {label}
            </span>
            <input
              className="ltr"
              type="text"
              placeholder="https://… یا @username"
              value={draft[`social_${key}`] || ''}
              onChange={set(`social_${key}`)}
            />
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className={`btn-x primary ${dirty ? 'save-dot' : ''}`} onClick={() => save()} disabled={busy}>
          <Globe size={16} /> ذخیره اطلاعات تماس
        </button>
        <small style={{ color: 'var(--text-3)' }}>
          تغییرات تا حداکثر یک دقیقه بعد روی سایت برای بازدیدکنندگان اعمال می‌شود.
        </small>
      </div>
    </section>
  );
}
