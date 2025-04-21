import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AddQuestion from '../views/AddQuestion.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/ajouter', component: AddQuestion }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router