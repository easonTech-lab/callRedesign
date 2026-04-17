import { createRouter, createWebHistory } from 'vue-router';
import CustomerView from './views/CustomerView.vue';
import SalesView from './views/SalesView.vue';
import AiCustomerView from './views/AiCustomerView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'customer' }
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
    },
    {
      path: '/ai-customer',
      name: 'ai-customer',
      component: AiCustomerView
    }
  ]
});

export default router;
