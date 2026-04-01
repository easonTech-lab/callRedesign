<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  initialMessages: {
    type: Array,
    required: true
  },
  salesMode: {
    type: Boolean,
    default: false
  }
});

const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const messages = ref(structuredClone(props.initialMessages));
const inputText = ref('');
const showStickers = ref(false);
const uploadError = ref('');
const showFeedbackModal = ref(false);
const feedbackSubmitted = ref(false);
const chatEndRef = ref(null);
const fileInputRef = ref(null);
let uploadErrorTimer = null;
let readStatusTimer = null;

const stickers = [
  { id: 'front', name: '皮卡正面', src: withBase('/stickers/pika-front.png') },
  { id: 'back', name: '皮卡背面', src: withBase('/stickers/pika-back.png') },
  { id: 'side', name: '皮卡側面', src: withBase('/stickers/pika-side.png') },
  { id: 'happy', name: '皮卡開心', src: withBase('/stickers/pika-happy.png') },
  { id: 'salute', name: '皮卡敬禮', src: withBase('/stickers/pika-salute.png') },
  { id: 'question', name: '皮卡疑問', src: withBase('/stickers/pika-question.png') },
  { id: 'explain', name: '皮卡說明', src: withBase('/stickers/pika-explain.png') },
  { id: 'sign', name: '皮卡舉牌', src: withBase('/stickers/pika-sign.png') }
];

const quickReplies = [
  '您好，已收到您的反映，我先幫您確認。',
  '此案件已轉請相關單位處理，請您稍候。',
  '請提供更詳細的地點、照片或時間資訊，以利後續查證。',
  '若涉及緊急危安情況，建議您立即撥打 119 或 110。',
  '感謝您的通報，後續若有進度會再主動回覆您。'
];

const agentAvatar = withBase('/stickers/pika-happy.png');
const canSend = computed(() => inputText.value.trim().length > 0);
const quickRepliesCollapsed = ref(false);

const getTime = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

