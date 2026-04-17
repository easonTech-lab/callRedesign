<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '新竹市政府1999文字客服'
  }
});

const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const getTime = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

const categories = [
  {
    id: 'social',
    title: '社會福利諮詢',
    iconSrc: withBase('/category-icons/1-03.png'),
    color: '#2b3440',
    items: ['長照服務申請', '身心障礙補助', '高齡友善設施', '急難救助指引']
  },
  {
    id: 'env',
    title: '環境與交通報修',
    iconSrc: withBase('/category-icons/1-01.png'),
    color: '#2b3440',
    items: ['路燈故障反應', '大型廢棄物清運', '違規停車反應', '公車動態查詢']
  },
  {
    id: 'urban',
    title: '都市發展建設',
    iconSrc: withBase('/category-icons/1-02.png'),
    color: '#2b3440',
    items: ['建築許可查詢', '土地使用分區', '公共工程資訊', '住宅補貼申請']
  },
  {
    id: 'civil',
    title: '民政與公共服務',
    iconSrc: withBase('/category-icons/1-04.png'),
    color: '#2b3440',
    items: ['役政資訊諮詢', '法律諮詢預約', '市政活動報名', '各區公所資訊']
  }
];

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

const agentAvatar = withBase('/stickers/pika-explain.png');
const userAvatar = withBase('/avatars/frame-8.svg');
const promoVideos = [
  {
    id: 'ODCj2sh9RW0',
    title: '桃園觀光形象影片',
    subtitle: 'YouTube 廣告'
  },
  {
    id: 'iBImIc-IeCA',
    title: '推薦影片 2',
    subtitle: 'YouTube 廣告'
  }
];
const inputText = ref('');
const messages = ref([
  {
    id: 1,
    sender: 'agent',
    type: 'intro',
    text:
      '您好！我是小新🍑。很高興能為您提供 1999 市政諮詢服務！\n請問今天有什麼我可以協助您的嗎？您可以點擊選單或直接輸入問題。',
    suggestions: ['育兒津貼申請流程', '道路坑洞通報方式', '近期市民活動資訊'],
    time: getTime(),
    status: 'read'
  }
]);
const isTyping = ref(false);
const showMenu = ref(false);
const showStickers = ref(false);
const showFeedbackModal = ref(false);
const feedbackSubmitted = ref(false);
const hoveredItemId = ref(null);
const uploadError = ref('');
const chatEndRef = ref(null);
const fileInputRef = ref(null);
const chatFooterRef = ref(null);
const chatBodyRef = ref(null);
let aiTimer = null;
let uploadErrorTimer = null;
let readStatusTimer = null;

const canSend = computed(() => inputText.value.trim().length > 0);
const speakingMessageId = ref(null);
const speakingDraft = ref(false);

