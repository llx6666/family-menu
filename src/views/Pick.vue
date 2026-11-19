<template>
  <div class="page">
    <van-loading v-if="store.loading && !store.doc" class="loading" size="24">加载中…</van-loading>
    <van-empty v-else-if="store.error" :description="store.error + '（下拉刷新试试）'" />

    <!-- 身份未锁定：选人 + 确认 -->
    <div v-if="store.doc && !store.locked" class="card hero">
      <div class="hero-title">今天你是谁？</div>
      <div class="hero-sub">确认后就锁定啦，防止手滑点错人～</div>
      <div class="chips">
        <span
          v-for="m in store.doc.members" :key="m"
          class="chip" :class="{ on: store.myName === m }"
          @click="store.setMe(m)">{{ m }}</span>
      </div>
      <van-button type="primary" round block class="hero-btn"
        :disabled="!store.myName" @click="store.confirmMe()">
        就是我了，开点 🍽️
      </van-button>
    </div>

    <template v-if="store.doc && store.locked">
      <div class="me-strip" @click="hintLock">
        <span class="me-avatar">{{ store.myName.slice(0, 1) }}</span>
        <span class="me-name">{{ store.myName }}</span>
        <span class="me-lock">🔒 已锁定</span>
      </div>

      <!-- 下拉菜单式菜品列表 -->
      <van-collapse v-model="openCats" class="menu" accordion>
        <van-collapse-item v-for="g in groups" :key="g.cat" :name="g.cat">
          <template #title>
            <span class="cat-title">{{ g.cat }}</span>
            <span class="cat-count">{{ g.items.length }} 道</span>
          </template>
          <div v-for="d in g.items" :key="d.id" class="dish-row">
            <span class="d-emoji">{{ d.emoji }}</span>
            <span class="d-name">{{ d.name }}</span>
            <span v-if="d.spicy >= 2" class="d-spicy">🌶️</span>
            <span v-if="votesOf(d.id) > 0" class="d-votes">{{ votesOf(d.id) }}票</span>
            <button class="add-btn" :class="{ in: inCart(d.id) }" @click="store.toggleCart(d.id)">
              {{ inCart(d.id) ? '✓ 已点' : '＋ 点' }}
            </button>
          </div>
        </van-collapse-item>
      </van-collapse>

      <!-- 购物车栏 -->
      <div class="cart-bar">
        <div class="cart-info" @click="cartOpen = true">
          <span class="cart-badge" :class="{ zero: !store.cart.length }">{{ store.cart.length }}</span>
          <span class="cart-label">{{ store.cart.length ? '已点 ' + store.cart.length + ' 道 · 查看' : '还没点菜' }}</span>
        </div>
        <button class="go-btn" :disabled="!store.cart.length || submitting" @click="submit">
          {{ submitting ? '提交中…' : '我选好啦 🚀' }}
        </button>
      </div>

      <!-- 购物车明细弹层 -->
      <van-popup v-model:show="cartOpen" position="bottom" round class="cart-pop">
        <div class="pop-head">
          <span>我的菜篮 🧺</span>
          <span v-if="store.cart.length" class="pop-clear" @click="store.cart = []">清空</span>
        </div>
        <div v-if="!store.cart.length" class="pop-empty">空空的，去上面点几道菜喵</div>
        <div v-for="id in store.cart" :key="id" class="pop-row">
          <span>{{ dishOf(id)?.emoji || '🍽️' }} {{ dishOf(id)?.name || id }}</span>
          <span class="pop-x" @click="store.toggleCart(id)">✕</span>
        </div>
        <div class="pop-pad"></div>
      </van-popup>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { useRouter } from 'vue-router'
import { store, today } from '../store'

const router = useRouter()
const submitting = ref(false)
const cartOpen = ref(false)
const openCats = ref('')

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

function inCart(id) { return store.cart.includes(id) }
function dishOf(id) { return store.doc?.dishes.find(d => d.id === id) }

function hintLock() {
  showToast('身份已锁定，换人请在「管理」页重置')
}

