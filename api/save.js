// POST /api/save  body: { pin, dishes?: [...], members?: [...], clearDate?: 'YYYY-MM-DD' }
// 管理端：改菜品库 / 成员 / 清空某日勾选
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
    const expectPin = process.env.ADMIN_PIN || '8888'
    if (String(body.pin || '') !== String(expectPin)) {
      return res.status(403).json({ error: 'PIN 不对' })
    }
    const r = client()
    const raw = await r.get('fmenu')
    const doc = JSON.parse(raw || '{}')
    if (Array.isArray(body.dishes)) doc.dishes = body.dishes
    if (Array.isArray(body.members)) doc.members = body.members
    if (body.clearDate) {
      if (doc.picks) delete doc.picks[body.clearDate]
    }
    await r.set('fmenu', JSON.stringify(doc))
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) })
  }
}
