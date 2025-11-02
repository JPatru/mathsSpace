import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Evaluation from '../views/Evaluation.vue'
import Defi from '../views/DefiMaths.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/evaluation', name: 'Evaluation', component: Evaluation },
  { path: '/defi', name: 'Defi', component: Defi }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router