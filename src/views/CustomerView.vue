<script setup>
import ChatPage from '../components/ChatPage.vue';

const messages = [];
</script>

<template>
  <ChatPage
    title="新竹市政府1999文字客服"
    :initial-messages="messages"
    customer-ai
  />
</template>
