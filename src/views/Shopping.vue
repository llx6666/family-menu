<template>
  <div class="page">
    <div v-if="!store.doc" class="loading"><van-loading size="24">加载中…</van-loading></div>
    <template v-else>
      <div class="card">
        <div class="label">{{ dateStr }} 买菜清单（按今日点菜汇总，点击划掉）</div>
        <div v-if="items.length === 0" class="empty">今天还没人点菜，清单是空的～</div>
        <div v-for="it in items" :key="it.name" class="item" :class="{ done: checked.includes(it.name) }" @click="toggle(it.name)">
          <span class="box">{{ checked.includes(it.name) ? '✅' : '⬜' }}</span>
          <span class="name">{{ it.name }}</span>
          <span class="from">{{ it.from }}</span>
        </div>
      </div>
      <div class="ops">
        <van-button size="small" plain @click="checked = []">重置勾选</van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { store, today } from '../store'

const dateStr = today()
const KEY = 'fmenu-checked-' + dateStr
const checked = ref(JSON.parse(localStorage.getItem(KEY) || '[]'))
watch(checked, v => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

const items = computed(() => {
  const t = store.doc?.picks?.[dateStr] || {}
  const pickedIds = new Set()
  for (const m in t) for (const id of t[m]) pickedIds.add(id)
  const map = {}
  for (const d of store.doc.dishes) {
    if (!pickedIds.has(d.id)) continue
    for (const line of String(d.ingredients || '').split(/\n|，|,/)) {
      const name = line.trim()
      if (!name) continue
      ;(map[name] = map[name] || []).push(d.name)
    }
  }
  return Object.entries(map)
    .map(([name, from]) => ({ name, from: from.slice(0, 3).join('/') + (from.length > 3 ? '…' : '') }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
})

function toggle(name) {
  const i = checked.value.indexOf(name)
  i >= 0 ? checked.value.splice(i, 1) : checked.value.push(name)
}
</script>

<style scoped>
.page { padding: 0 12px; }
.loading { text-align: center; margin-top: 40px; }
.card { background: #fff; border-radius: 12px; padding: 12px; margin-top: 10px; }
.label { font-size: 13px; color: #969799; margin-bottom: 8px; }
.empty { color: #c8c9cc; padding: 12px 0; }
.item { display: flex; align-items: center; gap: 8px; padding: 9px 0; border-bottom: 1px dashed #f0f0f0; font-size: 15px; }
.item:last-child { border-bottom: none; }
.done .name { text-decoration: line-through; color: #c8c9cc; }
.name { flex: 1; }
.from { color: #969799; font-size: 11px; }
.ops { display: flex; justify-content: center; padding: 14px 0 20px; }
</style>
