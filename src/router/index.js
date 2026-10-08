import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookingWizardView from '../views/BookingWizardView.vue'
import GalleryView from '../views/GalleryView.vue'

import LoginView from '../views/admin/LoginView.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import ManageView from '../views/admin/ManageView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/booking',
      name: 'booking',
      component: BookingWizardView
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView
    },
    {
      path: '/admin/login',
      component: LoginView
    },
     { path: '/admin',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    { path: '/admin/manage',
      component: ManageView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('adminToken')) {
    return '/admin/login'
  }
  if (to.meta.requiresAdmin && localStorage.getItem('adminRole') !== 'admin') {
    return '/admin'
  }
})

export default router
