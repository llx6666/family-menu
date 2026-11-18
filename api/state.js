// GET /api/state —— 读全量数据（首次访问自动播种种子数据）
const { Redis } = require('@upstash/redis')

const SEED = {
  version: 1,
  members: ['爸爸', '妈妈', '娃'],
  dishes: [
    { id: 'd1',  name: '红烧肉',       emoji: '🥩', cat: '荤菜', spicy: 0, ingredients: '五花肉\n冰糖\n生抽\n老抽\n料酒\n葱姜' },
    { id: 'd2',  name: '糖醋排骨',     emoji: '🍖', cat: '荤菜', spicy: 0, ingredients: '肋排\n糖\n醋\n生抽\n料酒' },
    { id: 'd3',  name: '可乐鸡翅',     emoji: '🍗', cat: '荤菜', spicy: 0, ingredients: '鸡翅\n可乐\n生抽\n姜' },
    { id: 'd4',  name: '清蒸鲈鱼',     emoji: '🐟', cat: '荤菜', spicy: 0, ingredients: '鲈鱼\n蒸鱼豉油\n葱\n姜' },
    { id: 'd5',  name: '番茄炒蛋',     emoji: '🍅', cat: '素菜', spicy: 0, ingredients: '番茄\n鸡蛋\n糖\n葱' },
    { id: 'd6',  name: '麻婆豆腐',     emoji: '🥘', cat: '素菜', spicy: 2, ingredients: '豆腐\n肉末\n豆瓣酱\n花椒\n蒜苗' },
    { id: 'd7',  name: '干煸四季豆',   emoji: '🫛', cat: '素菜', spicy: 1, ingredients: '四季豆\n肉末\n干辣椒\n蒜' },
    { id: 'd8',  name: '地三鲜',       emoji: '🥔', cat: '素菜', spicy: 0, ingredients: '土豆\n茄子\n青椒\n蒜' },
    { id: 'd9',  name: '蒜蓉西兰花',   emoji: '🥦', cat: '素菜', spicy: 0, ingredients: '西兰花\n蒜\n盐' },
    { id: 'd10', name: '紫菜蛋花汤',   emoji: '🥣', cat: '汤',   spicy: 0, ingredients: '紫菜\n鸡蛋\n虾皮\n香油' },
    { id: 'd11', name: '冬瓜排骨汤',   emoji: '🍲', cat: '汤',   spicy: 0, ingredients: '冬瓜\n排骨\n姜\n料酒' },
    { id: 'd12', name: '番茄蛋汤',     emoji: '🍜', cat: '汤',   spicy: 0, ingredients: '番茄\n鸡蛋\n葱' },
    { id: 'd13', name: '白米饭',       emoji: '🍚', cat: '主食', spicy: 0, ingredients: '大米' },
    { id: 'd14', name: '葱油拌面',     emoji: '🍝', cat: '主食', spicy: 0, ingredients: '面条\n小葱\n生抽\n糖' },
    { id: 'd15', name: '辣子鸡',       emoji: '🌶️', cat: '荤菜', spicy: 3, ingredients: '鸡腿肉\n干辣椒\n花椒\n花生\n芝麻' }
  ],
  picks: {} // { 'YYYY-MM-DD': { '爸爸': ['d1','d5'], ... } }
}

function client() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('缺少 Upstash 环境变量，见 README 部署第 3 步')
  return new Redis({ url, token })
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const r = client()
    let doc = await r.json('fmenu')
    if (!doc) {
      await r.set('fmenu', JSON.stringify(SEED))
      doc = SEED
    }
    res.status(200).json(doc)
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) })
  }
}
