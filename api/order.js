import { db, clean } from './_db.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const b = req.body || {};
  if (b.website) return res.status(200).json({ ok: true });
  const base = `https://${req.headers.host}`;
  const [prods, cfg] = await Promise.all([fetch(base + '/products.json').then(r => r.json()), fetch(base + '/config.json').then(r => r.json())]);
  const name = clean(b.name), phone = clean(b.phone), area = clean(b.area), address = clean(b.address), note = clean(b.note);
  const payment = b.payment === 'bkash' ? 'bkash' : 'cod', trx = clean(b.trx).toUpperCase();
  if (!name || !/^01\d{9}$/.test(phone) || !address || !cfg.areas.includes(area) || (payment === 'bkash' && trx.length < 6))
    return res.status(400).json({ ok: false, error: 'তথ্য ঠিক নেই' });
  let sub = 0; const items = [];
  for (const i of (Array.isArray(b.items) ? b.items.slice(0, 50) : [])) {
    const p = prods.find(x => x.id == i.id), q = Math.floor(Number(i.qty));
    if (!p || !(q > 0 && q <= 50)) return res.status(400).json({ ok: false });
    items.push({ name: p.name, unit: p.unit, price: p.price, qty: q }); sub += p.price * q;
  }
  if (!items.length || sub < cfg.min) return res.status(400).json({ ok: false });
  const delivery = sub >= cfg.freeAbove ? 0 : cfg.delivery, total = sub + delivery;
  const id = 'SJ' + Date.now().toString().slice(-5) + Math.floor(Math.random() * 90 + 10);
  const r = await db('orders', { method: 'POST', body: JSON.stringify({ id, name, phone, area, address, note, items, subtotal: sub, delivery, total, payment, trx_id: trx || null }) });
  if (!r.ok) return res.status(500).json({ ok: false });
  const lines = items.map(i => `• ${i.name} (${i.unit}) × ${i.qty} = ${i.price * i.qty}৳`).join('\n');
  const pay = payment === 'bkash' ? `bKash (TrxID: ${trx}) — যাচাই করুন` : 'ক্যাশ অন ডেলিভারি';
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `🛒 নতুন অর্ডার #${id}\n\n👤 ${name}\n📞 ${phone}\n📍 ${area}: ${address}\n${note ? '📝 ' + note + '\n' : ''}\n${lines}\n\nডেলিভারি: ${delivery}৳\n💰 মোট: ${total}৳\n💳 ${pay}` })
  }).catch(() => {});
  res.status(200).json({ ok: true, id });
}
