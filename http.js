// ابزارهای مشترک HTTP برای همه توابع API
export function json(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(body);
}

export function error(res, status, message) {
  json(res, status, { error: message });
}

// خواندن بدنه JSON درخواست (با محدودیت حجم)
export function readBody(req, limit = 1024 * 1024 * 4) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw) return resolve({});
        const parsed = JSON.parse(raw);
        resolve(typeof parsed === 'object' && parsed !== null ? parsed : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'local';
}
