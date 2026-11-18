import { createRouter, createWebHashHistory } from 'vue-router'
import Pick from './views/Pick.vue'
import Summary from './views/Summary.vue'
import Wheel from './views/Wheel.vue'
import Shopping from './views/Shopping.vue'
import Admin from './views/Admin.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Pick },
    { path: '/summary', component: Summary },
    { path: '/wheel', component: Wheel },
    { path: '/shopping', component: Shopping },
    { path: '/admin', component: Admin }
  ]
})
