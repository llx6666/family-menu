<template>
  <div class="page">
    <div v-if="!store.doc" class="loading"><van-loading size="24">加载中…</van-loading></div>
    <template v-else>
      <div class="card">
        <div class="label">{{ dateStr }} 全家点菜汇总（按得票排序）</div>
        <div v-if="rows.length === 0" class="empty">今天还没人点菜，快去点～</div>
        <div v-for="r in rows" :key="r.id" class="row">
          <span class="r-dish">{{ r.emoji }} {{ r.name }}</span>
          <span class="r-votes">{{ r.voters.length }} 票</span>
          <span class="r-who">{{ r.voters.join('、') }}</span>
        </div>
      </div>

      <div class="card">
        <div class="label">每人点了什么</div>
        <div v-for="m in perMember" :key="m.name" class="row">
          <span class="r-dish">👤 {{ m.name }}</span>
          <span class="r-who">{{ m.names.length ? m.names.join('、') : '还没点' }}</span>
        </div>
      </div>

      <div class="ops">
        <van-button size="small" plain type="default" @click="refresh">刷新</van-button>
        <van-button size="small" plain type="danger" @click="clearToday">清空今日重点</van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
import { store, today } from '../store'

const dateStr = today()

const rows = computed(() => {
  const t = store.doc?.picks?.[dateStr] || {}
  const map = {}
  for (const m in t) for (const id of t[m]) {
    ;(map[id] = map[id] || []).push(m)
  }
  return Object.entries(map)
    .map(([id, voters]) => {
      const d = store.doc.dishes.find(x => x.id === id)
      return { id, name: d ? d.name : '(已删菜品)', emoji: d ? d.emoji : '❓', voters }
    })
    .sort((a, b) => b.voters.length - a.voters.length)
})

const perMember = computed(() => {
  const t = store.doc?.picks?.[dateStr] || {}
  return (store.doc?.members || []).map(name => {
    const ids = t[name] || []
    return { name, names: ids.map(id => { const d = store.doc.dishes.find(x => x.id === id); return d ? d.name : '' }).filter(Boolean) }
  })
})

async function refresh() { await store.refresh() }

async function clearToday() {
  try {
    await showConfirmDialog({ title: '清空今日', message: '全家的今日点菜都会清空，确定？' })
    const pin = prompt('输入管理 PIN')
    if (pin == null) return
    await store.saveAdmin({ pin, clearDate: dateStr })
    showSuccessToast('已清空')
  } catch (e) { if (e !== 'cancel' && e.message) showToast(e.message) }
}
</script>

<style scoped>
.page { padding: 0 12px; }
.loading { text-align: center; margin-top: 40px; }
.card { background: #fff; border-radius: 12px; padding: 12px; margin-top: 10px; }
.label { font-size: 13px; color: #969799; margin-bottom: 8px; }
.empty { color: #c8c9cc; padding: 12px 0; }
.row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px dashed #f0f0f0; font-size: 14px; }
.row:last-child { border-bottom: none; }
.r-dish { flex: 1; }
.r-votes { color: #ee0a24; font-weight: 600; font-size: 13px; }
.r-who { color: #969799; font-size: 12px; }
.ops { display: flex; gap: 8px; justify-content: center; padding: 14px 0 20px; }
</style>