const responseMap = {
  '育兒津貼申請流程': {
    text:
      '您好，您詢問的「育兒津貼」申請流程，本府依據教育部及衛生福利部相關規範辦理。\n\n### 一、申請資格\n1. **對象：** 育有 0 至未滿 5 歲（入學前）之幼兒。\n2. **條件：** 幼兒需設籍本市，且目前未領取「托育補助」或未就讀「公立、非營利、準公共幼兒園」。\n3. **金額：**\n   - 第一胎：每月 5,000 元。\n   - 第二胎：每月 6,000 元。\n   - 第三胎（含）以上：每月 7,000 元。\n\n### 二、準備資料\n1. **申請書：** 可至各區公所領取或於官網下載。\n2. **身分證明：** 申請人（父母雙方、監護人或代理人）的身分證及印章。\n3. **幼兒身分證明：** 幼兒及申請人的全戶戶口名簿（含詳細記事）或戶籍謄本。\n4. **帳戶影本：** 幼兒或申請人其中一方之郵局存摺影本（若無郵局帳戶，可提供受指定銀行存摺）。\n5. **證明文件：** 如為第二胎、第三胎，需提供相關證明資料（如戶口名簿註記）。\n\n### 三、申辦方式\n- 可採線上申辦或臨櫃送件。\n- 若您要，我也可以直接幫您整理成可送件的檢查清單。',
    suggestions: ['我還想了解更多細節', '查詢相關聯絡窗口', '如何線上申請？']
  },
  '道路坑洞通報方式': {
    text:
      '這類通報建議您補充具體地點、時間與現場照片，方便我們轉請相關單位處理。\n\n### 一、通報重點\n1. 請提供完整地點與可辨識地標。\n2. 若有照片或短影片，會更方便派案。\n3. 若屬道路安全急迫狀況，建議立即撥打 1999。\n\n### 二、後續處理\n- 承辦單位會依案件屬性分派。\n- 若需要，我可以幫您整理成通報格式。',
    suggestions: ['我要填寫通報內容', '查詢處理進度', '需要上傳照片嗎']
  },
  '近期市民活動資訊': {
    text:
      '近期市民活動通常會分成「親子」、「社區」、「文化」與「市政宣導」等類型。\n\n### 一、您可以先查詢\n1. 市府活動公告頁。\n2. 各區公所活動訊息。\n3. 社群與電子報公告。\n\n### 二、常見內容\n- 報名時間、地點與名額。\n- 是否需預先報名。\n- 年齡或身分限制。\n\n若您告訴我想找的活動類型，我可以幫您縮小範圍。',
    suggestions: ['我要找親子活動', '我要找文化活動', '查詢報名方式']
  },
  '我還想了解更多細節': {
    text:
      '可以，我幫您把細節整理得更完整。\n請再補充一項資訊：\n1. 申請人身分\n2. 幼兒年齡\n3. 是否已申請其他補助\n\n補充後我就能幫您對照適用規則。',
    suggestions: ['查詢申請資格', '需要準備哪些文件', '如何線上申請？']
  },
  '查詢相關聯絡窗口': {
    text:
      '若您要查詢承辦窗口，建議優先透過各區公所或市府相關業務單位。\n\n### 建議作法\n1. 先確認案件類型。\n2. 再選擇對應承辦單位。\n3. 若您不確定窗口，我可以幫您整理成「我要問誰」的形式。',
    suggestions: ['查詢承辦窗口', '各區公所資訊', '我要整理聯絡問題']
  },
  '如何線上申請？': {
    text:
      '線上申請通常會需要：\n1. 身分驗證\n2. 基本資料填寫\n3. 上傳證明文件\n4. 送出後等待審核\n\n若您願意，我可以直接幫您整理成「線上申辦檢查表」。',
    suggestions: ['我要申辦檢查表', '需要哪些文件', '查詢申請進度']
  },
  '我要填寫通報內容': {
    text:
      '可，請依下列格式填寫：\n1. 通報地點（含路名或門牌）\n2. 問題類型（坑洞、隆起、破損）\n3. 發現時間\n4. 是否有照片\n\n填完後我可以幫您整理成通報文字。',
    suggestions: ['查詢處理進度', '需要上傳照片嗎', '下一步怎麼做']
  },
  '查詢處理進度': {
    text:
      '案件送出後，會依案件屬性分派到相關單位處理。\n\n### 一、您可以先準備\n1. 案件編號\n2. 通報時間\n3. 通報地點\n\n### 二、查詢方式\n- 透過市府 1999 服務管道查詢。\n- 若有案件編號，查詢速度會更快。',
    suggestions: ['我沒有案件編號', '如何補充資料', '我要再通報一次']
  },
  '需要上傳照片嗎': {
    text:
      '建議上傳。\n照片可以幫助承辦單位更快判斷狀況，尤其是坑洞、障礙物、違停或環境髒亂等案件。\n若現場光線不足，至少提供一張可辨識地點的照片。',
    suggestions: ['我要上傳照片', '要怎麼描述地點', '查詢處理進度']
  },
  '查詢承辦窗口': {
    text:
      '承辦窗口會依您詢問的主題不同而不同。\n若是育兒津貼，通常對應社政或兒少業務；若是路況通報，則由交通或工務相關單位處理。\n我可以先幫您判斷類別。',
    suggestions: ['我想查育兒津貼', '我想查道路通報', '我想查活動報名']
  },
  '活動報名流程': {
    text:
      '活動報名一般會包含：\n1. 看公告內容與報名時間\n2. 填寫報名資料\n3. 確認名額與資格\n4. 收到通知後完成報到\n\n如果您有指定活動名稱，我可以幫您拆解報名步驟。',
    suggestions: ['我要看報名資格', '我要看報名期限', '我要看活動地點']
  },
  '各區公所資訊': {
    text:
      '各區公所通常可協助辦理申請收件、諮詢與部分社福業務。\n若您要找最近的服務窗口，我可以幫您整理成「地址 / 電話 / 可辦事項」三欄格式。',
    suggestions: ['我要最近的區公所', '我要電話聯絡', '我要可辦事項']
  }
};

