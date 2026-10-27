import React from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function ContentTab({ draft, setDraft, save, busy, dirty }) {
  const skills = Array.isArray(draft.skills) ? draft.skills : [];

  const setSkill = (i, patch) => {
    const next = skills.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setDraft({ ...draft, skills: next });
  };

  const addSkill = () => {
    if (skills.length >= 6) return;
    setDraft({ ...draft, skills: [...skills, { name: 'مهارت جدید', value: 50 }] });
  };

  const removeSkill = (i) => {
    setDraft({ ...draft, skills: skills.filter((_, idx) => idx !== i) });
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>محتوای سایت</h3>
          <p>عنوان‌ها، معرفی کوتاه، متن‌های «درباره من» و مهارت‌ها</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>عنوان سایت (تب مرورگر و منو)</label>
          <input
            type="text"
            placeholder="مثلاً: رزومه رایان رضایی"
            value={draft.site_title}
            onChange={(e) => setDraft({ ...draft, site_title: e.target.value })}
          />
          <small>اگر لوگو آپلود کرده باشید، در منو به‌جای متن نمایش داده می‌شود.</small>
        </div>
        <div className="field">
          <label>معرفی کوتاه (زیر اسم در هدر)</label>
          <input
            type="text"
            placeholder="مثلاً: توسعه‌دهنده وب، طراح سایت و ادیتور"
            value={draft.tagline}
            onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          />
        </div>
        <div className="field wide">
          <label>پاراگراف اول «درباره من»</label>
          <textarea
            rows={4}
            placeholder="معرفی خودتان…"
            value={draft.about_1}
            onChange={(e) => setDraft({ ...draft, about_1: e.target.value })}
          />
        </div>
        <div className="field wide">
          <label>پاراگراف دوم «درباره من»</label>
          <textarea
            rows={5}
            placeholder="ادامهٔ معرفی…"
            value={draft.about_2}
            onChange={(e) => setDraft({ ...draft, about_2: e.target.value })}
          />
          <small>برای پاک‌کردن یک متن کافی است فیلد را خالی کنید؛ آن بخش به حالت پیش‌فرض برمی‌گردد.</small>
        </div>
      </div>

      <hr className="divider" />

      <div className="panel-head" style={{ marginBottom: 14 }}>
        <div>
          <h3>مهارت‌ها (نوارهای درصدی)</h3>
          <p>نام و درصد هر مهارت را وارد کنید — حداکثر ۶ مهارت (تعداد نوارهای سایت: ۶)</p>
        </div>
        <button className="btn-x secondary sm" onClick={addSkill} disabled={skills.length >= 6}>
          <Plus size={15} /> افزودن مهارت
        </button>
      </div>

      {!skills.length && (
        <div className="empty" style={{ padding: '26px 16px' }}>
          <b>هنوز مهارتی اضافه نکرده‌اید</b>
          <p>با دکمه «افزودن مهارت» نوارهای درصدی سایت را مدیریت کنید.</p>
        </div>
      )}

      {skills.map((s, i) => (
        <div className="skill-row" key={i}>
          <input
            type="text"
            placeholder="نام مهارت"
            value={s.name || ''}
            onChange={(e) => setSkill(i, { name: e.target.value })}
          />
          <input
            type="number"
            min={0}
            max={100}
            value={s.value ?? 0}
            onChange={(e) => setSkill(i, { value: Number(e.target.value) })}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={s.value ?? 0}
            onChange={(e) => setSkill(i, { value: Number(e.target.value) })}
          />
          <button className="del-skill" onClick={() => removeSkill(i)} title="حذف مهارت">
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <hr className="divider" />

      <div className="form-grid">
        <div className="field">
          <label>نام فوتر (پایین سایت)</label>
          <input
            type="text"
            placeholder="مثلاً: رایان رضایی میرقائد"
            value={draft.footer_name}
            onChange={(e) => setDraft({ ...draft, footer_name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>متن کپی‌رایت فوتر</label>
          <input
            type="text"
            placeholder="مثلاً: © رزومه خلاقانه. تمامی حقوق محفوظ است."
            value={draft.footer_text}
            onChange={(e) => setDraft({ ...draft, footer_text: e.target.value })}
          />
        </div>
      </div>

      <hr className="divider" />

      <button className={`btn-x primary ${dirty ? 'save-dot' : ''}`} onClick={() => save()} disabled={busy}>
        <Save size={16} /> ذخیره محتوا
      </button>
    </section>
  );
}
