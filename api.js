// لایه ارتباط با API — مدیریت خودکار توکن و خطاها
const TOKEN_KEY = 'rayan_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}, retry = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api/${path}`, { ...options, headers });
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.');
  }

  // اگر توکن منقضی شده بود، یک بار تلاش برای تمدید خودکار نمی‌کنیم؛ فقط لاگ‌اوت
  if (res.status === 401) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || 'نشست شما منقضی شده است. دوباره وارد شوید.');
    err.code = 401;
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'خطایی رخ داد. دوباره تلاش کنید.');
  return data;
}

export const api = {
  login: (username, password) =>
    request('login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  bootstrap: () => request('bootstrap'),
  saveSettings: (settings) =>
    request('settings', { method: 'POST', body: JSON.stringify(settings) }),
  messageAction: (id, action) =>
    request('messages', { method: 'POST', body: JSON.stringify({ id, action }) }),
  upload: (data, name) =>
    request('upload', { method: 'POST', body: JSON.stringify({ data, name }) }),
  updateCredentials: (payload) =>
    request('credentials', { method: 'POST', body: JSON.stringify(payload) }),
};

// تبدیل فایل به dataURL با تغییر اندازه در مرورگر (برای آپلود سبک)
export function fileToDataUrl(file, maxSize = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('فقط فایل تصویری مجاز است.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('فایل تصویر معتبر نیست.'));
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // حفظ شفافیت PNG
        if (file.type !== 'image/png') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// تاریخ فارسی
export function faDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
