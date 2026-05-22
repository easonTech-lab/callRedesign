import { createRouter, createWebHistory } from 'vue-router';
import SalesView from './views/SalesView.vue';
import AiCustomerView from './views/AiCustomerView.vue';
import VoiceSalesView from './views/VoiceSalesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'voice-sales' }
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
    },
    {
      path: '/voice-sales',
      name: 'voice-sales',
      component: VoiceSalesView
    }
  ]
});

export default router;
