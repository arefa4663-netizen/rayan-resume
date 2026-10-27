// لایه ذخیره‌سازی با دو حالت:
// ۱) روی Vercel → Vercel Blob (وقتی BLOB_READ_WRITE_TOKEN تنظیم شده باشد)
// ۲) روی سیستم محلی → پوشه .data (برای تست با node server.js)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LOCAL_BASE = path.join(process.cwd(), '.data');

export function isBlobMode() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function safeLocalPath(key) {
  const p = path.normalize(path.join(LOCAL_BASE, key));
  if (!p.startsWith(LOCAL_BASE)) throw new Error('BAD_KEY');
  return p;
}

/* ---------------- Vercel Blob ---------------- */
async function blob() {
  return await import('@vercel/blob');
}

async function blobFind(key) {
  const { list } = await blob();
  const res = await list({ prefix: key, limit: 10 });
  const exact = res.blobs.find((b) => b.pathname === key);
  return exact || null;
}

async function blobGetJSON(key) {
  const found = await blobFind(key);
  if (!found) return null;
  const r = await fetch(found.url, { cache: 'no-store' });
  if (!r.ok) return null;
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function blobPutJSON(key, value) {
  const { put } = await blob();
  await put(key, JSON.stringify(value), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return true;
}

async function blobListJSON(prefix) {
  const { list } = await blob();
  const res = await list({ prefix, limit: 1000 });
  const out = [];
  for (const b of res.blobs) {
    if (!b.pathname.endsWith('.json')) continue;
    try {
      const r = await fetch(b.url, { cache: 'no-store' });
      if (!r.ok) continue;
      out.push({ key: b.pathname, data: await r.json() });
    } catch {
      /* فایل خراب را نادیده بگیر */
    }
  }
  return out;
}

async function blobDelete(key) {
  const found = await blobFind(key);
  if (!found) return false;
  const { del } = await blob();
  await del(found.url);
  return true;
}

async function blobPutFile(key, buffer, contentType) {
  const { put } = await blob();
  const res = await put(key, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return { url: res.url };
}

/* ---------------- Local filesystem ---------------- */
async function localGetJSON(key) {
  try {
    const raw = await fs.promises.readFile(safeLocalPath(key), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function localPutJSON(key, value) {
  const p = safeLocalPath(key);
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
  await fs.promises.writeFile(p, JSON.stringify(value), 'utf8');
  return true;
}

async function localListJSON(prefix) {
  const dir = safeLocalPath(prefix);
  let names = [];
  try {
    names = await fs.promises.readdir(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const n of names) {
    if (!n.endsWith('.json')) continue;
    const data = await localGetJSON(path.posix.join(prefix, n));
    if (data) out.push({ key: path.posix.join(prefix, n), data });
  }
  return out;
}

async function localDelete(key) {
  try {
    await fs.promises.unlink(safeLocalPath(key));
    return true;
  } catch {
    return false;
  }
}

async function localPutFile(key, buffer) {
  const p = safeLocalPath(key);
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
  await fs.promises.writeFile(p, buffer);
  return { url: `/api/serve?key=${encodeURIComponent(key)}` };
}

/* ---------------- API عمومی ---------------- */
export async function getJSON(key) {
  return isBlobMode() ? blobGetJSON(key) : localGetJSON(key);
}

export async function putJSON(key, value) {
  return isBlobMode() ? blobPutJSON(key, value) : localPutJSON(key, value);
}

export async function listJSON(prefix) {
  return isBlobMode() ? blobListJSON(prefix) : localListJSON(prefix);
}

export async function deleteKey(key) {
  return isBlobMode() ? blobDelete(key) : localDelete(key);
}

export async function putFile(key, buffer, contentType) {
  if (isBlobMode()) return blobPutFile(key, buffer, contentType);
  return localPutFile(key, buffer);
}

export function newId() {
  return Date.now().toString(36) + '-' + crypto.randomBytes(6).toString('hex');
}
