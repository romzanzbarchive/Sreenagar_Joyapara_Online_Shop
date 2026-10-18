export const db = (path, opt = {}) => fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
  ...opt,
  headers: { apikey: process.env.SUPABASE_KEY, Authorization: `Bearer ${process.env.SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(opt.headers || {}) }
});
export const clean = s => String(s || '').replace(/[<>]/g, '').trim().slice(0, 200);
