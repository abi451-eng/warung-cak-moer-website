// api/upload.js — unggah foto menu ke Vercel Blob
// POST { filename, contentType, dataBase64 }  (wajib header x-admin-key = ADMIN_PASSWORD)
// -> kembalikan { url } untuk disimpan di item menu
import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  if ((req.headers['x-admin-key'] || '') !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Password salah' });
  }

  try {
    const { filename, contentType, dataBase64 } = req.body || {};
    if (!dataBase64) return res.status(400).json({ error: 'Tidak ada file' });

    const buffer = Buffer.from(dataBase64, 'base64');
    const safe = (filename || 'foto').toLowerCase().replace(/[^a-z0-9._-]/g, '_');

    const blob = await put(`menu/${Date.now()}-${safe}`, buffer, {
      access: 'public',
      contentType: contentType || 'image/jpeg',
      addRandomSuffix: true // URL unik tiap unggah -> tidak ada foto basi
    });

    return res.status(200).json({ url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
