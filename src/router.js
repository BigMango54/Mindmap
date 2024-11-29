import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import IndexPage from '@/pages/Edit/Index'
import QuizMate from '@/pages/QuizMate'

const routes = [
  {
    path: '/',
    name: 'QuizMate',  // 修改為 QuizMate
    component: QuizMate  // 修改為 QuizMate
  },
  {
    path: '/index',
    name: 'Index',
    component: IndexPage
  },
  { path: '/', name: 'Edit', component: () => import(`./pages/Edit/Index.vue`) }
]

const router = createRouter({
  history: process.env.NODE_ENV === 'development' ? createWebHistory() : createWebHashHistory(),
  base: '/hyy-vue3-mindmap/',
  routes
})

export default router
