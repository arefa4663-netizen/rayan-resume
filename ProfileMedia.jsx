import React, { useRef, useState } from 'react';
import { Save, Upload, Trash2, UserCircle, Image as ImageIcon, Images as HeroIcon, Loader2 } from 'lucide-react';
import { api, fileToDataUrl } from '../api.js';

const FIELDS = [
  {
    key: 'profile_image',
    title: 'عکس پروفایل',
    hint: 'بهترین حالت: مربع، حداقل ۳۶۰×۳۶۰ پیکسل',
    cls: '',
    maxSize: 600,
    icon: UserCircle,
  },
  {
    key: 'logo_image',
    title: 'لوگوی سایت',
    hint: 'در منوی بالای سایت و فاوآیکون نمایش داده می‌شود — پس‌زمینه شفاف (PNG)',
    cls: 'logo rounded-rect',
    maxSize: 500,
    icon: ImageIcon,
  },
  {
    key: 'hero_image',
    title: 'پس‌زمینه هدر (بنر بالای سایت)',
    hint: 'بهترین حالت: عریض، حدود ۱۶۰۰×۹۰۰ پیکسل',
    cls: 'wide',
    maxSize: 1600,
    icon: HeroIcon,
  },
];

export default function ProfileMedia({ draft, setDraft, save, busy, dirty, toast }) {
  const [uploading, setUploading] = useState('');
  const inputsRef = useRef({});

  const pick = async (fieldKey, maxSize) => {
    const input = inputsRef.current[fieldKey];
    const file = input?.files?.[0];
    if (!file) return;
    input.value = '';
    setUploading(fieldKey);
    try {
      const dataUrl = await fileToDataUrl(file, maxSize, 0.86);
      const d = await api.upload(dataUrl, file.name);
      const next = { ...draft, [fieldKey]: d.url };
      setDraft(next);
      await save({ [fieldKey]: d.url });
    } catch (e) {
      toast('error', e.message || 'آپلود ناموفق بود');
    } finally {
      setUploading('');
    }
  };

  const remove = async (fieldKey) => {
    const next = { ...draft, [fieldKey]: '' };
    setDraft(next);
    await save({ [fieldKey]: '' });
    toast('success', 'تصویر حذف شد (به حالت پیش‌فرض برگشت).');
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>پروفایل و تصاویر</h3>
          <p>نام نمایشی، عکس پروفایل، لوگو و پس‌زمینه هدر سایت</p>
        </div>
      </div>

      <div className="form-grid" style={{ marginBottom: 24 }}>
        <div className="field">
          <label>نام نمایشی (زیر عکس پروفایل در هدر)</label>
          <input
            type="text"
            placeholder="مثلاً: Rayan Rezaei"
            value={draft.profile_name}
            onChange={(e) => setDraft({ ...draft, profile_name: e.target.value })}
          />
        </div>
      </div>

      <div className="upload-grid">
        {FIELDS.map((f) => {
          const value = draft[f.key] || '';
          const Icon = f.icon;
          const isUploading = uploading === f.key;
          return (
            <div key={f.key} className={`upload-card ${isUploading ? 'uploading' : ''}`}>
              <div className={`upload-preview ${f.cls}`}>
                {value ? <img src={value} alt={f.title} /> : <Icon size={34} />}
              </div>
              <b>{f.title}</b>
              <p>{f.hint}</p>
              <div className="actions">
                <button
                  className="btn-x primary sm"
                  onClick={() => inputsRef.current[f.key]?.click()}
                  disabled={isUploading}
                  type="button"
                >
                  {isUploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                  {isUploading ? 'در حال آپلود…' : 'انتخاب تصویر'}
                </button>
                {value && (
                  <button className="btn-x danger sm" onClick={() => remove(f.key)} disabled={isUploading} type="button">
                    <Trash2 size={14} /> حذف
                  </button>
                )}
              </div>
              <input
                ref={(el) => (inputsRef.current[f.key] = el)}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={() => pick(f.key, f.maxSize)}
              />
            </div>
          );
        })}
      </div>

      <hr className="divider" />

      <button className={`btn-x primary ${dirty ? 'save-dot' : ''}`} onClick={() => save()} disabled={busy}>
        <Save size={16} /> ذخیره نام نمایشی
      </button>
      <small style={{ display: 'block', marginTop: 10, color: 'var(--text-3)' }}>
        توجه: تصاویر بلافاصله بعد از انتخاب، آپلود و ذخیره می‌شوند.
      </small>
    </section>
  );
}
