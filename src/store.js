// 轻量全局状态（家庭规模：一次拉全量，本地 reactive）
import { reactive } from 'vue'

export function today() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const store = reactive({
  doc: null,      // { members, dishes, picks }
  loading: false,
  error: '',
  myName: localStorage.getItem('fmenu-me') || '',
  locked: !!localStorage.getItem('fmenu-lock'),
  cart: [],       // 本地购物车（菜品 id），提交后清空

  setMe(name) {
    if (this.locked) return          // 已锁定，禁止切换
    this.myName = name
    localStorage.setItem('fmenu-me', name)
  },

  confirmMe() {                       // 确认身份 → 锁定
    if (!this.myName) return
    localStorage.setItem('fmenu-lock', this.myName)
    this.locked = true
  },

  resetMe() {                         // 仅管理页调用：重置身份
    this.myName = ''
    this.locked = false
    this.cart = []
    localStorage.removeItem('fmenu-me')
    localStorage.removeItem('fmenu-lock')
  },

  toggleCart(id) {
    const i = this.cart.indexOf(id)
    i >= 0 ? this.cart.splice(i, 1) : this.cart.push(id)
  },

  async refresh() {
    this.loading = true; this.error = ''
    try {
      const r = await fetch('/api/state')
      const j = await r.json()
      if (j.error) throw new Error(j.error)
      this.doc = j
    } catch (e) {
      this.error = String(e.message || e)
    } finally {
      this.loading = false
    }
  },

  myPicks(date) {
    if (!this.doc || !this.doc.picks[date]) return []
    return this.doc.picks[date][this.myName] || []
  },

  async submitPicks(dishIds) {
    const r = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today(), member: this.myName, dishIds })
    })
    const j = await r.json()
    if (!r.ok || j.error) throw new Error(j.error || '提交失败')
    await this.refresh()
  },

  async saveAdmin(payload) {
    const r = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const j = await r.json()
    if (!r.ok || j.error) throw new Error(j.error || '保存失败')
    await this.refresh()
  }
})
