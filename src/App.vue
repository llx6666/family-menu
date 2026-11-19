<template>
  <div class="app">
    <div class="head">
      <div>
        <div class="title">🏠 家庭点菜</div>
        <div class="sub">{{ store.myName ? store.myName + ' · ' : '' }}{{ dateStr }}<span v-if="store.locked"> 🔒</span></div>
      </div>
      <div class="meal">今晚吃啥</div>
    </div>
    <router-view />
    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item replace to="/" icon="edit">点菜</van-tabbar-item>
      <van-tabbar-item replace to="/summary" icon="bar-chart-o">汇总</van-tabbar-item>
      <van-tabbar-item replace to="/wheel" icon="arrow">转盘</van-tabbar-item>
      <van-tabbar-item replace to="/shopping" icon="shopping-cart-o">买菜</van-tabbar-item>
      <van-tabbar-item replace to="/admin" icon="setting-o">管理</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { store, today } from './store'
const dateStr = computed(() => today())
onMounted(() => { if (!store.doc) store.refresh() })
</script>

<style>
:root {
  --van-primary-color: #ff5a3c;
  --van-tabbar-item-active-color: #ff5a3c;
}
body { margin: 0; background: #fbf6f2; font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.app { padding-bottom: 66px; max-width: 640px; margin: 0 auto; }
.head { padding: 16px 18px 20px; display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, #ff8f43, #ff5a3c);
  border-radius: 0 0 22px 22px; box-shadow: 0 4px 14px rgba(255, 90, 60, .25); }
.title { font-size: 20px; font-weight: 700; color: #fff; }
.sub { color: rgba(255, 255, 255, .88); font-size: 12px; margin-top: 3px; }
.meal { background: rgba(255, 255, 255, .2); border-radius: 999px; color: #fff; font-size: 12px; padding: 5px 12px; }

/* 全局卡片质感 */
.page .card { box-shadow: 0 2px 10px rgba(0, 0, 0, .05); }
</style>
