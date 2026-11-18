<template>
  <div class="app">
    <div class="head">
      <div class="title">🏠 家庭点菜</div>
      <div class="sub">{{ store.myName ? store.myName + ' · ' : '' }}{{ dateStr }}</div>
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
body { margin: 0; background: #f7f8fa; font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.app { padding-bottom: 66px; max-width: 640px; margin: 0 auto; }
.head { padding: 14px 16px 8px; display: flex; align-items: baseline; justify-content: space-between; }
.title { font-size: 20px; font-weight: 700; }
.sub { color: #969799; font-size: 13px; }
</style>