const scrollToBottom = async () => {
  await nextTick();
  chatEndRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

const playIntroAudio = () => {
  const text = messages.value[0]?.text?.replace(/\n+/g, ' ') || '';
  if (!window.speechSynthesis || !text) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
};

const normalizeSpeechText = (text) =>
  (text ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n+/g, '。')
    .replace(/\s+/g, ' ')
    .trim();

const playMessageAudio = (message) => {
  const speechText =
    message.type === 'intro' ? normalizeSpeechText(message.text) : normalizeSpeechText(message.text || '');

  if (!window.speechSynthesis || !speechText) {
    return;
  }

  if (speakingMessageId.value === message.id && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakingMessageId.value = null;
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'zh-TW';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onstart = () => {
    speakingMessageId.value = message.id;
  };
  utterance.onend = () => {
    if (speakingMessageId.value === message.id) {
      speakingMessageId.value = null;
    }
  };
  utterance.onerror = () => {
    if (speakingMessageId.value === message.id) {
      speakingMessageId.value = null;
    }
  };

  window.speechSynthesis.speak(utterance);
};

const playDraftAudio = () => {
  const speechText = normalizeSpeechText(inputText.value);

  if (!window.speechSynthesis || !speechText) {
    return;
  }

  if (speakingDraft.value && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakingDraft.value = false;
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'zh-TW';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onstart = () => {
    speakingDraft.value = true;
  };
  utterance.onend = () => {
    speakingDraft.value = false;
  };
  utterance.onerror = () => {
    speakingDraft.value = false;
  };

  window.speechSynthesis.speak(utterance);
};

const appendMessage = (message) => {
  messages.value = [...messages.value, message];
  void scrollToBottom();
};

const setReadStatusLater = () => {
  if (readStatusTimer) {
    window.clearTimeout(readStatusTimer);
  }
  readStatusTimer = window.setTimeout(() => {
    messages.value = messages.value.map((message) =>
      message.sender === 'user' && message.status === 'sent'
        ? { ...message, status: 'read' }
        : message
    );
  }, 1800);
};

const buildAiResponse = (prompt) => {
  const normalized = prompt.replace(/\s+/g, '');
  const matchedKey = Object.keys(responseMap).find((key) => normalized.includes(key.replace(/\s+/g, '')));

  if (matchedKey) {
    return responseMap[matchedKey];
  }

  if (/(育兒|津貼|補助|托育|兒少)/.test(normalized)) {
    return responseMap['育兒津貼申請流程'];
  }

  if (/(路燈|道路|交通|停車|公車|清運|坑洞)/.test(normalized)) {
    return responseMap['道路坑洞通報方式'];
  }

  if (/(役政|法律|公所|活動|報名)/.test(normalized)) {
    return responseMap['活動報名流程'];
  }

  return {
    text:
      '我先幫您整理重點：\n請提供更詳細的地點、時間或申辦類型，我就能協助您找到對應的市政服務與下一步。\n\n若您不確定要從哪一項開始，可以直接點選下方分類選單，我會依服務別幫您接續處理。',
    suggestions: ['查詢相關表單', '需要補充哪些資料', '如何線上申請？']
  };
};

const simulateAiResponse = (query) => {
  isTyping.value = true;

  if (aiTimer) {
    window.clearTimeout(aiTimer);
  }

  aiTimer = window.setTimeout(() => {
    const response = buildAiResponse(query);

    appendMessage({
      id: Date.now() + 1,
      sender: 'agent',
      type: 'text',
      text: response.text,
      suggestions: response.suggestions,
      time: getTime(),
      status: 'read'
    });

    isTyping.value = false;
  }, 1000);
};

const scrollToTop = () => {
  chatBodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

const submitText = (rawText) => {
  const trimmed = (rawText ?? '').trim();
  if (!trimmed) {
    return;
  }

  appendMessage({
    id: Date.now(),
    sender: 'user',
    type: 'text',
    text: trimmed,
    time: getTime(),
    status: 'sent'
  });

  inputText.value = '';
  showMenu.value = false;
  showStickers.value = false;
  simulateAiResponse(trimmed);
  setReadStatusLater();
};

const sendMessage = () => {
  if (!canSend.value) {
    return;
  }

  submitText(inputText.value);
};

const sendSuggestedPrompt = (text) => {
  submitText(text);
};

const sendCategoryItem = (text) => {
  submitText(text);
};

const sendSticker = (sticker) => {
  appendMessage({
    id: Date.now(),
    sender: 'user',
    type: 'sticker',
    content: sticker.src,
    stickerName: sticker.name,
    time: getTime(),
    status: 'sent'
  });

  showStickers.value = false;
  setReadStatusLater();
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const showError = (message) => {
  uploadError.value = message;

  if (uploadErrorTimer) {
    window.clearTimeout(uploadErrorTimer);
  }

  uploadErrorTimer = window.setTimeout(() => {
    uploadError.value = '';
  }, 3000);
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
      sender: 'user',
      type: isImage ? 'image' : 'file',
      content: loadEvent.target?.result,
      fileName: file.name,
      time: getTime(),
      status: 'sent'
    });

    setReadStatusLater();
  };

  reader.readAsDataURL(file);
  event.target.value = '';
};

const openFeedbackModal = () => {
  feedbackSubmitted.value = false;
  showFeedbackModal.value = true;
};

const closeFeedbackModal = () => {
  showFeedbackModal.value = false;
  feedbackSubmitted.value = false;
};

const handleFeedback = () => {
  feedbackSubmitted.value = true;
  window.setTimeout(() => {
    closeFeedbackModal();
  }, 1800);
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const handleGlobalKeydown = (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  if (showMenu.value) {
    showMenu.value = false;
  }

  if (showStickers.value) {
    showStickers.value = false;
  }

  if (showFeedbackModal.value) {
    closeFeedbackModal();
  }
};

onMounted(() => {
  void scrollToBottom();
  window.addEventListener('keydown', handleGlobalKeydown, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.speechSynthesis?.cancel?.();

  if (aiTimer) {
    window.clearTimeout(aiTimer);
  }

  if (readStatusTimer) {
    window.clearTimeout(readStatusTimer);
  }

  if (uploadErrorTimer) {
    window.clearTimeout(uploadErrorTimer);
  }
});
</script>

<template>
  <div class="app-shell" :class="{ 'menu-open': showMenu }">
    <header class="chat-header">
      <button type="button" class="end-chat-button" @click="openFeedbackModal">結束對話</button>
      <h1>{{ title }}</h1>
    </header>

    <div class="chat-layout">
      <section class="chat-column">
        <div class="fixed-watermark" aria-hidden="true">
          <img :src="withBase('/branding/hsinchu-logo.svg')" alt="" />
        </div>

        <main ref="chatBodyRef" class="chat-body">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :class="msg.sender === 'user' ? 'message-row-user' : 'message-row-agent'"
          >
            <div v-if="msg.sender === 'agent'" class="avatar avatar-agent">
              <img :src="agentAvatar" alt="客服頭像" class="avatar-image avatar-image-agent" />
            </div>

            <div
              class="message-stack"
              :class="[
                msg.sender === 'user' ? 'align-end' : 'align-start',
                msg.type === 'intro' ? 'intro-stack' : ''
              ]"
            >
              <div class="message-line">
                <span v-if="msg.sender === 'user'" class="message-time">{{ msg.time }}</span>

                <template v-if="msg.type === 'intro'">
                  <div class="intro-panel">
                    <div class="intro-header">
                      <div class="intro-badge">AI 智慧客服助理</div>
                      <button type="button" class="intro-audio-button" aria-label="朗讀介紹" @click="playMessageAudio(msg)">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M11 5.8 7.8 8.5H5.5A1.5 1.5 0 0 0 4 10v4a1.5 1.5 0 0 0 1.5 1.5h2.3L11 18.2V5.8Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M14.8 8.6a4.2 4.2 0 0 1 0 6.8"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                          />
                          <path
                            d="M16.8 6.6a7 7 0 0 1 0 10.8"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <div class="intro-title">您好！我是新竹市政府 1999 客服助理小新。</div>
                    <div class="intro-text">{{ msg.text }}</div>
                    <div class="intro-hero" aria-hidden="true">
                      <svg viewBox="0 0 100 100">
                        <ellipse cx="50" cy="84" rx="20" ry="4" fill="#e2e8f0" opacity="0.6" />
                        <line x1="50" y1="25" x2="50" y2="14" stroke="#6764f0" stroke-width="4" stroke-linecap="round" />
                        <circle cx="50" cy="11" r="4" fill="#6764f0" />
                        <rect x="26" y="24" width="48" height="42" rx="15" fill="#ffffff" stroke="#6764f0" stroke-width="3" />
                        <rect x="34" y="32" width="32" height="20" rx="7" fill="#1f2a52" />
                        <circle cx="43" cy="42" r="3" fill="#53b1cd" />
                        <circle cx="57" cy="42" r="3" fill="#53b1cd" />
                        <circle cx="24" cy="44" r="6" fill="#6764f0" />
                        <circle cx="76" cy="44" r="6" fill="#6764f0" />
                      </svg>
                    </div>
                    <div class="intro-ads" aria-label="推薦影片廣告">
                      <div v-for="video in promoVideos" :key="video.id" class="promo-video-card">
                        <iframe
                          :src="`https://www.youtube.com/embed/${video.id}`"
                          :title="video.title"
                          loading="lazy"
                          referrerpolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowfullscreen
                          class="promo-video-frame"
                        ></iframe>
                        <div class="promo-video-meta">
                          <div class="promo-video-title">{{ video.title }}</div>
                          <div class="promo-video-subtitle">{{ video.subtitle }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <div
                  v-else
                  class="bubble"
                  :class="[
                    msg.sender === 'user' ? 'bubble-user' : 'bubble-agent',
                    msg.type === 'sticker' ? 'bubble-sticker' : ''
                  ]"
                >
                  <template v-if="msg.type === 'text'">
                    <div class="bubble-text">{{ msg.text }}</div>
                  </template>
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

                <button
                  v-if="msg.sender === 'agent' && msg.type === 'text'"
                  type="button"
                  class="message-audio-button"
                  :class="{ active: speakingMessageId === msg.id }"
                  :aria-label="speakingMessageId === msg.id ? '停止朗讀' : '朗讀這則訊息'"
                  @click="playMessageAudio(msg)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M11 5.8 7.8 8.5H5.5A1.5 1.5 0 0 0 4 10v4a1.5 1.5 0 0 0 1.5 1.5h2.3L11 18.2V5.8Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14.8 8.6a4.2 4.2 0 0 1 0 6.8"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <path
                      d="M16.8 6.6a7 7 0 0 1 0 10.8"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>

                <span v-if="msg.sender === 'agent' && msg.type !== 'intro'" class="message-time">{{ msg.time }}</span>
              </div>

              <div v-if="msg.suggestions?.length" class="suggestion-strip">
                <div class="suggestion-caption">
                  <span class="suggestion-caption-icon">✦</span>
                  <span>您也可以試試</span>
                </div>
                <div class="suggestion-list">
                  <button
                    v-for="suggestion in msg.suggestions"
                    :key="suggestion"
                    type="button"
                    class="suggestion-chip"
                    @click="sendSuggestedPrompt(suggestion)"
                  >
                    {{ suggestion }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="msg.sender === 'user'" class="avatar avatar-user">
              <img :src="userAvatar" alt="使用者頭像" class="avatar-image avatar-image-user" />
            </div>
          </div>

          <div v-if="isTyping" class="message-row message-row-agent">
            <div class="avatar avatar-agent">
              <img :src="agentAvatar" alt="客服頭像" class="avatar-image avatar-image-agent" />
            </div>
            <div class="message-stack align-start">
              <div class="message-line">
                <div class="typing-card" aria-label="AI 輸入中">
                  <div class="typing-card-robot" aria-hidden="true">
                    <svg viewBox="0 0 100 100">
                      <ellipse cx="50" cy="84" rx="20" ry="4" fill="#e2e8f0" opacity="0.6" />
                      <line x1="50" y1="25" x2="50" y2="14" stroke="#6764f0" stroke-width="4" stroke-linecap="round" />
                      <circle cx="50" cy="11" r="4" fill="#6764f0" />
                      <rect x="26" y="24" width="48" height="42" rx="15" fill="#ffffff" stroke="#6764f0" stroke-width="3" />
                      <rect x="34" y="32" width="32" height="20" rx="7" fill="#1f2a52" />
                      <circle cx="43" cy="42" r="3" fill="#53b1cd" />
                      <circle cx="57" cy="42" r="3" fill="#53b1cd" />
                      <circle cx="24" cy="44" r="6" fill="#6764f0" />
                      <circle cx="76" cy="44" r="6" fill="#6764f0" />
                    </svg>
                  </div>
                  <div class="typing-card-title">系統查詢中...</div>
                  <div class="typing-card-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
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

        <div v-if="uploadError" class="error-toast" role="alert" aria-live="assertive">
          <span>⚠</span>
          <span>{{ uploadError }}</span>
        </div>

        <footer ref="chatFooterRef" class="chat-footer">
          <div class="composer">
            <button
              type="button"
              class="footer-menu-button"
              :class="{ active: showMenu }"
              :aria-label="showMenu ? '關閉選單' : '開啟選單'"
              @click="toggleMenu"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" class="footer-menu-icon">
                <path d="M5 7h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9" />
                <path d="M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9" />
                <path d="M5 17h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.9" />
              </svg>
            </button>

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

            <label class="sr-only" for="chat-file-upload">選擇要上傳的檔案</label>
            <input
              id="chat-file-upload"
              ref="fileInputRef"
              type="file"
              class="hidden-input"
              @change="handleFileUpload"
            />

            <div class="input-shell">
              <label class="sr-only" for="chat-message-input">輸入訊息內容</label>
              <input
                id="chat-message-input"
                v-model="inputText"
                type="text"
                placeholder="請輸入訊息..."
                aria-describedby="chat-input-hint"
                @keydown.enter="sendMessage"
              />
            </div>

            <button
              type="button"
              class="icon-button draft-audio-button"
              :class="{ active: speakingDraft }"
              :aria-label="speakingDraft ? '停止朗讀輸入內容' : '朗讀輸入內容'"
              :disabled="!inputText.trim()"
              @click="playDraftAudio"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" class="toolbar-icon">
                <path
                  d="M11 5.8 7.8 8.5H5.5A1.5 1.5 0 0 0 4 10v4a1.5 1.5 0 0 0 1.5 1.5h2.3L11 18.2V5.8Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
                <path
                  d="M14.8 8.6a4.2 4.2 0 0 1 0 6.8"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.8"
                />
                <path
                  d="M16.8 6.6a7 7 0 0 1 0 10.8"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.8"
                />
              </svg>
            </button>

            <button
              type="button"
              class="send-button"
              :disabled="!canSend || isTyping"
              aria-label="送出訊息"
              @click="sendMessage"
            >
              ➤
            </button>
          </div>

          <div id="chat-input-hint" class="sr-only">按 Enter 送出訊息</div>
        </footer>
      </section>

      <aside class="quick-rail" aria-label="快速工具">
        <button type="button" class="quick-rail-button" aria-label="開啟分類選單" @click="toggleMenu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.8 5.8h3.6v3.6H4.8zM10.2 5.8h3.6v3.6h-3.6zM15.6 5.8h3.6v3.6h-3.6zM4.8 11.2h3.6v3.6H4.8zM10.2 11.2h3.6v3.6h-3.6zM15.6 11.2h3.6v3.6h-3.6zM4.8 16.6h3.6v3.6H4.8zM10.2 16.6h3.6v3.6h-3.6zM15.6 16.6h3.6v3.6h-3.6z" fill="currentColor" />
          </svg>
        </button>
        <button type="button" class="quick-rail-button" aria-label="回到底部" @click="scrollToBottom">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4.5v14.2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <path
              d="M7.4 14.1 12 18.8l4.6-4.7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </aside>
    </div>

    <transition name="drawer-fade">
      <div v-if="showMenu" class="menu-overlay" @click.self="closeMenu">
        <div class="menu-drawer">
          <button type="button" class="menu-close" aria-label="關閉選單" @click="closeMenu">✕</button>
          <div class="menu-handle" aria-hidden="true"></div>

          <div class="menu-grid">
            <section v-for="category in categories" :key="category.id" class="menu-column">
              <h3 class="menu-category-title" :style="{ color: category.color }">
                <span class="menu-category-icon">
                  <img :src="category.iconSrc" :alt="category.title" />
                </span>
                <span>{{ category.title }}</span>
              </h3>
              <div class="menu-items">
                <button
                  v-for="(item, index) in category.items"
                  :key="`${category.id}-${index}`"
                  type="button"
                  class="menu-item"
                  :class="{ hovered: hoveredItemId === `${category.id}-${index}` }"
                  :style="{
                    backgroundColor: hoveredItemId === `${category.id}-${index}` ? '#f0f0ff' : '#ffffff',
                    borderColor: hoveredItemId === `${category.id}-${index}` ? '#b7b5f4' : '#d7d7fb',
                    color: hoveredItemId === `${category.id}-${index}` ? '#6764f0' : '#2b3440'
                  }"
                  @mouseenter="hoveredItemId = `${category.id}-${index}`"
                  @mouseleave="hoveredItemId = null"
                  @click="sendCategoryItem(item)"
                >
                  <span>{{ item }}</span>
                  <span class="menu-item-arrow">›</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </transition>

    <transition name="feedback-fade">
      <div v-if="showFeedbackModal" class="feedback-overlay">
        <div class="feedback-modal">
          <template v-if="!feedbackSubmitted">
            <div class="feedback-title">請問您對本次服務滿意嗎？</div>
            <div class="feedback-subtitle">您的回饋會幫助我們持續優化 AI 客服體驗。</div>

            <div class="feedback-actions">
              <button type="button" class="feedback-option positive" @click="handleFeedback('positive')">
                <span class="feedback-icon-circle">😊</span>
                <span>滿意</span>
              </button>
              <button type="button" class="feedback-option negative" @click="handleFeedback('negative')">
                <span class="feedback-icon-circle">☹</span>
                <span>不滿意</span>
              </button>
            </div>

            <div class="feedback-footer">
              <button type="button" class="feedback-cancel" @click="closeFeedbackModal">返回對話</button>
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
  </div>
</template>

<style scoped>
:global(:root) {
  --color-primary-400: #6764f0;
  --color-primary-500: #4c44ea;
  --color-primary-50: #eaeafd;
  --color-secondary-100: #e3e7ff;
  --color-secondary-700: #8c89f1;
  --color-secondary-50: #f5f6ff;
  --color-tertiary-700: #3697b4;
  --color-tertiary-500: #53b1cd;
  --color-tertiary-300: #87d2e3;
  --color-tertiary-50: #e7f6fa;
  --color-yellow-500: #f1d046;
  --color-yellow-100: #fbf1c5;
  --color-yellow-50: #fef9e5;
  --color-darkblue-500: #1f2a52;
  --color-darkblue-50: #f1f2f5;
}

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family:
    'Noto Sans TC',
    'PingFang TC',
    'Microsoft JhengHei',
    sans-serif;
  background: linear-gradient(180deg, #eaeafd 0%, #ffffff 100%);
}

:global(button),
:global(input) {
  font: inherit;
}

:global(button:focus-visible),
:global(input:focus-visible) {
  outline: 3px solid rgba(103, 100, 240, 0.35);
  outline-offset: 2px;
}

:global(.sr-only) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

:global(#app) {
  min-height: 100vh;
}

.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.8), transparent 24%),
    linear-gradient(180deg, #eaeafd 0%, #ffffff 100%);
  color: #1f2a52;
}

.chat-header,
.chat-layout,
.chat-footer {
  position: relative;
  z-index: 1;
}

.chat-header {
  flex-shrink: 0;
  padding: 12px 20px 14px;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, #6764f0 0%, #4c44ea 100%);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  box-shadow: 0 10px 24px rgba(76, 68, 234, 0.18);
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
  font-size: 16px;
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
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.chat-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-column {
  flex: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.fixed-watermark {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: var(--chat-footer-height, 0px);
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

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 20px;
  background: transparent;
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
  border: 1px solid #e1e0fb;
}

.avatar-user {
  align-self: flex-end;
  background: #eaeafd;
  border: 1px solid #e1e0fb;
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
  max-width: min(98%, 1500px);
}

.intro-stack {
  width: min(100%, 1600px);
  max-width: none;
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
  color: #5f7188;
  font-size: 16px;
  line-height: 1;
}

.intro-panel {
  position: relative;
  width: 100%;
  min-width: 0;
  padding: 18px 20px 20px;
  border-radius: 24px;
  border: 1px solid #e1e0fb;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(36, 50, 71, 0.06);
}

.intro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.intro-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(103, 100, 240, 0.1);
  color: #6764f0;
  font-size: 16px;
  font-weight: 800;
}

.intro-title {
  margin-top: 12px;
  color: #1f2a52;
  font-size: 20px;
  font-weight: 900;
}

.intro-text {
  margin-top: 8px;
  color: #5f7188;
  font-size: 16px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.intro-hero {
  margin-top: 16px;
  display: grid;
  place-items: center;
  padding: 0;
}

.intro-hero svg {
  width: min(100%, 160px);
  height: auto;
}

.intro-ads {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.promo-video-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  border-radius: 18px;
  border: 1px solid #e1e0fb;
  background: #ffffff;
  text-decoration: none;
  box-shadow: 0 10px 20px rgba(36, 50, 71, 0.06);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  overflow: hidden;
}

.promo-video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(36, 50, 71, 0.1);
}

.promo-video-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  display: block;
}

.promo-video-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.promo-video-meta {
  display: grid;
  gap: 2px;
  padding: 10px 12px 12px;
}

.promo-video-title {
  color: #1f2a52;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.35;
}

.promo-video-subtitle {
  color: #5f7188;
  font-size: 14px;
  font-weight: 700;
}

.intro-audio-button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: #53b1cd;
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(83, 177, 205, 0.24);
}