const scrollToBottom = async () => {
  await nextTick();
  chatEndRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

const setMessagesReadLater = () => {
  const hasUnreadSentMessage = messages.value.some(
    (message) => message.sender === 'user' && message.status === 'sent'
  );

  if (!hasUnreadSentMessage) {
    return;
  }

  if (readStatusTimer) {
    clearTimeout(readStatusTimer);
  }

  readStatusTimer = window.setTimeout(() => {
    messages.value = messages.value.map((message) =>
      message.sender === 'user' && message.status === 'sent'
        ? { ...message, status: 'read' }
        : message
    );
  }, 2000);
};

const appendMessage = (message) => {
  messages.value = [...messages.value, message];
};

const sendMessage = () => {
  if (!canSend.value) {
    return;
  }

  appendMessage({
    id: Date.now(),
    type: 'text',
    text: inputText.value,
    sender: 'user',
    time: getTime(),
    status: 'sent'
  });

  inputText.value = '';
};

const insertQuickReply = (template) => {
  inputText.value = inputText.value
    ? `${inputText.value}${inputText.value.endsWith(' ') ? '' : ' '}${template}`
    : template;
};

const toggleQuickReplies = () => {
  quickRepliesCollapsed.value = !quickRepliesCollapsed.value;
};

const sendSticker = (sticker) => {
  appendMessage({
    id: Date.now(),
    type: 'sticker',
    content: sticker.src,
    stickerName: sticker.name,
    sender: 'user',
    time: getTime(),
    status: 'sent'
  });

  showStickers.value = false;
};

const showError = (message) => {
  uploadError.value = message;

  if (uploadErrorTimer) {
    clearTimeout(uploadErrorTimer);
  }

  uploadErrorTimer = window.setTimeout(() => {
    uploadError.value = '';
  }, 3000);
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const openFeedbackModal = () => {
  feedbackSubmitted.value = false;
  showFeedbackModal.value = true;
};

const closeFeedbackModal = () => {
  showFeedbackModal.value = false;
  feedbackSubmitted.value = false;
};

const handleFeedback = (score) => {
  console.log('User Feedback:', score);
  feedbackSubmitted.value = true;

  window.setTimeout(() => {
    closeFeedbackModal();
  }, 1800);
};

const handleFileUpload = (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    showError('檔案超過 5MB 限制');
    event.target.value = '';
    return;
  }

  if (!allowedTypes.includes(file.type)) {
    showError('僅支援圖片、PDF 或 Word 格式');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const isImage = file.type.startsWith('image/');

    appendMessage({
      id: Date.now(),
      type: isImage ? 'image' : 'file',
      content: loadEvent.target?.result,
      fileName: file.name,
      sender: 'user',
      time: getTime(),
      status: 'sent'
    });
  };

  reader.readAsDataURL(file);
  event.target.value = '';
};

watch(
  messages,
  () => {
    scrollToBottom();
    setMessagesReadLater();
  },
  { deep: true }
);

onMounted(() => {
  scrollToBottom();
});

onBeforeUnmount(() => {
  if (uploadErrorTimer) {
    clearTimeout(uploadErrorTimer);
  }

  if (readStatusTimer) {
    clearTimeout(readStatusTimer);
  }
});
</script>

<template>
  <div class="app-shell">
    <div class="fixed-watermark" aria-hidden="true">
      <img :src="withBase('/branding/hsinchu-logo.svg')" alt="" />
    </div>

    <header class="chat-header">
      <button type="button" class="end-chat-button" @click="openFeedbackModal">結束對話</button>
      <h1>{{ title }}</h1>
    </header>

    <section v-if="subtitle" class="route-subtitle">
      <span>{{ subtitle }}</span>
    </section>

    <main class="chat-body">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-row"
        :class="[
          msg.sender === 'user' ? 'message-row-user' : 'message-row-agent',
          msg.sender === 'system' ? 'message-row-system' : ''
        ]"
      >
        <div v-if="msg.sender === 'agent'" class="avatar avatar-agent">
          <img :src="agentAvatar" alt="客服頭像" class="avatar-image avatar-image-agent" />
        </div>

        <div v-if="msg.sender === 'system'" class="system-banner">
          <span>{{ msg.text }}</span>
          <span class="message-time">{{ msg.time }}</span>
        </div>

        <template v-else>
          <div class="message-stack" :class="msg.sender === 'user' ? 'align-end' : 'align-start'">
            <div class="message-line">
              <span v-if="msg.sender === 'user'" class="message-time">{{ msg.time }}</span>

              <div
                class="bubble"
                :class="[
                  msg.sender === 'user' ? 'bubble-user' : 'bubble-agent',
                  msg.type === 'sticker' ? 'bubble-sticker' : ''
                ]"
              >
                <template v-if="msg.type === 'text'">{{ msg.text }}</template>
                <img
                  v-else-if="msg.type === 'sticker'"
                  :src="msg.content"
                  :alt="msg.stickerName || 'sticker'"
                  class="sticker-image"
                />
                <img v-else-if="msg.type === 'image'" :src="msg.content" alt="upload" class="upload-image" />
                <div v-else class="file-card">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ msg.fileName }}</span>
                </div>
              </div>

              <span v-if="msg.sender === 'agent'" class="message-time">{{ msg.time }}</span>
            </div>

            <div
              v-if="msg.sender === 'user'"
              class="message-status"
              :class="msg.status === 'read' ? 'status-read' : 'status-sent'"
            >
              <span>{{ msg.status === 'read' ? '已讀' : '送出' }}</span>
              <span>{{ msg.status === 'read' ? '✓✓' : '✓' }}</span>
            </div>
          </div>

          <div v-if="msg.sender === 'user'" class="avatar avatar-user">
            <svg viewBox="0 0 64 64" aria-hidden="true" class="avatar-image avatar-image-user">
              <circle cx="32" cy="24" r="17" fill="#ffc6bf" />
              <path
                d="M17 20c0-11 7.8-17 15-17s15 6 15 17v5H17Z"
                fill="#8f4a17"
              />
              <path
                d="M23 47c2.8-4.1 7-6.2 9-6.2s6.2 2.1 9 6.2l1.8 12H21.2Z"
                fill="#e9f2f8"
              />
              <path
                d="M18 64c0-8.7 5.8-16 14-16s14 7.3 14 16Z"
                fill="#c9dfef"
              />
              <path d="M29 48h6v16h-6z" fill="#eb4d63" />
              <path d="m32 46 4 5h-8Z" fill="#ffffff" />
              <ellipse cx="25" cy="27" rx="2.2" ry="2.8" fill="#8f4a17" />
              <ellipse cx="39" cy="27" rx="2.2" ry="2.8" fill="#8f4a17" />
              <path
                d="M27 35c3.3 2.2 6.7 2.2 10 0"
                fill="none"
                stroke="#f16374"
                stroke-linecap="round"
                stroke-width="1.4"
              />
              <path
                d="M20.5 26.5c1.3-1.4 2.8-2 4.6-2"
                fill="none"
                stroke="#8f4a17"
                stroke-linecap="round"
                stroke-width="1.6"
              />
              <path
                d="M38.9 24.5c1.8 0 3.3.6 4.6 2"
                fill="none"
                stroke="#8f4a17"
                stroke-linecap="round"
                stroke-width="1.6"
              />
              <path
                d="M31 28.3c-1.1 1.7-1.8 3.1-1.9 4.2.9.6 1.8.9 2.9.9"
                fill="none"
                stroke="#ea8c87"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.2"
              />
              <path d="M13.6 28c-2.2 0-4 1.7-4 3.8 0 2 1.5 3.8 3.4 4.1" fill="#ffc6bf" />
              <path d="M50.4 28c2.2 0 4 1.7 4 3.8 0 2-1.5 3.8-3.4 4.1" fill="#ffc6bf" />
            </svg>
          </div>
        </template>
      </div>

      <div ref="chatEndRef"></div>
    </main>

    <transition name="panel-slide">
      <section v-if="showStickers" class="stickers-panel">
        <div class="stickers-header">
          <span>快捷貼圖</span>
          <button type="button" class="icon-button subtle-button" @click="showStickers = false">✕</button>
        </div>
        <div class="stickers-grid">
          <button
            v-for="sticker in stickers"
            :key="sticker.id"
            type="button"
            class="sticker-button"
            @click="sendSticker(sticker)"
          >
            <img :src="sticker.src" :alt="sticker.name" class="sticker-picker-image" />
          </button>
        </div>
      </section>
    </transition>

    <div v-if="uploadError" class="error-toast">
      <span>⚠</span>
      <span>{{ uploadError }}</span>
    </div>

    <transition name="feedback-fade">
      <div
        v-if="showFeedbackModal"
        class="feedback-overlay"
        @click.self="closeFeedbackModal"
      >
        <div class="feedback-modal">
          <template v-if="!feedbackSubmitted">
            <div class="feedback-title">感謝您的使用</div>
            <div class="feedback-subtitle">請問您對本次通話服務滿意嗎？</div>

            <div class="feedback-actions">
              <button
                type="button"
                class="feedback-option positive"
                @click="handleFeedback('positive')"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" class="feedback-icon">
                  <path
                    d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Zm2 10h7.2a2 2 0 0 0 1.94-1.53l1.46-5.84A2 2 0 0 0 17.66 10H14V6.5A2.5 2.5 0 0 0 11.5 4l-.37.03L9 10.5V20Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.7"
                  />
                </svg>
                <span>滿意</span>
              </button>

              <button
                type="button"
                class="feedback-option negative"
                @click="handleFeedback('negative')"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" class="feedback-icon">
                  <path
                    d="M17 14V4h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3ZM15 4H7.8a2 2 0 0 0-1.94 1.53L4.4 11.37A2 2 0 0 0 6.34 14H10v3.5A2.5 2.5 0 0 0 12.5 20l.37-.03L15 13.5V4Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.7"
                  />
                </svg>
                <span>不滿意</span>
              </button>
            </div>

            <div class="feedback-footer">
              <button type="button" class="feedback-cancel" @click="closeFeedbackModal">返回通話</button>
            </div>
          </template>

          <template v-else>
            <div class="feedback-success">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="feedback-success-icon">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
                <path
                  d="m8.7 12.3 2.2 2.2 4.8-5.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.9"
                />
              </svg>
              <div class="feedback-title">回饋已送出</div>
              <div class="feedback-subtitle">祝您有美好的一天！</div>
            </div>
          </template>
        </div>
      </div>
    </transition>

    <footer class="chat-footer">
      <section v-if="salesMode" class="quick-replies" :class="{ collapsed: quickRepliesCollapsed }">
        <button type="button" class="quick-replies-toggle" @click="toggleQuickReplies">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="quick-replies-toggle-icon"
            :class="{ collapsed: quickRepliesCollapsed }"
          >
            <path
              d="M7 10.5 12 15l5-4.5"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.9"
            />
          </svg>
        </button>
        <div class="quick-replies-header">
          <span>值機員快速回覆模板</span>
          <div class="quick-replies-tools">
            <span>點擊即可快速插入</span>
          </div>
        </div>
        <div v-if="!quickRepliesCollapsed" class="quick-replies-list">
          <button
            v-for="template in quickReplies"
            :key="template"
            type="button"
            class="quick-reply-chip"
            @click="insertQuickReply(template)"
          >
            {{ template }}
          </button>
        </div>
      </section>

      <div class="composer">
        <div class="upload-trigger">
          <button type="button" class="icon-button" aria-label="上傳附件" @click="triggerFileUpload">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="toolbar-icon">
              <path
                d="M8.15 12.85 15.5 5.54a3.35 3.35 0 0 1 4.74 4.74l-8.58 8.57a5.15 5.15 0 1 1-7.28-7.28l8.05-8.04"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.55"
              />
            </svg>
          </button>
          <div class="upload-tooltip">上傳規範：檔案 5MB 內 | 格式：JPG, PNG, PDF, Word</div>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="開啟貼圖"
          :class="{ active: showStickers }"
          @click="showStickers = !showStickers"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" class="toolbar-icon">
            <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" stroke-width="1.7" />
            <circle cx="9" cy="10" r="0.95" fill="currentColor" />
            <circle cx="15" cy="10" r="0.95" fill="currentColor" />
            <path
              d="M8.4 13.6c.96 1.25 2.17 1.88 3.6 1.88s2.64-.63 3.6-1.88"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.7"
            />
          </svg>
        </button>

        <input ref="fileInputRef" type="file" class="hidden-input" @change="handleFileUpload" />

        <div class="input-shell">
          <input
            v-model="inputText"
            type="text"
            :placeholder="salesMode ? '輸入回覆內容或套用模板...' : '請輸入訊息...'"
            @keydown.enter="sendMessage"
          />
        </div>

        <button type="button" class="send-button" :disabled="!canSend" @click="sendMessage">
          ➤
        </button>
      </div>

    </footer>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family:
    "Noto Sans TC",
    "PingFang TC",
    "Microsoft JhengHei",
    sans-serif;
  background: #dcecff;
}

