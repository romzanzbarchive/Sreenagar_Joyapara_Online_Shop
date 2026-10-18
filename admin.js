import { db } from './_db.js';
export default async function handler(req, res) {
  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin'] !== process.env.ADMIN_PASSWORD) return res.status(401).json({ ok: false });
  if (req.method === 'GET') {
    const r = await db('orders?select=*&order=created_at.desc&limit=100');
    return res.status(200).json(await r.json());
  }
  const { id, status } = req.body || {};
  if (!/^SJ\d{7}$/.test(id) || !['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({ ok: false });
  const r = await db(`orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  res.status(r.ok ? 200 : 500).json({ ok: r.ok });
}