.intro-audio-button svg {
  width: 22px;
  height: 22px;
}

.message-audio-button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: #53b1cd;
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(83, 177, 205, 0.24);
  transition:
    transform 0.15s ease,
    filter 0.15s ease,
    opacity 0.15s ease;
}

.message-audio-button svg {
  width: 22px;
  height: 22px;
}

.message-audio-button:hover,
.intro-audio-button:hover {
  filter: brightness(1.04);
}

.message-audio-button.active,
.intro-audio-button.active {
  background: #6764f0;
}

.message-audio-button:active,
.intro-audio-button:active {
  transform: translateY(1px) scale(0.98);
}

.bubble {
  padding: 12px 14px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.65;
  word-break: break-word;
  box-shadow: 0 6px 18px rgba(36, 50, 71, 0.06);
}

.bubble-text {
  white-space: pre-wrap;
}

.bubble-agent {
  color: #445266;
  background: #ffffff;
  border-bottom-left-radius: 4px;
  border: 1px solid #e1e0fb;
}

.bubble-user {
  color: #fff;
  background: linear-gradient(180deg, #6764f0 0%, #4c44ea 100%);
  border-bottom-right-radius: 4px;
}

.bubble-sticker {
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
}

.typing-card {
  width: min(100%, 220px);
  padding: 20px 18px 18px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #eef2fb;
  box-shadow: 0 10px 24px rgba(36, 50, 71, 0.06);
  display: grid;
  place-items: center;
  gap: 10px;
}

.typing-card-robot {
  width: 74px;
  height: 74px;
}

.typing-card-robot svg {
  width: 100%;
  height: 100%;
}

.typing-card-title {
  color: #1f2a52;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.typing-card-dots {
  display: flex;
  gap: 6px;
}

.typing-card-dots span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #6764f0;
  animation: typing-dot-float 1.1s infinite ease-in-out;
}

