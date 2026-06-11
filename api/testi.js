// api/testi.js — baca & simpan data testimoni ke Vercel Blob
// GET  -> kembalikan isi testi.json (atau null jika belum ada)
// POST -> simpan testi.json (wajib header x-admin-key = ADMIN_PASSWORD)
import { put, list } from '@vercel/blob';

const PATH = 'testi.json';

export default async function handler(req, res) {
  // Jangan cache respons API ini, biar perubahan cepat terlihat
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: PATH, limit: 1 });
      if (!blobs.length) return res.status(200).json({ testi: null });
      const r = await fetch(blobs[0].url, { cache: 'no-store' });
      const testi = await r.json();
      return res.status(200).json({ testi });
    } catch (e) {
      return res.status(200).json({ testi: null, error: String(e) });
    }
  }

  if (req.method === 'POST') {
    if ((req.headers['x-admin-key'] || '') !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Password salah' });
    }
    try {
      const testi = req.body && req.body.testi;
      if (!Array.isArray(testi)) return res.status(400).json({ error: 'Format testimoni tidak valid' });
      const blob = await put(PATH, JSON.stringify(testi), {
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
