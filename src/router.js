import { createRouter, createWebHistory } from 'vue-router';
import CustomerView from './views/CustomerView.vue';
import SalesView from './views/SalesView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/customer'
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerView
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesView
    }
  ]
});

export default router;
