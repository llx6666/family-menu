<template>
  <div class="page">
    <div v-if="!store.doc" class="loading"><van-loading size="24">加载中…</van-loading></div>
    <template v-else>
      <div class="wheel-box">
        <div class="pointer">▼</div>
        <div class="wheel-outer">
          <div class="wheel" :style="wheelStyle">
            <div v-for="(d, i) in dishes" :key="d.id" class="seg" :style="segStyle(i)">
              <span class="seg-text" :style="segTextStyle(i)">{{ d.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="result" v-if="result">{{ result }} 今晚就吃它！🍽️</div>
      <div class="btns">
        <van-button type="primary" round :loading="spinning" :disabled="dishes.length < 2" @click="spin">
          {{ dishes.length < 2 ? '菜品不够转' : (spinning ? '转ing…' : '🍜 开始转！') }}
        </van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store'

const rotation = ref(0)
const spinning = ref(false)
const result = ref('')

const dishes = computed(() => store.doc?.dishes || [])
const n = computed(() => Math.max(dishes.value.length, 1))
const segAngle = computed(() => 360 / n.value)

const wheelStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
  background: `conic-gradient(${gradientStops.value})`,
  transition: spinning.value ? 'transform 4s cubic-bezier(0.25, 0.1, 0.15, 1)' : 'none'
}))

const colors = ['#ffe4b5', '#ffd6e7', '#d6e5ff', '#d5f5e3', '#fff5b5', '#f0d5ff', '#ffe0d5', '#d5f5f5']

const gradientStops = computed(() => {
  const stops = []
  for (let i = 0; i < n.value; i++) {
    const from = i * segAngle.value
    const to = (i + 1) * segAngle.value
    stops.push(`${colors[i % colors.length]} ${from}deg ${to}deg`)
  }
  return stops.join(', ')
})

function segStyle(i) {
  return {
    position: 'absolute', left: '50%', top: '50%',
    width: '50%', height: '2px',
    transformOrigin: '0 0',
    transform: `rotate(${i * segAngle.value + segAngle.value / 2}deg)`
  }
}
function segTextStyle(i) {
  return { color: '#323233', fontSize: n.value > 16 ? '10px' : '12px' }
}

function spin() {
  if (spinning.value) return
  spinning.value = true
  result.value = ''
  const idx = Math.floor(Math.random() * n.value)
  // 让第 idx 段中心停在指针（顶部, 12点）：段中心角 = idx*sa + sa/2
  // 指针在 0deg(顶部)。最终 rotation ≡ -(段中心角) (mod 360)
  const target = -(idx * segAngle.value + segAngle.value / 2)
  const cur = rotation.value
  let delta = target - (cur % 360)
  delta = ((delta % 360) + 360) % 360
  rotation.value = cur + 360 * 6 + delta
  setTimeout(() => {
    spinning.value = false
    result.value = dishes.value[idx] ? `${dishes.value[idx].emoji} ${dishes.value[idx].name}` : ''
  }, 4100)
}
</script>

<style scoped>
.page { padding: 20px 12px; text-align: center; }
.loading { margin-top: 40px; }
.wheel-box { position: relative; display: inline-block; margin-top: 12px; }
.pointer { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); z-index: 3; font-size: 26px; color: #ee0a24; text-shadow: 0 1px 2px #fff; }
.wheel-outer { width: 280px; height: 280px; border-radius: 50%; border: 8px solid #fff; box-shadow: 0 4px 16px rgba(0,0,0,.12); overflow: hidden; position: relative; }
.wheel { width: 100%; height: 100%; position: relative; border-radius: 50%; }
.seg-text { position: absolute; left: 12px; top: -7px; white-space: nowrap; font-weight: 600; }
.result { font-size: 20px; font-weight: 700; margin-top: 18px; color: #1989fa; min-height: 28px; }
.btns { margin-top: 14px; }
</style>