.typing-card-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-card-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(103, 100, 240, 0.82);
  animation: typing-bounce 0.9s infinite ease-in-out;
}

.typing-dot.delay-1 {
  animation-delay: 0.15s;
}

.typing-dot.delay-2 {
  animation-delay: 0.3s;
}

@keyframes typing-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  45% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@keyframes typing-dot-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.suggestion-strip {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.suggestion-caption {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #87a0bc;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.suggestion-caption-icon {
  color: #6764f0;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  padding: 10px 16px;
  color: #2b3440;
  background: #ffffff;
  border: 1.5px solid #d7d7fb;
  border-radius: 999px;
  box-shadow: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.suggestion-chip:hover {
  background: #f0f0ff;
  border-color: #b7b5f4;
  box-shadow: 0 10px 18px rgba(103, 100, 240, 0.1);
  transform: translateY(-1px);
  color: #6764f0;
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
  font-size: 16px;
  text-decoration: underline;
}

.error-toast {
  position: absolute;
  right: 16px;
  bottom: 96px;
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
  font-size: 16px;
  font-weight: 700;
}

.stickers-panel {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #e1e0fb;
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
  font-size: 16px;
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
  background: #f5f6ff;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.sticker-button:hover {
  background: #ffffff;
  border-color: #e1e0fb;
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

.chat-footer {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #e1e0fb;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.03);
}

.composer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-menu-button,
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
    opacity 0.2s ease,
    background 0.2s ease;
}

.footer-menu-button {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ffffff;
  color: #8c89f1;
}

.footer-menu-button.active {
  color: #6764f0;
  transform: rotate(90deg);
}

.footer-menu-icon {
  width: 24px;
  height: 24px;
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
  color: #334155;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #e1e0fb;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(103, 100, 240, 0.12);
  font-size: 16px;
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
  content: '';
  position: absolute;
  top: 100%;
  left: 18px;
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-right: 1px solid #e1e0fb;
  border-bottom: 1px solid #e1e0fb;
  transform: rotate(45deg) translateY(-6px);
}

.upload-trigger:hover .upload-tooltip {
  opacity: 1;
  transform: translateY(0);
}

.icon-button {
  width: 36px;
  height: 36px;
  padding: 0;
  color: #97a0ad;
  border-radius: 999px;
}

.draft-audio-button {
  background: transparent;
  border: 0;
  box-shadow: none;
}

.draft-audio-button:hover,
.draft-audio-button.active {
  color: #6764f0;
  background: transparent;
}

.toolbar-icon {
  width: 26px;
  height: 26px;
}

.icon-button:hover,
.icon-button.active {
  color: #6764f0;
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
  background: #f5f6ff;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.input-shell:focus-within {
  background: #fff;
  border-color: #e1e0fb;
}

.input-shell input {
  width: 100%;
  color: #445266;
  background: transparent;
  border: 0;
  outline: none;
  font-size: 16px;
}

.input-shell input::placeholder {
  color: #6f7f93;
}

.send-button {
  width: 44px;
  height: 44px;
  padding: 0;
  font-size: 24px;
  color: #c4cad3;
}

.send-button:not(:disabled) {
  color: #6764f0;
  transform: scale(1.08);
}

.send-button:disabled {
  cursor: not-allowed;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(3px);
}

.menu-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: min(90vh, 760px);
  padding: 18px 20px 24px;
  border-radius: 28px 28px 0 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -20px 60px rgba(15, 23, 42, 0.16);
  overflow-y: auto;
}

.menu-handle {
  width: 56px;
  height: 6px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #e3e7ff;
}

.menu-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  color: #c1cee0;
  font-size: 24px;
  cursor: pointer;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.menu-column {
  display: grid;
  gap: 12px;
}

.menu-category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #2b3440;
}

