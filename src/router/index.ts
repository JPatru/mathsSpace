import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Evaluation from '../views/Evaluation.vue'
import Course from '../views/Course.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/evaluation', name: 'Evaluation', component: Evaluation },
  { path: '/course', name: 'Course', component: Course }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router