// POST /api/picks  body: { date: 'YYYY-MM-DD', member: '爸爸', dishIds: ['d1','d5'], pin? }
// 写一个人的当日勾选（整组覆盖，幂等）
const { Redis } = require('@upstash/redis')

function client() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('缺少 Upstash 环境变量')
  return new Redis({ url, token })
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const { date, member, dishIds } = body
    if (!date || !member || !Array.isArray(dishIds)) {
      return res.status(400).json({ error: '参数不完整：date/member/dishIds' })
    }
    const r = client()
    const raw = await r.get('fmenu')
    const doc = (raw == null || raw === '') ? { members: [], dishes: [], picks: {} } : (typeof raw === 'string' ? JSON.parse(raw) : raw)
    if (!doc.picks) doc.picks = {}
    if (!doc.picks[date]) doc.picks[date] = {}
    doc.picks[date][member] = dishIds
    await r.set('fmenu', doc)
    res.status(200).json({ ok: true, saved: dishIds.length })
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) })
  }
}