:global(button),
:global(input) {
  font: inherit;
}

:global(#app) {
  min-height: 100vh;
}

.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.75), transparent 22%),
    linear-gradient(180deg, #eef8ff 0%, #dceeff 100%);
  color: #243247;
}

.fixed-watermark {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.fixed-watermark img {
  width: min(48vw, 260px);
  height: auto;
  opacity: 0.14;
  filter:
    brightness(0)
    saturate(100%)
    invert(32%)
    sepia(16%)
    saturate(645%)
    hue-rotate(176deg)
    brightness(95%)
    contrast(88%);
}

.chat-header,
.route-subtitle,
.chat-body,
.chat-footer {
  position: relative;
  z-index: 1;
}

.chat-header {
  flex-shrink: 0;
  padding: 16px 24px 20px;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, #0c5da7 0%, #004f91 100%);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  box-shadow: 0 10px 24px rgba(0, 84, 149, 0.18);
}

.end-chat-button {
  position: absolute;
  top: 50%;
  right: 18px;
  transform: translateY(-50%);
  padding: 8px 14px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.end-chat-button:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) translateY(-1px);
}

.chat-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.route-subtitle {
  padding: 14px 16px 10px;
  color: #7a8ea7;
  font-size: 12px;
  font-weight: 700;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 24px;
}

