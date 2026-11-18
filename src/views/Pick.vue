<template>
  <div class="page">
    <van-loading v-if="store.loading && !store.doc" class="loading" size="24">加载中…</van-loading>
    <van-empty v-else-if="store.error" :description="store.error + '（下拉刷新试试）'" />

    <!-- 选人 -->
    <div v-if="store.doc" class="card">
      <div class="label">今天你是谁？</div>
      <div class="chips">
        <span
          v-for="m in store.doc.members" :key="m"
          class="chip" :class="{ on: store.myName === m }"
          @click="store.setMe(m)">{{ m }}</span>
      </div>
    </div>

    <!-- 菜品勾选 -->
    <template v-if="store.doc && store.myName">
      <div v-for="g in groups" :key="g.cat" class="card">
        <div class="label">{{ g.cat }}</div>
        <van-checkbox-group v-model="picked">
          <div class="dish-grid">
            <div v-for="d in g.items" :key="d.id" class="dish" @click="toggle(d.id)">
              <van-checkbox :name="d.id" shape="square" icon-size="18" />
              <span class="d-emoji">{{ d.emoji }}</span>
              <span class="d-name">{{ d.name }}</span>
              <span v-if="d.spicy >= 2" class="d-spicy">🌶️</span>
              <span v-if="votesOf(d.id) > 0" class="d-votes">{{ votesOf(d.id) }}票</span>
            </div>
          </div>
        </van-checkbox-group>
      </div>

      <div class="submit-bar">
        <van-button type="primary" round block :loading="submitting" @click="submit">
          提交点菜（已选 {{ picked.length }} 道）
        </van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { store, today } from '../store'

const picked = ref([])
const submitting = ref(false)

const groups = computed(() => {
  if (!store.doc) return []
  const by = {}
  for (const d of store.doc.dishes) (by[d.cat] = by[d.cat] || []).push(d)
  return Object.entries(by).map(([cat, items]) => ({ cat, items }))
})

function votesOf(id) {
  const t = store.doc?.picks?.[today()] || {}
  let n = 0
  for (const m in t) if (t[m].includes(id)) n++
  return n
}

function toggle(id) {
  const i = picked.value.indexOf(id)
  i >= 0 ? picked.value.splice(i, 1) : picked.value.push(id)
}

async function submit() {
  if (!store.myName) return showToast('先选你是谁')
  submitting.value = true
  try {
    await store.submitPicks(picked.value)
    showSuccessToast('点好了，等开饭 🍚')
  } catch (e) {
    showToast(e.message)
  } finally { submitting.value = false }
}

onMounted(async () => {
  if (!store.doc) await store.refresh()
  picked.value = [...store.myPicks(today())]
})
watch(() => store.doc, () => { picked.value = [...store.myPicks(today())] })
</script>

<style scoped>
.page { padding: 0 12px; }
.loading { display: block; margin: 40px auto; text-align: center; }
.card { background: #fff; border-radius: 12px; padding: 12px; margin-top: 10px; }
.label { font-size: 13px; color: #969799; margin-bottom: 8px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 6px 16px; border-radius: 999px; background: #f2f3f5; font-size: 14px; }
.chip.on { background: #1989fa; color: #fff; }
.dish-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dish { display: flex; align-items: center; gap: 6px; background: #f7f8fa; border-radius: 8px; padding: 8px; }
.dish :deep(.van-checkbox) { pointer-events: none; }
.d-emoji { font-size: 18px; }
.d-name { font-size: 14px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.d-spicy { font-size: 12px; }
.d-votes { font-size: 11px; color: #ee0a24; background: #fff; border-radius: 8px; padding: 0 5px; }
.submit-bar { padding: 14px 0 20px; }
</style>
