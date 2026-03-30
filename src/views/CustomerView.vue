<script setup>
import ChatPage from '../components/ChatPage.vue';

const messages = [
  {
    id: 1,
    type: 'text',
    text: '2026/03/27 17:21:24 感謝使用文字客服，客服人員連線中……(服務時間：政府機關上班日上午八點半到下午五點半)',
    sender: 'agent',
    time: '17:21',
    status: 'read'
  },
  {
    id: 2,
    type: 'text',
    text: '已連線，請輸入文字進行交談。',
    sender: 'agent',
    time: '17:21',
    status: 'read'
  },
  {
    id: 3,
    type: 'text',
    text: '您好我想請教道路問題',
    sender: 'user',
    time: '17:21',
    status: 'read'
  },
  {
    id: 4,
    type: 'text',
    text: '好的 我能怎麼協助您？',
    sender: 'agent',
    time: '17:22',
    status: 'read'
  },
  {
    id: 5,
    type: 'text',
    text: '中正路123號交叉的路口是否設計不良？',
    sender: 'user',
    time: '17:22',
    status: 'read'
  },
  {
    id: 6,
    type: 'text',
    text: '了解 已回報相關單位前往勘查',
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
  />
</template>