.message-row {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
  gap: 10px;
}

.message-row-agent {
  justify-content: flex-start;
}

.message-row-user {
  justify-content: flex-end;
}

.message-row-system {
  justify-content: center;
}

.system-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: #5f7188;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #dfebf6;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(36, 50, 71, 0.04);
  font-size: 12px;
  font-weight: 700;
}

.avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 999px;
  font-size: 24px;
  overflow: hidden;
}

.avatar-agent {
  background: #fff;
  border: 1px solid #d8e8f8;
}

.avatar-user {
  align-self: flex-end;
  background: #ffd9c2;
  border: 1px solid #ffd0b1;
}

.avatar-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-image-agent {
  transform: scale(1.08);
}

.avatar-image-user {
  transform: scale(1.04);
}

.message-stack {
  display: flex;
  flex-direction: column;
  max-width: min(80%, 720px);
}

.align-start {
  align-items: flex-start;
}

.align-end {
  align-items: flex-end;
}

.message-line {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-time {
  margin-bottom: 4px;
  color: #97a3b5;
  font-size: 10px;
  line-height: 1;
}

.bubble {
  padding: 12px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.65;
  word-break: break-word;
  box-shadow: 0 6px 18px rgba(36, 50, 71, 0.06);
}

.bubble-agent {
  color: #445266;
  background: rgba(255, 255, 255, 0.96);
  border-bottom-left-radius: 4px;
  border: 1px solid #e3eef9;
}

.bubble-user {
  color: #fff;
  background: linear-gradient(180deg, #2464a6 0%, #1d558f 100%);
  border-bottom-right-radius: 4px;
}

.bubble-sticker {
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.sticker-image {
  display: block;
  width: 112px;
  max-width: min(36vw, 112px);
  height: auto;
}

.upload-image {
  display: block;
  max-width: 100%;
  border-radius: 12px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 18px;
}

.file-name {
  font-size: 12px;
  text-decoration: underline;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  margin-right: 4px;
  font-size: 10px;
  font-weight: 700;
}

.status-read {
  color: #005495;
}

.status-sent {
  color: #b6bec9;
}

.stickers-panel {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #e6edf5;
  box-shadow: 0 -10px 24px rgba(30, 60, 90, 0.05);
}

.stickers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 4px;
}

.stickers-header span {
  color: #97a3b5;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.stickers-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 8px;
}

.sticker-button {
  display: grid;
  place-items: center;
  min-height: 74px;
  padding: 6px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #f8fbfe;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.sticker-button:hover {
  background: #f2f7fc;
  border-color: #dbe7f4;
  box-shadow: 0 10px 18px rgba(48, 79, 115, 0.08);
  transform: translateY(-1px);
}

.sticker-picker-image {
  display: block;
  max-width: 100%;
  max-height: 62px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.error-toast {
  position: absolute;
  right: 16px;
  bottom: 98px;
  left: 16px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  color: #fff;
  background: #e24e4f;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(226, 78, 79, 0.25);
  font-size: 12px;
  font-weight: 700;
}

.feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(16, 24, 40, 0.56);
  backdrop-filter: blur(4px);
}

.feedback-modal {
  width: min(100%, 400px);
  padding: 32px 28px 24px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 22px 48px rgba(20, 34, 54, 0.22);
  text-align: center;
}

.feedback-title {
  color: #1c1c1e;
  font-size: 20px;
  font-weight: 800;
}

.feedback-subtitle {
  margin-top: 8px;
  color: #8e8e93;
  font-size: 15px;
  line-height: 1.6;
}

.feedback-actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 28px;
  margin-bottom: 28px;
}

.feedback-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0;
  color: #d1d1d6;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.feedback-option span {
  font-size: 14px;
  font-weight: 700;
}

