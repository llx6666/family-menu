<template>
  <div class="page">
    <!-- PIN 门 -->
    <div v-if="!unlocked" class="card pin-card">
      <div class="label">管理入口（改菜品 / 改家人名单）</div>
      <van-field v-model="pin" type="password" placeholder="管理 PIN（默认 8888，部署时改）" />
      <van-button type="primary" block round style="margin-top:10px" :loading="checking" @click="unlock">进入</van-button>
    </div>

    <template v-else>
      <div class="card">
        <div class="label">家人名单（顿号/逗号分隔）</div>
        <van-field v-model="membersText" placeholder="爸爸、妈妈、娃" />
        <van-button size="small" type="primary" plain style="margin-top:8px" @click="saveMembers">保存名单</van-button>
      </div>

      <div class="card">
        <div class="label">菜品库（{{ dishes.length }} 道）</div>
        <div v-for="(d, i) in dishes" :key="d.id" class="dish-edit">
          <van-field v-model="d.emoji" label="图标" style="width:80px" />
          <van-field v-model="d.name" label="菜名" />
          <van-field v-model="d.cat" label="分类" placeholder="荤菜/素菜/汤/主食" />
          <van-field v-model.number="d.spicy" label="辣度0-3" type="digit" />
          <van-field v-model="d.ingredients" label="食材" type="textarea" rows="2" placeholder="每行一种食材" />
          <div class="dish-ops">
            <van-button size="small" plain type="danger" @click="del(i)">删除</van-button>
          </div>
        </div>
        <van-button size="small" plain style="margin-top:6px" @click="add">＋ 加一道菜</van-button>
        <van-button size="small" type="primary" :loading="saving" style="margin-top:6px;float:right" @click="saveDishes">保存全部菜品</van-button>
        <div style="clear:both"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { store } from '../store'

const pin = ref('')
const unlocked = ref(false)
const checking = ref(false)
const saving = ref(false)
const dishes = ref([])
const membersText = ref('')

onMounted(async () => {
  if (!store.doc) await store.refresh()
  if (store.doc) {
    dishes.value = JSON.parse(JSON.stringify(store.doc.dishes))
    membersText.value = store.doc.members.join('、')
  }
})

async function unlock() {
  checking.value = true
  try {
    await store.saveAdmin({ pin: pin.value }) // 空操作，只验 PIN
    unlocked.value = true
    showSuccessToast('欢迎回来')
  } catch (e) {
    showToast(e.message)
  } finally { checking.value = false }
}

function add() {
  dishes.value.push({ id: 'd' + Date.now(), name: '', emoji: '🍽️', cat: '荤菜', spicy: 0, ingredients: '' })
}
function del(i) { dishes.value.splice(i, 1) }

async function saveDishes() {
  const clean = dishes.value.filter(d => d.name.trim())
  saving.value = true
  try {
    await store.saveAdmin({ pin: pin.value, dishes: clean })
    dishes.value = JSON.parse(JSON.stringify(clean))
    showSuccessToast('菜品库已保存')
  } catch (e) { showToast(e.message) } finally { saving.value = false }
}

async function saveMembers() {
  const arr = membersText.value.split(/[、,，\s]+/).map(s => s.trim()).filter(Boolean)
  try {
    await store.saveAdmin({ pin: pin.value, members: arr })
    showSuccessToast('名单已保存')
  } catch (e) { showToast(e.message) }
}
</script>

<style scoped>
.page { padding: 0 12px 20px; }
.card { background: #fff; border-radius: 12px; padding: 12px; margin-top: 10px; }
.pin-card { max-width: 420px; }
.label { font-size: 13px; color: #969799; margin-bottom: 8px; }
.dish-edit { border: 1px solid #f0f0f0; border-radius: 8px; padding: 6px; margin-bottom: 10px; }
.dish-ops { display: flex; justify-content: flex-end; padding-top: 4px; }
</style>