async function submit() {
  if (!store.cart.length) return
  submitting.value = true
  try {
    await store.submitPicks([...store.cart])
    store.cart = []
    showSuccessToast('菜单已提交，买菜清单生成啦 🛒')
    router.replace('/shopping')
  } catch (e) {
    showToast(e.message)
  } finally { submitting.value = false }
}

onMounted(async () => {
  if (!store.doc) await store.refresh()
  store.cart = [...store.myPicks(today())]   // 回显今天已点的
  openCats.value = groups.value[0]?.cat || ''
})
</script>

<style scoped>
.page { padding: 0 12px 130px; }
.loading { display: block; margin: 40px auto; text-align: center; }

/* 身份卡片 */
.hero { text-align: center; padding: 22px 16px 18px; }
.hero-title { font-size: 19px; font-weight: 700; margin-bottom: 4px; }
.hero-sub { font-size: 12px; color: #999; margin-bottom: 14px; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 16px; }
.chip { padding: 8px 22px; border-radius: 999px; background: #f2f3f5; font-size: 15px; }
.chip.on { background: #ff5a3c; color: #fff; }
.hero-btn { max-width: 320px; margin: 0 auto; }

/* 身份条 */
.me-strip { display: flex; align-items: center; gap: 8px; background: #fff; border-radius: 12px; padding: 10px 14px; margin-top: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.me-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,#ff8f43,#ff5a3c); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.me-name { font-weight: 600; flex: 1; }
.me-lock { font-size: 12px; color: #b8b8b8; }

/* 下拉菜单 */
.menu { margin-top: 10px; border-radius: 12px; overflow: hidden; }
.menu :deep(.van-collapse-item) { margin-bottom: 8px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.cat-title { font-size: 15px; font-weight: 600; }
.cat-count { font-size: 12px; color: #999; margin-left: 8px; }
.dish-row { display: flex; align-items: center; gap: 8px; padding: 9px 4px; border-bottom: 1px dashed #f2f2f2; }
.dish-row:last-child { border-bottom: none; }
.d-emoji { font-size: 19px; }
.d-name { font-size: 14px; flex: 1; }
.d-spicy { font-size: 12px; }
.d-votes { font-size: 11px; color: #ee0a24; background: #fff1f1; border-radius: 8px; padding: 1px 6px; }
.add-btn { border: none; background: #fff1ec; color: #ff5a3c; border-radius: 999px; padding: 5px 14px; font-size: 13px; }
.add-btn.in { background: #ff5a3c; color: #fff; }

/* 购物车栏（悬浮于 tabbar 上） */
.cart-bar { position: fixed; left: 12px; right: 12px; bottom: 74px; max-width: 616px; margin: 0 auto; display: flex; align-items: center; gap: 10px; background: #1f1f24; border-radius: 999px; padding: 8px 10px 8px 14px; box-shadow: 0 6px 18px rgba(0,0,0,.28); z-index: 20; }
.cart-info { display: flex; align-items: center; gap: 8px; flex: 1; color: #fff; }
.cart-badge { min-width: 22px; height: 22px; border-radius: 999px; background: #ff5a3c; color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; padding: 0 6px; }
.cart-badge.zero { background: #666; }
.cart-label { font-size: 13px; }
.go-btn { border: none; background: linear-gradient(135deg,#ff8f43,#ff5a3c); color: #fff; font-size: 15px; font-weight: 600; border-radius: 999px; padding: 9px 20px; }
.go-btn:disabled { opacity: .5; }

/* 购物车弹层 */
.cart-pop { padding: 16px 16px 0; }
.pop-head { display: flex; justify-content: space-between; font-size: 15px; font-weight: 600; margin-bottom: 10px; }
.pop-clear { color: #999; font-size: 13px; font-weight: 400; }
.pop-empty { color: #bbb; text-align: center; padding: 24px 0 30px; font-size: 13px; }
.pop-row { display: flex; justify-content: space-between; padding: 10px 4px; border-bottom: 1px dashed #f0f0f0; font-size: 14px; }
.pop-x { color: #ff5a3c; padding: 0 6px; }
.pop-pad { height: 20px; }
</style>
