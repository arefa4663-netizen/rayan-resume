import React from 'react';
import { Save, Palette, RotateCcw } from 'lucide-react';

const PRESETS = [
  { c: '#378C3F', n: 'سبز (پیش‌فرض)' },
  { c: '#2C8CE0', n: 'آبی' },
  { c: '#7C3AED', n: 'بنفش' },
  { c: '#E0356B', n: 'سرخابی' },
  { c: '#F97316', n: 'نارنجی' },
  { c: '#DC2626', n: 'قرمز' },
  { c: '#0E7490', n: 'فیروزه‌ای' },
  { c: '#B45309', n: 'کهربایی' },
  { c: '#0F172A', n: 'سرمه‌ای' },
  { c: '#DB2777', n: 'صورتی' },
];

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => {
    v = f < 0 ? v * (1 + f) : v + (255 - v) * f;
    return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  };
  return '#' + ch((n >> 16) & 255) + ch((n >> 8) & 255) + ch(n & 255);
}

export default function Appearance({ draft, setDraft, save, busy, dirty }) {
  const primary = draft.primary_color || '#378C3F';

  const setPrimary = (c) => setDraft({ ...draft, primary_color: c });
  const setBg = (c) => setDraft({ ...draft, background_color: c });

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>رنگ اصلی سایت (تم)</h3>
            <p>این رنگ روی دکمه‌ها، منو، نوار مهارت‌ها و بخش‌های اصلی سایت اعمال می‌شود.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field wide">
            <span className="field-label"><Palette size={16} /> رنگ اصلی</span>
            <div className="color-row">
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                aria-label="انتخاب رنگ"
              />
              <input
                type="text"
                dir="ltr"
                value={primary}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) setPrimary(v);
                  else setDraft({ ...draft, primary_color: v });
                }}
              />
            </div>
            <small>کد رنگ به شکل HEX مثل #378C3F</small>
            <div className="presets">
              {PRESETS.map((p) => (
                <button
                  key={p.c}
                  type="button"
                  className={`preset ${primary.toLowerCase() === p.c.toLowerCase() ? 'active' : ''}`}
                  style={{ background: p.c }}
                  title={p.n}
                  onClick={() => setPrimary(p.c)}
                  aria-label={p.n}
                />
              ))}
            </div>
          </div>

          <div className="field wide">
            <span className="field-label">رنگ پس‌زمینه صفحات (اختیاری)</span>
            <div className="color-row">
              <input
                type="color"
                value={draft.background_color || '#ffffff'}
                onChange={(e) => setBg(e.target.value)}
                aria-label="انتخاب پس‌زمینه"
              />
              <input
                type="text"
                dir="ltr"
                placeholder="خالی = پیش‌فرض (سفید)"
                value={draft.background_color || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) setBg(v);
                  else setDraft({ ...draft, background_color: v });
                }}
              />
              <button type="button" className="btn-x secondary sm" onClick={() => setBg('')}>
                <RotateCcw size={14} /> پیش‌فرض
              </button>
            </div>
            <small>اگر خالی بماند، پس‌زمینه سایت تغییری نمی‌کند.</small>
          </div>
        </div>

        <hr className="divider" />

        {/* پیش‌نمایش زنده */}
        <div className="field">
          <span className="field-label">پیش‌نمایش زنده — ظاهر سایت با رنگ انتخابی</span>
        </div>
        <div
          className="theme-preview"
          style={{
            '--pv-primary': primary,
            '--pv-primary-dark': shade(primary, -0.18),
            '--pv-ring': primary + '80',
            '--pv-track': primary + '40',
            '--pv-bg': draft.background_color || '#ffffff',
          }}
        >
          <div className="tp-nav">
            منوی سایت <span>درباره من · مهارت‌ها · نمونه‌کارها</span>
          </div>
          <div className="tp-hero">
            <div className="tp-avatar">R</div>
            <div className="tp-title">{draft.profile_name || draft.site_title || 'رزومه رایان رضایی'}</div>
            <div className="tp-cat">{draft.tagline || 'توسعه‌دهنده وب، طراح سایت و ادیتور'}</div>
            <span className="tp-btn">ارتباط با من</span>
          </div>
          <div className="tp-skill">
            <div className="tp-label">HTML — 90٪</div>
            <div className="tp-track"><div className="tp-fill" style={{ width: '90%' }} /></div>
          </div>
        </div>

        <hr className="divider" />

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className={`btn-x primary ${dirty ? 'save-dot' : ''}`} onClick={() => save()} disabled={busy}>
            <Save size={16} /> ذخیره تم سایت
          </button>
          <small style={{ color: 'var(--text-3)' }}>
            بعد از ذخیره، تغییر رنگ تا حداکثر یک دقیقه بعد برای بازدیدکنندگان اعمال می‌شود.
          </small>
        </div>
      </section>
    </>
  );
}
