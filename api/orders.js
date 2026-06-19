// api/orders.js — catat & kelola pesanan pelanggan (Vercel Blob)
// GET   (perlu x-admin-key)              -> daftar semua pesanan
// POST  { order }                        -> tambah pesanan baru (publik, dari pelanggan)
// POST  { action, ... } + x-admin-key    -> 'update' status | 'delete' id | 'clear'
import { put, list } from '@vercel/blob';

const PATH = 'orders.json';
const MAX_KEEP = 5000;

async function readOrders() {
  const { blobs } = await list({ prefix: PATH, limit: 1 });
  if (!blobs.length) return [];
  const r = await fetch(blobs[0].url, { cache: 'no-store' });
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}
async function writeOrders(orders) {
  const blob = await put(PATH, JSON.stringify(orders), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0
  });
  return blob.url;
}
function isAdmin(req) {
  return (req.headers['x-admin-key'] || '') === process.env.ADMIN_PASSWORD;
}
const intOf = (v) => Math.max(0, parseInt(v, 10) || 0);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Password salah' });
    try {
      return res.status(200).json({ orders: await readOrders() });
    } catch (e) {
      return res.status(200).json({ orders: [], error: String(e) });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};

    // --- operasi admin (butuh password) ---
    if (body.action) {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Password salah' });
      try {
        let orders = await readOrders();
        if (body.action === 'update') {
          const o = orders.find((x) => x.id === body.id);
          if (o && typeof body.status === 'string') o.status = body.status;
        } else if (body.action === 'delete') {
          orders = orders.filter((x) => x.id !== body.id);
        } else if (body.action === 'clear') {
          orders = [];
        } else {
          return res.status(400).json({ error: 'Aksi tidak dikenal' });
        }
        await writeOrders(orders);
        return res.status(200).json({ ok: true, orders });
      } catch (e) {
        return res.status(500).json({ error: String(e) });
      }
    }

    // --- tambah pesanan baru (publik, dari pelanggan) ---
    try {
      const order = body.order;
      if (!order || typeof order !== 'object') {
        return res.status(400).json({ error: 'Pesanan tidak valid' });
      }
      const clean = {
        id: 'o' + Date.now() + Math.random().toString(36).slice(2, 7),
        createdAt: Date.now(),
        nama: String(order.nama || '').slice(0, 60),
        phone: String(order.phone || '').slice(0, 25),
        metode: order.metode === 'antar' ? 'antar' : 'ambil',
        zona: order.zona === 'luar' ? 'luar' : (order.zona === 'dalam' ? 'dalam' : ''),
        alamat: String(order.alamat || '').slice(0, 200),
        bayar: String(order.bayar || '').slice(0, 20),
        catatan: String(order.catatan || '').slice(0, 300),
        items: Array.isArray(order.items)
          ? order.items.slice(0, 50).map((it) => ({
              nama: String(it.nama || '').slice(0, 60),
              qty: Math.max(1, parseInt(it.qty, 10) || 1),
              harga: intOf(it.harga)
            }))
          : [],
        subtotal: intOf(order.subtotal),
        ongkir: intOf(order.ongkir),
        total: intOf(order.total),
        status: 'baru'
      };
      const orders = await readOrders();
      orders.push(clean);
      await writeOrders(orders.slice(-MAX_KEEP));
      return res.status(200).json({ ok: true, id: clean.id });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
