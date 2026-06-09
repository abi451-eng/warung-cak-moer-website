// api/menu.js — baca & simpan data menu ke Vercel Blob
// GET  -> kembalikan isi menu.json (atau null jika belum ada)
// POST -> simpan menu.json (wajib header x-admin-key = ADMIN_PASSWORD)
import { put, list } from '@vercel/blob';

const PATH = 'menu.json';

export default async function handler(req, res) {
  // Jangan cache respons API ini, biar perubahan cepat terlihat
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: PATH, limit: 1 });
      if (!blobs.length) return res.status(200).json({ menu: null });
      const r = await fetch(blobs[0].url, { cache: 'no-store' });
      const menu = await r.json();
      return res.status(200).json({ menu });
    } catch (e) {
      return res.status(200).json({ menu: null, error: String(e) });
    }
  }

  if (req.method === 'POST') {
    if ((req.headers['x-admin-key'] || '') !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Password salah' });
    }
    try {
      const menu = req.body && req.body.menu;
      if (!Array.isArray(menu)) return res.status(400).json({ error: 'Format menu tidak valid' });
      const blob = await put(PATH, JSON.stringify(menu), {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true,
        addRandomSuffix: false,
        cacheControlMaxAge: 60
      });
      return res.status(200).json({ ok: true, url: blob.url });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
