

// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Essays from '../views/Essays.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'), // 假设你有首页
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: '关于我' }
  },
  {
    path: '/essays',
    name: 'Essays',
    component: Essays,
    meta: { 
      title: '作者随笔',
      transition: 'page-flip' // 自定义过渡名称
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router