import { db } from './_db.js';
export default async function handler(req, res) {
  const id = String(req.query.id || '').trim().toUpperCase(), phone = String(req.query.phone || '').trim();
  if (!/^SJ\d{7}$/.test(id) || !/^01\d{9}$/.test(phone)) return res.status(400).json({ ok: false });
  const r = await db(`orders?id=eq.${id}&phone=eq.${phone}&select=id,created_at,status,total,items,payment`);
  const d = await r.json();
  if (!d[0]) return res.status(404).json({ ok: false });
  res.status(200).json({ ok: true, order: d[0] });
}