.feedback-option.positive:hover {
  color: #34c759;
  transform: translateY(-4px);
}

.feedback-option.negative:hover {
  color: #ff3b30;
  transform: translateY(-4px);
}

.feedback-icon {
  width: 56px;
  height: 56px;
}

.feedback-footer {
  padding-top: 20px;
  border-top: 1px solid #e5e5ea;
}

.feedback-cancel {
  color: #005495;
  background: transparent;
  border: 0;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.feedback-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.feedback-success-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #34c759;
}

.feedback-fade-enter-active,
.feedback-fade-leave-active {
  transition: opacity 0.24s ease;
}

.feedback-fade-enter-active .feedback-modal,
.feedback-fade-leave-active .feedback-modal {
  transition: transform 0.24s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
}

.feedback-fade-enter-from .feedback-modal,
.feedback-fade-leave-to .feedback-modal {
  transform: scale(0.94);
}

.chat-footer {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #edf3f8;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.03);
}

.quick-replies {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(236, 244, 252, 0.95) 0%, rgba(247, 250, 253, 0.95) 100%);
  border: 1px solid #deebf7;
  border-radius: 18px;
  transition: padding 0.18s ease;
  position: relative;
}

.quick-replies.collapsed {
  padding-bottom: 10px;
}

.quick-replies-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: #7290af;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d8e5f2;
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(74, 100, 126, 0.05);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease;
}