.menu-category-icon {
  width: 40px;
  height: 40px;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
}

.menu-category-icon img {
  width: 40px;
  height: 40px;
  display: block;
}

.menu-items {
  display: grid;
  gap: 10px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 54px;
  padding: 12px 18px;
  border: 1.5px solid #d7d7fb;
  border-radius: 16px;
  box-shadow: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  color: #2b3440;
  transition:
    transform 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;
}

.menu-item:hover {
  transform: translateY(-2px);
}

.menu-item.hovered {
  background: #f0f0ff;
  border-color: #b7b5f4;
  color: #6764f0;
}

.menu-item-arrow {
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
  opacity: 0.75;
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
  font-size: 16px;
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
  font-size: 16px;
  font-weight: 700;
}

.feedback-icon-circle {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-size: 28px;
  background: #f5f6ff;
}

.feedback-option.positive:hover {
  color: #34c759;
  transform: translateY(-4px);
}

.feedback-option.negative:hover {
  color: #ff3b30;
  transform: translateY(-4px);
}

.feedback-footer {
  padding-top: 20px;
  border-top: 1px solid #e5e5ea;
}

.feedback-cancel {
  color: #6764f0;
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

.quick-rail {
  position: fixed;
  right: 16px;
  bottom: 94px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 32px rgba(36, 50, 71, 0.12);
  border: 1px solid #eef2fb;
}

.quick-rail-button {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #f5f6ff;
  color: #6764f0;
  cursor: pointer;
}

.quick-rail-button svg {
  width: 22px;
  height: 22px;
}

.feedback-fade-enter-active,
.feedback-fade-leave-active,
.drawer-fade-enter-active,
.drawer-fade-leave-active,
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.24s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to,
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.panel-slide-enter-active .stickers-panel,
.panel-slide-leave-active .stickers-panel {
  transition: transform 0.24s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .chat-header {
    text-align: left;
    padding: 18px 16px 20px;
  }

  .chat-header h1 {
    font-size: 16px;
    letter-spacing: 0.02em;
    margin-left: 8px;
  }

  .end-chat-button {
    right: 14px;
    padding: 7px 12px;
    font-size: 16px;
  }

  .chat-body {
    padding: 10px 12px 18px;
  }

  .message-stack {
    max-width: 88%;
  }

  .intro-panel {
    min-width: 0;
  }

  .quick-rail {
    right: 10px;
    bottom: 86px;
    padding: 8px 6px;
  }

  .quick-rail-button {
    width: 32px;
    height: 32px;
  }

  .menu-drawer {
    padding: 18px 16px 20px;
  }

  .menu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .composer {
    gap: 8px;
  }

  .upload-tooltip {
    min-width: 220px;
  }

  .stickers-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
