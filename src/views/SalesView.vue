<script setup>
import ChatPage from '../components/ChatPage.vue';

const messages = [
  {
    id: 101,
    type: 'text',
    text: '2026/03/27 17:21:24 文字客服工作台已連線，可使用快速回覆模板協助處理對話。',
    sender: 'system',
    time: '17:21',
    status: 'read'
  },
  {
    id: 102,
    type: 'text',
    text: '民眾反映中正路123號交叉路口是否設計不良。',
    sender: 'user',
    time: '17:22',
    status: 'read'
  },
  {
    id: 103,
    type: 'text',
    text: '已回報相關單位前往勘查，若有進一步結果會再通知您。',
    sender: 'agent',
    time: '17:23',
    status: 'read'
  }
];
</script>

<template>
  <ChatPage
    title="新竹市政府1999文字客服"
    :initial-messages="messages"
    sales-mode
  />
</template>
