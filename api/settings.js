// api/settings.js — pengaturan jam buka & sesi warung (Vercel Blob)
// GET  -> kembalikan pengaturan (atau null jika belum pernah disimpan)
// POST -> simpan pengaturan (wajib header x-admin-key = ADMIN_PASSWORD)
import { put, list } from '@vercel/blob';

const PATH = 'settings.json';

const clockOK = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || ''));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: PATH, limit: 1 });
      if (!blobs.length) return res.status(200).json({ settings: null });
      const r = await fetch(blobs[0].url, { cache: 'no-store' });
      const settings = await r.json();
      return res.status(200).json({ settings });
    } catch (e) {
      return res.status(200).json({ settings: null, error: String(e) });
    }
  }

  if (req.method === 'POST') {
    if ((req.headers['x-admin-key'] || '') !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Password salah' });
    }
    try {
      const s = (req.body && req.body.settings) || {};
      const p = s.pagi || {}, si = s.siang || {};
      const clean = {
        tutupSementara: !!s.tutupSementara,
        pagi: {
          on: p.on !== false,
          start: clockOK(p.start) ? p.start : '06:00',
          end: clockOK(p.end) ? p.end : '11:00'
        },
        siang: {
          on: si.on !== false,
          start: clockOK(si.start) ? si.start : '11:00',
          end: clockOK(si.end) ? si.end : '21:00'
        }
      };
      const blob = await put(PATH, JSON.stringify(clean), {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true,
        addRandomSuffix: false,
        cacheControlMaxAge: 0
      });
      return res.status(200).json({ ok: true, settings: clean, url: blob.url });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