.quick-replies-toggle:hover {
  color: #456786;
  border-color: #bdd3ea;
  box-shadow: 0 10px 18px rgba(53, 93, 134, 0.1);
  transform: translateY(-1px);
}

.quick-replies-toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.18s ease;
}

.quick-replies-toggle-icon.collapsed {
  transform: rotate(180deg);
}

.quick-replies-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.quick-replies-header span:first-child {
  color: #3d5e7f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.quick-replies-header span:last-child {
  color: #87a0bc;
  font-size: 11px;
  font-weight: 700;
}

.quick-replies-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 42px;
}

.quick-replies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-reply-chip {
  padding: 9px 12px;
  color: #43607d;
  background: #ffffff;
  border: 1px solid #d8e5f2;
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(74, 100, 126, 0.05);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.quick-reply-chip:hover {
  border-color: #bdd3ea;
  box-shadow: 0 10px 18px rgba(53, 93, 134, 0.1);
  transform: translateY(-1px);
}

.composer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-trigger {
  position: relative;
  display: flex;
  align-items: center;
}

.upload-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: -6px;
  z-index: 12;
  min-width: 250px;
  padding: 8px 10px;
  color: #6f7f93;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #dbe6f3;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(53, 93, 134, 0.12);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.5;
  pointer-events: none;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.upload-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 18px;
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-right: 1px solid #dbe6f3;
  border-bottom: 1px solid #dbe6f3;
  transform: rotate(45deg) translateY(-6px);
}

.upload-trigger:hover .upload-tooltip {
  opacity: 1;
  transform: translateY(0);
}

.icon-button,
.send-button {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.icon-button {
  width: 30px;
  height: 30px;
  padding: 0;
  color: #97a0ad;
}

.toolbar-icon {
  width: 24px;
  height: 24px;
}

.icon-button:hover,
.icon-button.active {
  color: #005495;
}

.subtle-button {
  font-size: 14px;
}

.hidden-input {
  display: none;
}

.input-shell {
  display: flex;
  flex: 1;
  align-items: center;
  min-height: 42px;
  padding: 10px 18px;
  background: #eef2f7;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.input-shell:focus-within {
  background: #fff;
  border-color: #cfe2f4;
}

.input-shell input {
  width: 100%;
  color: #445266;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 14px;
}

.input-shell input::placeholder {
  color: #adb5c0;
}

.send-button {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 24px;
  color: #c4cad3;
}

.send-button:not(:disabled) {
  color: #005495;
  transform: scale(1.08);
}

.send-button:disabled {
  cursor: not-allowed;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .end-chat-button {
    right: 14px;
    padding: 7px 12px;
    font-size: 11px;
  }

  .fixed-watermark img {
    width: min(56vw, 220px);
    opacity: 0.12;
  }

  .chat-header h1 {
    font-size: 22px;
    letter-spacing: 0.08em;
  }

  .message-stack {
    max-width: 84%;
  }

  .stickers-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .quick-replies-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .quick-replies-tools {
    flex-wrap: wrap;
  }
}
</style>
