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

  setMe(name) {
    this.myName = name
    localStorage.setItem('fmenu-me', name)
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
