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
  },
  customerAi: {
    type: Boolean,
    default: false
  },
  salesCopilot: {
    type: Boolean,
    default: false
  }
});

const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const getTime = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

const buildInitialMessages = () => {
  const cloned = structuredClone(props.initialMessages);
  if (!props.customerAi) {
    return cloned;
  }

  return [
    {
      id: Date.now(),
      type: 'text',
      text: '您好！我是新竹市政府 1999 AI 數位助理。很高興為您服務！',
      sender: 'agent',
      time: getTime(),
      status: 'read',
      showCards: true
    },
    ...cloned
  ];
};

const messages = ref(buildInitialMessages());
const inputText = ref('');
const showStickers = ref(false);
const uploadError = ref('');
const showFeedbackModal = ref(false);
const feedbackSubmitted = ref(false);
const chatEndRef = ref(null);
const fileInputRef = ref(null);
const isAiMode = ref(props.customerAi);
const isTyping = ref(false);
const serviceSliderRef = ref(null);
const serviceTrackRef = ref(null);
const chatFooterRef = ref(null);
const serviceCardWidth = ref(240);
const serviceCanSlide = ref(false);
const serviceIndex = ref(0);
const serviceViewportWidth = ref(0);
const serviceMaxOffset = ref(0);
const copilotMobileOpen = ref(false);
const activeTab = ref('formal');
const copilotVariantIndex = ref(0);
const copilotRefreshTick = ref(0);
const recommendationData = {
  formal: [
    [
      {
        id: 'f1a',
        content:
          '感謝您的通報。關於中正路123號路口之交通設計，本府已錄案辦理。目前已函請交通處工程科儘速派員前往現場會勘，評估改善之可行性。',
        source: '民意案件處理要點 第14條'
      },
      {
        id: 'f2a',
        content:
          '您好，關於您反映的路口設計問題，本處已收到您的寶貴意見。我們將安排專業技師進行現地評估，並依據會勘結果研議優化方案，謝謝您的關心。',
        source: '交通管理標準作業流程'
      },
      {
        id: 'f3a',
        content:
          '敬啟者：有關中正路123號路口之交通安全疑慮，本府交通處已受理。將針對該路段流量與號誌配置進行全面盤查，後續進度將以公文或簡訊正式回覆。',
        source: '公文撰寫參考規範'
      }
    ],
    [
      {
        id: 'f1b',
        content:
          '感謝您的意見回報。針對中正路123號路口之交通設計疑慮，本府已完成受理並交由權責單位研處，將儘速安排現場會勘及評估改善方案。',
        source: '民意案件處理要點 第14條'
      },
      {
        id: 'f2b',
        content:
          '您好，您所反映的路口問題已納入案件辦理。本處將依標準程序派員查勘，並依實際狀況研擬後續調整，感謝您的提醒。',
        source: '交通管理標準作業流程'
      },
      {
        id: 'f3b',
        content:
          '敬復者：中正路123號路口之交通安全案件已列管處理。後續將就車流、號誌與路型進行綜合評估，並以正式方式通知進度。',
        source: '公文撰寫參考規範'
      }
    ],
    [
      {
        id: 'f1c',
        content:
          '感謝通報。本府已就中正路123號路口之交通設計問題立案處理，並已請交通處工程科安排會勘，以確認改善方向。',
        source: '民意案件處理要點 第14條'
      },
      {
        id: 'f2c',
        content:
          '您好，您所反映之路口設計狀況已進入處理流程。我們會先進行現勘，再依結果評估是否需要調整設施或號誌配置。',
        source: '交通管理標準作業流程'
      },
      {
        id: 'f3c',
        content:
          '敬啟者：有關中正路123號路口交通安全疑慮，業已受理。相關單位將針對現場條件進行盤點，並於後續提供正式回覆。',
        source: '公文撰寫參考規範'
      }
    ]
  ],
  friendly: [
    [
      {
        id: 'fr1a',
        content:
          '您好，非常感謝您反映中正路123號路口的狀況，我們非常重視您的用路安全！我已經幫您聯繫交通處的同仁了，他們會儘快去現場看看，請您放心。',
        source: '1999 客服親切對話指南'
      },
      {
        id: 'fr2a',
        content:
          '真的很謝謝您特地來提醒我們！這個路口的設計我們會馬上請專家來評估，希望能讓大家開車騎車更安全。有任何新進度，我都會第一時間告訴您喔！',
        source: '客服感性溝通話術表'
      },
      {
        id: 'fr3a',
        content:
          '看到您反映這個問題，我們也感到非常關心。您的建議對改善新竹交通非常重要，我們會努力處理好的，這段期間經過該路口請一定要注意安全喔！',
        source: '市民滿意度提升指引'
      }
    ],
    [
      {
        id: 'fr1b',
        content:
          '您好，謝謝您提醒我們中正路123號路口的狀況，我們會立刻幫您轉給交通處的同仁處理，也請您放心，我們會持續追蹤。',
        source: '1999 客服親切對話指南'
      },
      {
        id: 'fr2b',
        content:
          '真的很感謝您願意告訴我們這個問題！我們會請專人去看現場狀況，盡快確認怎麼改善比較好，有進度我會再跟您說。',
        source: '客服感性溝通話術表'
      },
      {
        id: 'fr3b',
        content:
          '謝謝您熱心反映，這個路口的安全我們很重視，我們會趕快處理，也請您在改善前經過該路段時多留意安全喔！',
        source: '市民滿意度提升指引'
      }
    ],
    [
      {
        id: 'fr1c',
        content:
          '您好，謝謝您提出這個狀況，我們已經幫您轉給相關同仁了，會盡快去看看中正路123號路口的情形，謝謝您。',
        source: '1999 客服親切對話指南'
      },
      {
        id: 'fr2c',
        content:
          '很感謝您幫忙提醒！我們會安排人員到現場確認，盡力找出最合適的改善方式，後續有消息會第一時間通知您。',
        source: '客服感性溝通話術表'
      },
      {
        id: 'fr3c',
        content:
          '您的建議非常重要，我們會盡快請人處理這個路口問題，改善完成前也提醒您經過時多注意安全。',
        source: '市民滿意度提升指引'
      }
    ]
  ],
  sop: [
    [
      {
        id: 's1a',
        content: '【路口改善SOP】已啟動。階段1：受理報案（完成）；階段2：現地會勘（待辦）；階段3：方案核定。預計於5個工作日內完成初評。',
        source: '交通工程作業手冊 A-02'
      },
      {
        id: 's2a',
        content:
          '案件編號 TC-20260327-001。依據作業準則，本案已轉分辦至「交通工程科」。案件類別：路口幾何改善。預計會勘時間：下週三前。',
        source: '政府資訊公開作業程序'
      },
      {
        id: 's3a',
        content:
          '系統提示：該路口於半年內已有2次類似反映。本案已加註「優先處理」。流程已進入專案追蹤紀錄，客服人員將於每週五更新進度予民眾。',
        source: '異常案件追蹤管理辦法'
      }
    ],
    [
      {
        id: 's1b',
        content:
          '【改善流程】已受理。階段1：案件建立；階段2：現場勘查；階段3：評估改善。預估於5個工作日內完成初步研判。',
        source: '交通工程作業手冊 A-02'
      },
      {
        id: 's2b',
        content:
          '案件編號 TC-20260327-001 已完成分辦，承辦單位為「交通工程科」。案件類型：路口幾何改善；預計會勘時程：下週三前。',
        source: '政府資訊公開作業程序'
      },
      {
        id: 's3b',
        content:
          '系統提示：該路口近期有重複反映紀錄，已標記為優先案件。後續進度將納入追蹤，並按週更新處理狀態。',
        source: '異常案件追蹤管理辦法'
      }
    ],
    [
      {
        id: 's1c',
        content:
          '【SOP處理】目前狀態：已完成受理；待進行現地會勘；後續進入方案核定。預計 5 個工作日內可完成初評。',
        source: '交通工程作業手冊 A-02'
      },
      {
        id: 's2c',
        content:
          '案件編號 TC-20260327-001 已送交交通工程科。類別：路口改善；預計會勘時間為下週三前，請持續留意案件更新。',
        source: '政府資訊公開作業程序'
      },
      {
        id: 's3c',
        content:
          '系統提醒：案件已列入優先追蹤，並依既定流程安排後續查核。每週五更新一次處理進度。',
        source: '異常案件追蹤管理辦法'
      }
    ]
  ],
  short: [
    [
      {
        id: 'sh1a',
        content: '收到，感謝反映。中正路123號路口問題已轉交交通處評估，後續再行通知。',
        source: '精簡回覆範本'
      },
      {
        id: 'sh2a',
        content: '感謝提供資訊，已錄案辦理。將安排現場勘查並依規處置。',
        source: '快速回覆 SOP'
      },
      {
        id: 'sh3a',
        content: '已轉達相關單位，後續進度將由系統主動向您回報，謝謝。',
        source: '系統自動回覆庫'
      }
    ],
    [
      {
        id: 'sh1b',
        content: '收到，這個路口的情況我已幫您轉給交通處評估，之後會再通知您。',
        source: '精簡回覆範本'
      },
      {
        id: 'sh2b',
        content: '謝謝您提供資訊，案件已受理並會安排現場勘查。',
        source: '快速回覆 SOP'
      },
      {
        id: 'sh3b',
        content: '相關單位已收到通報，後續進度會主動回覆您。',
        source: '系統自動回覆庫'
      }
    ],
    [
      {
        id: 'sh1c',
        content: '已收到，問題已轉交相關單位處理，後續會再通知您。',
        source: '精簡回覆範本'
      },
      {
        id: 'sh2c',
        content: '感謝提供資訊，已錄案，會安排勘查並依規處理。',
        source: '快速回覆 SOP'
      },
      {
        id: 'sh3c',
        content: '案件已轉達，後續進度將由系統通知您。',
        source: '系統自動回覆庫'
      }
    ]
  ]
};
const nextSteps = [
  '詢問民眾是否需要簡訊即時回報進度',
  '確認該地點是否有發生過具體碰撞意外',
  '提醒民眾在該路口改善前注意安全'
];
const possibleQuestions = [
  '「大概什麼時候會有人去勘查？」',
  '「如果還是沒改善要怎麼追蹤？」',
  '「那邊的照明燈好像也有問題？」'
];
const copilotSuggestions = computed(() =>
  (recommendationData[activeTab.value][copilotVariantIndex.value % recommendationData[activeTab.value].length] ?? []).map((item) => ({
    ...item,
    refreshStamp: copilotRefreshTick.value
  }))
);
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
const userAvatar = withBase('/avatars/frame-8.svg');
const canSend = computed(() => inputText.value.trim().length > 0);
const quickRepliesCollapsed = ref(false);

const serviceCards = [
  {
    title: '弱勢照顧服務',
    icon: 'pin',
    hero: withBase('/ai-cards/road.png'),
    links: ['長者關懷服務', '身心障礙協助', '急難救助申請']
  },
  {
    title: '都市更新與住宅服務',
    icon: 'pulse',
    hero: withBase('/ai-cards/hygiene.png'),
    links: ['交屋 / 入住相關申請', '住宅補助申請', '都更 / 社宅資訊']
  },
  {
    title: '福利補助',
    icon: 'doc',
    hero: withBase('/ai-cards/welfare.png'),
    links: ['育兒津貼', '高齡友善服務', '急難救助']
  }
];

const commonLinks = [
  { id: 'mailbox', label: '市長信箱', icon: 'user' },
  { id: 'news', label: '市政新聞', icon: 'doc' },
  { id: 'road', label: '路況資訊', icon: 'pin' },
  { id: 'list', label: '便民清單', icon: 'pulse' }
];

const hotQuestions = [
  '如何申請租屋補助？',
  '垃圾清運時間表查詢',
  '育兒津貼請領細節',
  '汽機車位線上申辦',
  '近期市政活動一覽'
];

const lastUserMessage = computed(() =>
  [...messages.value].reverse().find((message) => message.sender === 'user' && message.type === 'text')
);

const copilotQuality = computed(() => {
  if (!props.salesCopilot) {
    return null;
  }

  const isAnxious = true;

  return {
    moodLabel: '焦慮 / 抱怨',
    moodTone: 'warning',
    compliance: 88,
    hint: isAnxious
      ? '民眾多次提及「危險」，建議在回覆中加入安撫情緒的措辭並強調「優先處理」。'
      : '建議在回覆中補充處理時程與聯絡方式，提高對話完整度。'
  };
});

const scrollToBottom = async () => {
  await nextTick();
  chatEndRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

const updateServiceMetrics = () => {
  if (!props.customerAi) {
    return;
  }

  const sliderEl = Array.isArray(serviceSliderRef.value) ? serviceSliderRef.value[0] : serviceSliderRef.value;
  const trackEl = Array.isArray(serviceTrackRef.value) ? serviceTrackRef.value[0] : serviceTrackRef.value;
  if (!sliderEl || !trackEl) {
    return;
  }

  const firstCard = trackEl.querySelector?.('.ai-card');
  const measuredCardWidth = firstCard?.getBoundingClientRect?.().width;
  if (measuredCardWidth) {
    serviceCardWidth.value = Math.round(measuredCardWidth);
  }

  const gap = 14;
  const totalWidth =
    serviceCardWidth.value * serviceCards.length + gap * Math.max(0, serviceCards.length - 1);
  const viewportWidth = sliderEl.getBoundingClientRect().width;
  serviceViewportWidth.value = viewportWidth;
  serviceMaxOffset.value = Math.max(0, totalWidth - viewportWidth);

  serviceCanSlide.value = totalWidth > viewportWidth + 1;

  if (!serviceCanSlide.value) {
    serviceIndex.value = 0;
  } else {
    serviceIndex.value = Math.max(0, Math.min(serviceCards.length - 1, serviceIndex.value));
  }
};

const serviceCurrentOffset = computed(() => {
  if (!serviceCanSlide.value) {
    return 0;
  }

  const gap = 14;
  const step = serviceCardWidth.value + gap;
  const raw = step * serviceIndex.value;
  return Math.min(raw, serviceMaxOffset.value);
});

const serviceTransformStyle = computed(() => {
  if (!serviceCanSlide.value) {
    return { transform: 'translateX(0px)' };
  }

  return { transform: `translateX(-${serviceCurrentOffset.value}px)` };
});

const canScrollServicePrev = computed(() => serviceCanSlide.value && serviceCurrentOffset.value > 1);
const canScrollServiceNext = computed(
  () => serviceCanSlide.value && serviceCurrentOffset.value < serviceMaxOffset.value - 1
);

const scrollServiceCards = (direction) => {
  if (!serviceCanSlide.value) {
    return;
  }

  if (direction < 0 && canScrollServicePrev.value) {
    serviceIndex.value = Math.max(0, serviceIndex.value - 1);
    return;
  }

  if (direction > 0 && canScrollServiceNext.value) {
    serviceIndex.value = Math.min(serviceCards.length - 1, serviceIndex.value + 1);
  }
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

const simulateAiResponse = (query) => {
  if (!props.customerAi || !isAiMode.value) {
    return;
  }

  isTyping.value = true;
  window.setTimeout(() => {
    let responseText = '了解，您的需求已記錄。請問還有什麼我可以幫您的嗎？';

    if (query.includes('真人') || query.includes('轉接')) {
      responseText = '正在為您轉接真人客服，請稍候...';
      isAiMode.value = false;
    } else if (query.includes('道路')) {
      responseText =
        '關於道路報修問題，您可以提供具體路段地址，或點選「道路報修」相關項目進行線上通報。';
    }

    appendMessage({
      id: Date.now() + 1,
      type: 'text',
      text: responseText,
      sender: 'agent',
      time: getTime(),
      status: 'read'
    });

    isTyping.value = false;
  }, 900);
};

const sendText = (text) => {
  const trimmed = text?.trim();
  if (!trimmed) {
    return;
  }

  appendMessage({
    id: Date.now(),
    type: 'text',
    text: trimmed,
    sender: 'user',
    time: getTime(),
    status: 'sent'
  });

  if (props.customerAi && isAiMode.value) {
    simulateAiResponse(trimmed);
  }
};

const sendMessage = () => {
  if (!canSend.value) {
    return;
  }

  const payload = inputText.value;
  inputText.value = '';
  sendText(payload);
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

const switchToHuman = () => {
  sendText('我想轉接真人客服');
};

const applyCopilotSuggestion = (text) => {
  inputText.value = typeof text === 'string' ? text : text?.content || '';
};

const regenerateCopilotSuggestions = () => {
  const variants = recommendationData[activeTab.value] ?? [];
  if (variants.length > 0) {
    copilotVariantIndex.value = (copilotVariantIndex.value + 1) % variants.length;
  }
  copilotRefreshTick.value += 1;
};

const simulateCopilotUserMessage = () => {
  appendMessage({
    id: Date.now(),
    type: 'text',
    text: '請問會勘大概要多久？因為那邊真的很危險。',
    sender: 'user',
    time: getTime(),
    status: 'read'
  });
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

const handleGlobalKeydown = (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  if (copilotMobileOpen.value) {
    copilotMobileOpen.value = false;
  }

  if (showFeedbackModal.value) {
    closeFeedbackModal();
  }

  if (showStickers.value) {
    showStickers.value = false;
  }
};

let copilotFooterResizeObserver = null;

watch(
  messages,
  () => {
    scrollToBottom();
    setMessagesReadLater();
    if (props.customerAi) {
      nextTick(() => updateServiceMetrics());
    }
  },
  { deep: true }
);

watch(isTyping, (typing) => {
  if (props.customerAi && typing) {
    scrollToBottom();
  }
});

onMounted(() => {
  scrollToBottom();
  if (props.customerAi) {
    nextTick(() => updateServiceMetrics());
    window.addEventListener('resize', updateServiceMetrics, { passive: true });
  }

  window.addEventListener('keydown', handleGlobalKeydown, { passive: true });

  nextTick(() => {
    const footerEl = Array.isArray(chatFooterRef.value) ? chatFooterRef.value[0] : chatFooterRef.value;
    if (!footerEl || typeof ResizeObserver === 'undefined') {
      return;
    }

    const rootEl = footerEl.closest('.app-shell');
    if (!rootEl) {
      return;
    }

    const updateFooterHeight = () => {
      const height = Math.round(footerEl.getBoundingClientRect().height);
      rootEl.style.setProperty('--chat-footer-height', `${height}px`);
    };

    updateFooterHeight();
    copilotFooterResizeObserver = new ResizeObserver(updateFooterHeight);
    copilotFooterResizeObserver.observe(footerEl);
  });
});

onBeforeUnmount(() => {
  if (uploadErrorTimer) {
    clearTimeout(uploadErrorTimer);
  }

  if (readStatusTimer) {
    clearTimeout(readStatusTimer);
  }

  window.removeEventListener('resize', updateServiceMetrics);
  window.removeEventListener('keydown', handleGlobalKeydown);

  if (copilotFooterResizeObserver) {
    copilotFooterResizeObserver.disconnect();
    copilotFooterResizeObserver = null;
  }
});
</script>

<template>
  <div class="app-shell" :class="{ 'copilot-mobile-open': copilotMobileOpen }">
    <header class="chat-header">
      <button type="button" class="end-chat-button" @click="openFeedbackModal">結束對話</button>
      <h1>{{ title }}</h1>
    </header>

    <section v-if="subtitle" class="route-subtitle">
      <span>{{ subtitle }}</span>
    </section>

    <div class="chat-layout">
      <section class="chat-column">
        <div class="fixed-watermark" aria-hidden="true">
          <img :src="withBase('/branding/hsinchu-logo.svg')" alt="" />
        </div>

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
                v-if="props.customerAi && msg.showCards"
                ref="serviceSliderRef"
                class="ai-service-slider"
                aria-label="AI 常見服務"
              >
                <button
                  type="button"
                  class="ai-slider-button prev"
                  aria-label="上一個"
                  :disabled="!canScrollServicePrev"
                  @click="scrollServiceCards(-1)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M14.5 6.8 8.9 12l5.6 5.2"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <div class="ai-service-viewport">
                  <div ref="serviceTrackRef" class="ai-service-track" :style="serviceTransformStyle">
                    <div v-for="card in serviceCards" :key="card.title" class="ai-card">
                      <div class="ai-card-hero" aria-hidden="true">
                        <img v-if="card.hero" :src="card.hero" :alt="card.title" class="ai-card-hero-image" />
                        <div v-else class="ai-card-hero-fallback" :data-icon="card.icon">
                          <div class="ai-card-hero-icon">
                            <svg v-if="card.icon === 'pin'" viewBox="0 0 24 24">
                              <path
                                d="M12 21s7-4.3 7-10.1A7 7 0 0 0 5 10.9C5 16.7 12 21 12 21Z"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linejoin="round"
                              />
                              <circle cx="12" cy="10.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8" />
                            </svg>
                            <svg v-else-if="card.icon === 'pulse'" viewBox="0 0 24 24">
                              <path
                                d="M3.5 12h4l2-5.2 4.1 12.4 2.3-7.2h4.6"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.9"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            <svg v-else viewBox="0 0 24 24">
                              <path
                                d="M7 3.8h7.8L19 8v12.2a1.8 1.8 0 0 1-1.8 1.8H7a2 2 0 0 1-2-2V5.8a2 2 0 0 1 2-2Z"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M14.8 3.8V8H19"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                          <div class="ai-card-hero-title">{{ card.title }}</div>
                        </div>
                      </div>

                      <div class="ai-card-titlebar">{{ card.title }}</div>
                      <div class="ai-card-links">
                        <button
                          v-for="link in card.links"
                          :key="link"
                          type="button"
                          class="ai-card-link"
                          @click="sendText(link)"
                        >
                          <span>{{ link }}</span>
                          <svg viewBox="0 0 24 24" aria-hidden="true" class="ai-card-chevron">
                            <path
                              d="M9 6.8 14.6 12 9 17.2"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2.2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="ai-slider-button next"
                  aria-label="下一個"
                  :disabled="!canScrollServiceNext"
                  @click="scrollServiceCards(1)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M9.5 6.8 15.1 12l-5.6 5.2"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
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
              <img :src="userAvatar" alt="使用者頭像" class="avatar-image avatar-image-user" />
            </div>
          </template>
        </div>

        <div v-if="props.customerAi && isTyping" class="message-row message-row-agent">
          <div class="avatar avatar-agent">
            <img :src="agentAvatar" alt="客服頭像" class="avatar-image avatar-image-agent" />
          </div>
          <div class="message-stack align-start">
            <div class="message-line">
              <div class="bubble bubble-agent typing-bubble" aria-label="AI 輸入中">
                <span class="typing-dot"></span>
                <span class="typing-dot delay-1"></span>
                <span class="typing-dot delay-2"></span>
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

        <footer ref="chatFooterRef" class="chat-footer" :class="{ 'sales-footer': salesMode }">
          <section v-if="salesMode" class="quick-replies" :class="{ collapsed: quickRepliesCollapsed }">
            <div class="quick-replies-header">
              <span>值機員快速回覆模板</span>
              <div class="quick-replies-right">
                <div class="quick-replies-tools">
                  <span
                    class="quick-replies-note"
                    style="color: #5f7188; font-size: 13px; font-weight: 400; letter-spacing: 0; opacity: 0.92;"
                  >
                    點擊即可快速插入
                  </span>
                </div>
                <button
                  type="button"
                  class="quick-replies-toggle"
                  :aria-label="quickRepliesCollapsed ? '展開快速回覆模板' : '收合快速回覆模板'"
                  @click="toggleQuickReplies"
                >
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
                :placeholder="salesMode ? '輸入回覆內容或套用模板...' : '請輸入訊息...'"
                aria-describedby="chat-input-hint"
                @keydown.enter="sendMessage"
              />
            </div>

            <button
              type="button"
              class="send-button"
              :disabled="!canSend"
              aria-label="送出訊息"
              @click="sendMessage"
            >
              ➤
            </button>
          </div>

          <div id="chat-input-hint" class="sr-only">按 Enter 送出訊息</div>
        </footer>
      </section>

      <aside v-if="props.customerAi" class="chat-sidebar">
        <div class="sidebar-scroll">
          <section v-if="isAiMode" class="sidebar-human-card">
            <div class="human-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M4.5 12a7.5 7.5 0 0 1 15 0v6a2.2 2.2 0 0 1-2.2 2.2H15.6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 18.4H6.7A2.2 2.2 0 0 1 4.5 16.2v-1.6A2.2 2.2 0 0 1 6.7 12.4H8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M20 18.4h-1.3a2.2 2.2 0 0 1-2.2-2.2v-1.6a2.2 2.2 0 0 1 2.2-2.2H20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="human-title">需要專家協助？</div>
            <div class="human-desc">若 AI 助理無法解決您的問題，可立即轉由專業人員接手。</div>
            <button type="button" class="human-button" @click="switchToHuman">切換真人文字客服</button>
          </section>

          <section class="sidebar-section">
            <div class="sidebar-section-title">
              <span class="section-bar" aria-hidden="true"></span>
              <span>常用連結</span>
            </div>
            <div class="common-links">
              <button
                v-for="item in commonLinks"
                :key="item.id"
                type="button"
                class="common-link"
                @click="sendText(item.label)"
              >
                <div class="common-link-icon" :data-icon="item.icon" aria-hidden="true">
                  <svg v-if="item.icon === 'user'" viewBox="0 0 24 24">
                    <path
                      d="M12 12.2a4.2 4.2 0 1 0-4.2-4.2 4.2 4.2 0 0 0 4.2 4.2Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                    <path
                      d="M4.6 20a7.4 7.4 0 0 1 14.8 0"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg v-else-if="item.icon === 'pin'" viewBox="0 0 24 24">
                    <path
                      d="M12 21s7-4.3 7-10.1A7 7 0 0 0 5 10.9C5 16.7 12 21 12 21Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <circle cx="12" cy="10.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8" />
                  </svg>
                  <svg v-else-if="item.icon === 'pulse'" viewBox="0 0 24 24">
                    <path
                      d="M3.5 12h4l2-5.2 4.1 12.4 2.3-7.2h4.6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24">
                    <path
                      d="M7 3.8h7.8L19 8v12.2a1.8 1.8 0 0 1-1.8 1.8H7a2 2 0 0 1-2-2V5.8a2 2 0 0 1 2-2Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14.8 3.8V8H19"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div class="common-link-label">{{ item.label }}</div>
              </button>
            </div>
          </section>

          <section class="sidebar-section">
            <div class="sidebar-section-title">
              <span class="section-bar" aria-hidden="true"></span>
              <span>熱門問答</span>
            </div>
            <div class="hot-list">
              <button
                v-for="q in hotQuestions"
                :key="q"
                type="button"
                class="hot-item"
                @click="sendText(q)"
              >
                <span class="hot-dot" aria-hidden="true"></span>
                <span>{{ q }}</span>
              </button>
            </div>
          </section>

          <section class="hotline-card" aria-label="話務諮詢專線">
            <div class="hotline-head">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="hotline-icon">
                <path
                  d="M7.2 3.6h2.2c.7 0 1.2.5 1.3 1.1l.4 2.6c.1.6-.2 1.2-.7 1.5l-1.5.9c.9 1.8 2.4 3.3 4.2 4.2l.9-1.5c.3-.5.9-.8 1.5-.7l2.6.4c.6.1 1.1.6 1.1 1.3v2.2c0 .8-.6 1.4-1.3 1.5-8.2.9-14.7-5.6-13.8-13.8.1-.7.7-1.3 1.5-1.3Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>話務諮詢專線</span>
            </div>
            <div class="hotline-number">請撥 1999</div>
            <div class="hotline-sub">外縣市請撥：03-5216121</div>
          </section>
        </div>
      </aside>

      <aside v-if="props.salesCopilot" class="copilot-sidebar">
        <div class="copilot-header">
          <div class="copilot-title">
            <div class="copilot-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M9 2.8h6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 2.8v2.1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
                <path
                  d="M6.4 7.7h11.2a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2H6.4A2.2 2.2 0 0 1 4.2 17V9.9a2.2 2.2 0 0 1 2.2-2.2Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.2 12.2h.01M14.8 12.2h.01"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
                <path
                  d="M9.2 15.4h5.6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <span>AI 智能領航員</span>
          </div>
          <button
            type="button"
            class="copilot-close"
            aria-label="關閉 AI 面板"
            @click="copilotMobileOpen = false"
          >
            ✕
          </button>
        </div>

        <div class="copilot-body">
          <section class="copilot-section">
            <div class="copilot-tab-shell">
              <div class="copilot-tab-header">
                <h3 class="copilot-tab-title">
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="copilot-tab-icon">
                    <path d="M12 3.5 13.8 9.2 19.5 11 13.8 12.8 12 18.5 10.2 12.8 4.5 11 10.2 9.2Z" fill="currentColor" />
                  </svg>
                  <span>推薦類別切換</span>
                </h3>
              </div>

              <div class="copilot-tabs">
                <button
                  v-for="tab in [
                    { id: 'formal', label: '正式版' },
                    { id: 'friendly', label: '親切版' },
                    { id: 'sop', label: 'SOP版' },
                    { id: 'short', label: '簡短版' }
                  ]"
                  :key="tab.id"
                  type="button"
                  class="copilot-tab"
                  :class="{ active: activeTab === tab.id }"
                  @click="activeTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <div class="copilot-recommendation-head">
              <span class="copilot-recommendation-count">AI 推薦選項 ({{ copilotSuggestions.length }})</span>
              <button type="button" class="copilot-refresh" @click="regenerateCopilotSuggestions">重新生成</button>
            </div>

            <div class="copilot-recommendation-list">
              <article
                v-for="(item, idx) in copilotSuggestions"
                :key="`${item.id}-${item.refreshStamp}`"
                class="copilot-recommendation-card"
              >
                <div class="copilot-recommendation-card-head">
                  <span
                    class="copilot-chip-index"
                    :class="[
                      idx === 0 ? 'primary' : '',
                      idx === 1 ? 'tertiary' : '',
                      idx === 2 ? 'yellow' : ''
                    ]"
                  >
                    選項 {{ idx + 1 }}
                  </span>
                </div>
                <p class="copilot-recommendation-text">{{ item.content }}</p>
                <button type="button" class="copilot-use-button" @click="applyCopilotSuggestion(item.content)">
                  採用此版本
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="copilot-use-icon">
                    <path
                      d="m9 6 6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.9"
                    />
                  </svg>
                </button>
              </article>
            </div>
          </section>

          <section class="copilot-section">
            <div class="copilot-section-title spaced">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="copilot-section-icon-lucide yellow">
                <path d="M13 2.5 6.8 13h4.3L10.2 21.5 17.2 10H13Z" fill="currentColor" />
              </svg>
              <span>下一步建議</span>
            </div>
            <div class="copilot-step-panel">
              <button v-for="(step, index) in nextSteps" :key="step" type="button" class="copilot-step-item">
                <span class="copilot-step-number">{{ index + 1 }}</span>
                <span class="copilot-step-text">{{ step }}</span>
              </button>
            </div>
          </section>
        </div>

        <div class="copilot-footer">
          <div class="copilot-footer-left">AI 引擎：Gemini-2.5-Flash</div>
          <div class="copilot-footer-right">
            <span class="copilot-status-dot" aria-hidden="true"></span>
            <span>連線正常</span>
          </div>
        </div>
      </aside>
    </div>

    <div
      v-if="props.salesCopilot"
      v-show="copilotMobileOpen"
      class="copilot-overlay"
      aria-hidden="true"
      @click="copilotMobileOpen = false"
    ></div>

    <button
      v-if="props.salesCopilot"
      type="button"
      class="copilot-fab"
      :class="{ hidden: copilotMobileOpen }"
      aria-label="開啟 AI 智能領航員"
      @click="copilotMobileOpen = true"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 2.8h6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 2.8v2.1"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        />
        <path
          d="M6.4 7.7h11.2a2.2 2.2 0 0 1 2.2 2.2v7.1a2.2 2.2 0 0 1-2.2 2.2H6.4A2.2 2.2 0 0 1 4.2 17V9.9a2.2 2.2 0 0 1 2.2-2.2Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linejoin="round"
        />
        <path
          d="M9.2 12.2h.01M14.8 12.2h.01"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        />
        <path
          d="M9.2 15.4h5.6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        />
      </svg>
    </button>

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
  </div>
</template>

<style scoped>
:global(:root) {
  --color-primary-400: #6764f0;
  --color-primary-500: #4c44ea;
  --color-primary-50: #eaeafd;

  --color-secondary-100: #e3e7ff;
  --color-secondary-900: #8c89f1;
  --color-secondary-700: #9796ff;
  --color-secondary-600: #a0a1ff;
  --color-secondary-500: #c8c9f1;
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

  /* Backwards-compatible aliases used by the current page styles. */
  --primary-400-p: var(--color-primary-400);
  --primary-500-p: var(--color-primary-500);
  --primary-50-p: var(--color-primary-50);
  --primary-100-p: var(--color-secondary-50);
  --primary-200-p: var(--color-secondary-100);
  --primary-300-p: var(--color-secondary-600);
  --primary-rgb-p: 103, 100, 240;

  --secondary-100-p: var(--color-secondary-100);
  --secondary-900-p: var(--color-secondary-900);
  --secondary-700-p: var(--color-secondary-700);
  --secondary-600-p: var(--color-secondary-600);
  --secondary-500-p: var(--color-secondary-500);
  --secondary-50-p: var(--color-secondary-50);

  --tertiary-700-p: var(--color-tertiary-700);
  --tertiary-500-p: var(--color-tertiary-500);
  --tertiary-300-p: var(--color-tertiary-300);
  --tertiary-50-p: var(--color-tertiary-50);

  --yellow-500-p: var(--color-yellow-500);
  --yellow-100-p: var(--color-yellow-100);
  --yellow-50-p: var(--color-yellow-50);

  --darkblue-500-p: var(--color-darkblue-500);
  --darkblue-50-p: var(--color-darkblue-50);
}

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
  background: linear-gradient(180deg, #eaeafd 0%, #ffffff 100%);
}

:global(button),
:global(input) {
  font: inherit;
}

:global(button:focus-visible),
:global(input:focus-visible) {
  outline: 3px solid rgba(var(--primary-rgb-p), 0.35);
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
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.82), transparent 24%),
    linear-gradient(180deg, #eaeafd 0%, #ffffff 100%);
  color: #243247;
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

.chat-header,
.route-subtitle,
.chat-body,
.chat-footer {
  position: relative;
  z-index: 1;
}

.chat-header {
  flex-shrink: 0;
  padding: 12px 20px 14px;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, var(--primary-400-p) 0%, var(--primary-500-p) 100%);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  box-shadow: 0 10px 24px rgba(var(--primary-rgb-p), 0.18);
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

.route-subtitle {
  padding: 10px 16px 8px;
  color: #445266;
  font-size: 16px;
  font-weight: 700;
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
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 24px;
}

.chat-sidebar {
  display: none;
  width: 380px;
  flex-shrink: 0;
  border-left: 1px solid var(--primary-200-p);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
}

@media (min-width: 1024px) {
  .chat-sidebar {
    display: block;
  }
}

.copilot-sidebar {
  display: none;
  width: 520px;
  flex-shrink: 0;
  border-left: 1px solid var(--primary-200-p);
  background: rgba(255, 255, 255, 0.96);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
}

@media (min-width: 1024px) {
  .copilot-sidebar {
    display: flex;
    flex-direction: column;
  }
}

.copilot-overlay {
  display: none;
}

.copilot-close {
  display: none;
}

.copilot-fab {
  display: none;
}

@media (max-width: 1023px) {
  .copilot-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(16, 24, 40, 0.2);
    backdrop-filter: blur(2px);
  }

  .copilot-sidebar {
    display: flex;
    flex-direction: column;
    position: fixed;
    z-index: 90;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(92vw, 420px);
    border-radius: 18px 0 0 18px;
    border: 1px solid var(--primary-200-p);
    box-shadow: 0 24px 50px rgba(20, 34, 54, 0.18);
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.22s ease,
      opacity 0.22s ease;
  }

  .app-shell.copilot-mobile-open .copilot-sidebar {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }

  .app-shell:not(.copilot-mobile-open) .copilot-overlay {
    display: none;
  }

  .copilot-close {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    background: transparent;
    color: rgba(95, 113, 136, 0.95);
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
  }

  .copilot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: calc(14px + env(safe-area-inset-top));
  }

  .copilot-fab {
    display: grid;
    place-items: center;
    position: fixed;
    z-index: 70;
    right: 16px;
    bottom: calc(16px + var(--chat-footer-height, 180px) + env(safe-area-inset-bottom));
    width: 56px;
    height: 56px;
    border-radius: 18px;
    border: 1px solid rgba(255, 193, 143, 0.9);
    background: rgba(255, 246, 238, 0.95);
    color: #ff7a1a;
    cursor: pointer;
    padding: 0;
  }

  .copilot-fab:hover {
    background: rgba(255, 242, 231, 1);
    box-shadow: 0 18px 40px rgba(255, 122, 26, 0.22);
  }

  .copilot-fab:active {
    transform: translateY(1px);
  }

  .copilot-fab.hidden {
    display: none;
  }

  .copilot-fab svg {
    width: 26px;
    height: 26px;
  }
}

.copilot-header {
  padding: 16px 16px 14px;
  border-bottom: 1px solid var(--primary-200-p);
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.copilot-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 1000;
  color: #2b3d56;
  font-size: 18px;
  min-width: 0;
  white-space: nowrap;
}

.copilot-badge {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: rgba(var(--primary-rgb-p), 0.14);
  color: var(--primary-400-p);
  display: grid;
  place-items: center;
  border: 1px solid var(--primary-200-p);
}

.copilot-badge svg {
  width: 18px;
  height: 18px;
}

.copilot-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.copilot-tab-shell {
  margin-bottom: 18px;
  display: grid;
  gap: 12px;
}

.copilot-tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.copilot-tab-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #2b3d56;
  font-size: 18px;
  font-weight: 900;
}

.copilot-tab-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-400-p);
  flex-shrink: 0;
}

.copilot-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  border-radius: 22px;
  background: rgba(243, 245, 250, 0.82);
  border: 1px solid rgba(223, 227, 239, 0.95);
}

.copilot-tab {
  flex: 1;
  border: 0;
  padding: 12px 14px;
  border-radius: 16px;
  background: transparent;
  color: #8a97a9;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.copilot-tab.active {
  background: #ffffff;
  color: var(--primary-400-p);
  box-shadow: 0 10px 20px rgba(103, 100, 240, 0.16);
  transform: translateY(-1px);
}

.copilot-recommendation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.copilot-recommendation-count {
  color: #6d7d92;
  font-size: 14px;
  font-weight: 800;
}

.copilot-refresh {
  border: 0;
  background: transparent;
  color: var(--primary-400-p);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.copilot-recommendation-list {
  display: grid;
  gap: 14px;
}

.copilot-recommendation-card {
  position: relative;
  padding: 18px;
  border: 1px solid #e1e0fb;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(36, 50, 71, 0.06);
  overflow: hidden;
}

.copilot-recommendation-card::after {
  content: '';
  position: absolute;
  top: -38px;
  right: -38px;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: rgba(var(--primary-rgb-p), 0.06);
  transition: transform 0.35s ease;
}

.copilot-recommendation-card:hover::after {
  transform: scale(1.25);
}

.copilot-recommendation-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.copilot-chip-index {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--primary-50-p);
  color: var(--primary-400-p);
  font-size: 13px;
  font-weight: 800;
}

.copilot-chip-index.tertiary {
  background: var(--tertiary-50-p);
  color: var(--tertiary-500-p);
}

.copilot-chip-index.yellow {
  background: var(--yellow-50-p);
  color: #c39200;
}

.copilot-use-icon,
.copilot-question-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.copilot-recommendation-text {
  margin: 0;
  color: #1f2a52;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.7;
  min-height: 4.5rem;
}

.copilot-use-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  width: 100%;
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(180deg, #706df4 0%, #635cf1 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.copilot-use-button:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
}

.copilot-step-panel {
  background: #fbf3d2;
  border-radius: 24px;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.copilot-step-item {
  display: flex;
  align-items: center;
  gap: 14px;
  display: flex;
  align-items: center;
  text-align: left;
  background: #ffffff;
  border: 0;
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(241, 208, 70, 0.08);
}

.copilot-step-number {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: var(--yellow-500-p);
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 6px 12px rgba(241, 208, 70, 0.18);
}

.copilot-step-text {
  color: #334155;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.45;
}

.copilot-section-icon-lucide {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--primary-400-p);
}

.copilot-section-icon-lucide.muted {
  color: #7a879b;
}

.copilot-section-icon-lucide.yellow {
  color: #c39200;
}

.copilot-section {
  margin-bottom: 16px;
}

.copilot-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.copilot-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  color: rgba(95, 113, 136, 0.95);
  font-size: 18px;
  font-weight: 1000;
  letter-spacing: 0;
  text-transform: none;
}

.copilot-section-title.spaced {
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.copilot-context-note {
  font-size: 16px;
  font-weight: 400;
  color: rgba(135, 160, 188, 1);
  white-space: nowrap;
}

.copilot-section-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.copilot-metrics {
  background: rgba(255, 255, 255, 1);
  border: 1px solid var(--primary-200-p);
  border-radius: 16px;
  padding: 14px;
  display: grid;
  gap: 12px;
}

.copilot-metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5f7188;
  font-weight: 400;
  font-size: 16px;
}

.copilot-mood {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(var(--primary-rgb-p), 0.1);
  color: #5f7188;
}

.copilot-mood-icon {
  width: 16px;
  height: 16px;
}

.copilot-mood.warning {
  background: rgba(255, 238, 214, 0.9);
  border-color: rgba(255, 216, 166, 0.9);
  color: #ff7a1a;
}

.copilot-mood.ok {
  background: rgba(220, 252, 231, 0.75);
  border-color: rgba(167, 243, 208, 0.9);
  color: #15803d;
}

.copilot-chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 400;
  font-size: 16px;
  background: rgba(223, 233, 245, 0.7);
  color: #5f7188;
}

.copilot-chip.warning {
  background: rgba(255, 238, 214, 0.9);
  border-color: rgba(255, 216, 166, 0.9);
  color: #ff7a1a;
}

.copilot-chip.ok {
  background: rgba(220, 252, 231, 0.75);
  border-color: rgba(167, 243, 208, 0.9);
  color: #15803d;
}

.copilot-progress {
  display: grid;
  gap: 8px;
}

.copilot-progress-meta {
  display: flex;
  justify-content: space-between;
  color: rgba(95, 113, 136, 0.95);
  font-weight: 400;
  font-size: 16px;
}

.copilot-progress-score {
  color: var(--primary-400-p);
}

.copilot-progress-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.9);
  overflow: hidden;
}

.copilot-progress-fill {
  height: 100%;
  background: var(--primary-400-p);
}

.copilot-hint {
  padding-top: 10px;
  border-top: 1px solid var(--primary-200-p);
  color: rgba(95, 113, 136, 0.95);
  font-weight: 400;
  font-size: 16px;
  line-height: 1.55;
}

.copilot-hint-label {
  color: #ff7a1a;
  font-weight: 400;
}

.copilot-suggestions {
  display: grid;
  gap: 10px;
}

.copilot-suggestion {
  text-align: left;
  border: 1px solid var(--primary-200-p);
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.copilot-suggestion:hover {
  border-color: rgba(var(--primary-rgb-p), 0.35);
  transform: translateY(-1px);
}

.copilot-suggestion-text {
  color: #5f7188;
  font-weight: 400;
  line-height: 1.6;
  font-size: 16px;
}

.copilot-suggestion-action {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(var(--primary-rgb-p), 0.12);
  color: var(--primary-400-p);
  font-weight: 400;
  font-size: 16px;
}

.copilot-secondary {
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px dashed rgba(195, 206, 218, 1);
  background: transparent;
  color: rgba(95, 113, 136, 0.95);
  font-weight: 400;
  font-size: 16px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;
}

.copilot-secondary:hover {
  border-color: rgba(var(--primary-rgb-p), 0.35);
  color: var(--primary-400-p);
  background: rgba(var(--primary-rgb-p), 0.06);
}

.copilot-kb {
  display: grid;
  gap: 8px;
}

.copilot-kb-item {
  width: 100%;
  text-align: left;
  border: 0;
  padding: 10px 12px;
  border-radius: 0 12px 12px 0;
  background: rgba(255, 255, 255, 1);
  border-left: 2px solid var(--primary-200-p);
  color: rgba(95, 113, 136, 0.95);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}

.copilot-kb-item:hover {
  background: rgba(var(--primary-rgb-p), 0.06);
}

.copilot-footer {
  padding: 12px 14px;
  border-top: 1px solid var(--primary-200-p);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: rgba(95, 113, 136, 0.95);
}

.copilot-footer-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.copilot-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 1);
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.copilot-dev-tools {
  padding: 0 16px 12px;
  display: flex;
  justify-content: flex-end;
}

.copilot-dev-button {
  border: 0;
  background: transparent;
  color: var(--primary-400-p);
  font-weight: 1000;
  font-size: 16px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sidebar-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 18px 18px 22px;
}

.sidebar-human-card {
  padding: 18px 16px 16px;
  border-radius: 22px;
  border: 1px solid rgba(var(--primary-rgb-p), 0.22);
  background: rgba(var(--primary-rgb-p), 0.06);
  text-align: center;
  box-shadow: none;
}

.human-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 10px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1px solid var(--primary-200-p);
  color: var(--primary-400-p);
  box-shadow: none;
}

.human-icon svg {
  width: 28px;
  height: 28px;
}

.human-title {
  font-weight: 900;
  font-size: 16px;
  color: var(--primary-500-p);
  margin-bottom: 6px;
}

.human-desc {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-400-p);
  line-height: 1.6;
  margin: 0 auto 12px;
  max-width: 240px;
}

.human-button {
  width: 100%;
  border: 0;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(180deg, #9a86ff 0%, #6f58f7 100%);
  font-weight: 900;
  letter-spacing: 0.04em;
  box-shadow: none;
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.human-button:active {
  transform: translateY(1px) scale(0.99);
  filter: brightness(0.98);
}

.sidebar-section {
  margin-top: 18px;
}

.sidebar-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 900;
  color: #25364c;
}

.section-bar {
  width: 6px;
  height: 26px;
  border-radius: 999px;
  background: var(--primary-400-p);
}

.common-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.common-link {
  border: 1px solid var(--primary-200-p);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  padding: 16px 12px 14px;
  cursor: pointer;
  display: grid;
  place-items: center;
  gap: 10px;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease;
}

.common-link:hover {
  border-color: rgba(var(--primary-rgb-p), 0.35);
  transform: translateY(-1px);
}

.common-link-icon {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--primary-100-p);
  color: var(--primary-400-p);
  transition: transform 0.15s ease;
  transform-origin: center;
  will-change: transform;
}

.common-link-icon[data-icon='user'] {
  background: rgba(103, 100, 240, 0.12);
  color: var(--color-primary-400);
}

.common-link-icon[data-icon='doc'] {
  background: rgba(83, 177, 205, 0.12);
  color: var(--color-tertiary-500);
}

.common-link-icon[data-icon='pin'] {
  background: rgba(241, 208, 70, 0.16);
  color: var(--color-yellow-500);
}

.common-link-icon[data-icon='pulse'] {
  background: rgba(31, 42, 82, 0.08);
  color: var(--color-darkblue-500);
}

.common-link:hover .common-link-icon {
  transform: scale(1.12);
}

.common-link:active .common-link-icon {
  transform: scale(1.18);
}

.common-link-icon svg {
  width: 26px;
  height: 26px;
}

.common-link-label {
  font-size: 16px;
  font-weight: 900;
  color: #2b3d56;
}

.hot-list {
  display: grid;
  gap: 6px;
}

.hot-item {
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  color: #5f7188;
  cursor: pointer;
  font-weight: 800;
  font-size: 16px;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.hot-item:hover {
  background: rgba(var(--primary-rgb-p), 0.08);
  border-color: rgba(var(--primary-rgb-p), 0.28);
  color: var(--primary-400-p);
}

.hot-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(196, 206, 218, 1);
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.hot-item:hover .hot-dot {
  background: rgba(var(--primary-rgb-p), 0.55);
}

.hotline-card {
  margin-top: 18px;
  padding: 16px 16px 14px;
  border-radius: 20px;
  border: 1px solid rgba(var(--primary-rgb-p), 0.28);
  background: rgba(var(--primary-rgb-p), 0.06);
  color: var(--primary-500-p);
}

.hotline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: var(--primary-500-p);
  margin-bottom: 6px;
}

.hotline-icon {
  width: 18px;
  height: 18px;
}

.hotline-number {
  font-size: 28px;
  font-weight: 1000;
  letter-spacing: 0.02em;
  color: var(--primary-500-p);
  margin-bottom: 4px;
}

.hotline-sub {
  font-size: 16px;
  font-weight: 800;
  color: rgba(95, 113, 136, 0.9);
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
  border: 1px solid var(--primary-200-p);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(36, 50, 71, 0.04);
  font-size: 16px;
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
  border: 1px solid var(--primary-200-p);
}

.avatar-user {
  align-self: flex-end;
  background: var(--primary-50-p);
  border: 1px solid var(--primary-200-p);
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
  color: #5f7188;
  font-size: 16px;
  line-height: 1;
}

.bubble {
  padding: 12px 14px;
  border-radius: 18px;
  font-size: 16px;
  line-height: 1.65;
  word-break: break-word;
  box-shadow: 0 6px 18px rgba(36, 50, 71, 0.06);
}

.bubble-agent {
  color: #445266;
  background: rgba(255, 255, 255, 0.96);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--primary-200-p);
}

.bubble-user {
  color: #fff;
  background: linear-gradient(180deg, var(--primary-400-p) 0%, var(--primary-500-p) 100%);
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

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(131, 148, 168, 0.9);
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

.ai-service-slider {
  width: 100%;
  max-width: 740px;
  margin-top: 14px;
  position: relative;
  box-sizing: border-box;
}

.ai-service-viewport {
  width: 100%;
  overflow: hidden;
}

.ai-service-track {
  display: flex;
  gap: 14px;
  padding: 0;
  transition: transform 0.22s ease;
  will-change: transform;
}

.ai-slider-button {
  display: grid;
  place-items: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(70, 82, 98, 0.2);
  background: rgba(90, 103, 120, 0.92);
  color: #ffffff;
  cursor: pointer;
  padding: 0;
  line-height: 0;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.ai-slider-button:hover:not(:disabled) {
  background: rgba(68, 80, 98, 0.95);
}

.ai-slider-button svg {
  width: 22px;
  height: 22px;
}

.ai-slider-button.prev {
  left: -16px;
}

.ai-slider-button.next {
  right: -16px;
}

.ai-slider-button:disabled {
  opacity: 0.35;
  cursor: default;
}

@media (max-width: 860px) {
  .ai-slider-button.prev {
    left: 6px;
  }

  .ai-slider-button.next {
    right: 6px;
  }
}

.ai-card {
  width: 240px;
  flex: 0 0 auto;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid var(--primary-200-p);
  box-shadow: none;
}

.ai-card-hero {
  height: 124px;
  background: var(--primary-100-p);
  border-bottom: 1px solid var(--primary-200-p);
  display: grid;
  place-items: center;
}

.ai-card-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 0;
}

.ai-card-hero-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--primary-400-p);
}

.ai-card-hero-fallback[data-icon='pulse'] {
  color: #22b05a;
}

.ai-card-hero-fallback[data-icon='doc'] {
  color: #ff7a1a;
}

.ai-card-hero-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--primary-200-p);
  display: grid;
  place-items: center;
}

.ai-card-hero-icon svg {
  width: 22px;
  height: 22px;
}

.ai-card-hero-title {
  font-weight: 1000;
  letter-spacing: 0.02em;
  color: #2b3d56;
}

.ai-card-titlebar {
  background: linear-gradient(180deg, #7f78ff 0%, #6764f0 100%);
  padding: 10px 14px;
  font-weight: 1000;
  color: #ffffff;
  border-bottom: 1px solid rgba(103, 100, 240, 0.55);
}

.ai-card-links {
  padding: 0;
  display: grid;
}

.ai-card-link {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 14px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--primary-200-p);
  border-radius: 0;
  cursor: pointer;
  color: #5f7188;
  font-weight: 800;
  font-size: 16px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.ai-card-link:hover {
  background: rgba(var(--primary-rgb-p), 0.06);
  color: var(--primary-400-p);
}

.ai-card-link:last-child {
  border-bottom: 0;
}

.ai-card-chevron {
  width: 16px;
  height: 16px;
  opacity: 0.18;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.ai-card-link:hover .ai-card-chevron {
  opacity: 0.95;
  transform: translateX(2px);
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

.message-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  margin-right: 4px;
  font-size: 16px;
  font-weight: 700;
}

.status-read {
  color: var(--primary-500-p);
}

.status-sent {
  color: #b6bec9;
}

.stickers-panel {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid var(--primary-200-p);
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
  background: var(--primary-100-p);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.sticker-button:hover {
  background: var(--primary-100-p);
  border-color: var(--primary-200-p);
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
  font-size: 16px;
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
  color: var(--primary-500-p);
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
  border-top: 1px solid var(--primary-200-p);
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.03);
}

.sales-footer .quick-replies-header span:first-child,
.sales-footer .quick-reply-chip {
  font-size: 16px;
}

.sales-footer .upload-tooltip {
  font-size: 16px;
}

.quick-replies {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(103, 100, 240, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 1px solid var(--primary-200-p);
  border-radius: 18px;
  transition: padding 0.18s ease;
  position: relative;
}

.quick-replies.collapsed {
  padding-bottom: 10px;
}

.quick-replies-toggle {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  color: var(--primary-400-p);
  background: transparent;
  border: 0;
  border-radius: 999px;
  box-shadow: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    color 0.18s ease;
}

.quick-replies-toggle::before {
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: var(--primary-100-p);
  border: 1px solid var(--primary-200-p);
  box-shadow: 0 6px 14px rgba(74, 100, 126, 0.05);
}

.quick-replies-toggle:hover {
  color: var(--primary-500-p);
  transform: translateY(-1px);
}

.quick-replies-toggle:hover::before {
  border-color: var(--primary-300-p);
  box-shadow: 0 10px 18px rgba(var(--primary-rgb-p), 0.1);
}

.quick-replies-toggle-icon {
  width: 16px;
  height: 16px;
  position: relative;
  z-index: 1;
  transition: transform 0.18s ease;
}

.quick-replies-toggle-icon.collapsed {
  transform: rotate(180deg);
}

.quick-replies-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quick-replies-header span:first-child {
  color: var(--primary-500-p);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.quick-replies-tools .quick-replies-note {
  color: #5f7188 !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  letter-spacing: 0 !important;
  opacity: 0.92 !important;
}

.quick-replies-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.quick-replies-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-replies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-reply-chip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 9px 12px;
  color: #5f7188;
  background: #ffffff;
  border: 1px solid var(--primary-200-p);
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(74, 100, 126, 0.05);
  font-size: 16px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.quick-reply-chip:hover {
  border-color: var(--primary-300-p);
  box-shadow: 0 10px 18px rgba(103, 100, 240, 0.1);
  transform: translateY(-1px);
  color: #6764f0;
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
  color: var(--primary-500-p);
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid var(--primary-200-p);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(var(--primary-rgb-p), 0.12);
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
  content: "";
  position: absolute;
  top: 100%;
  left: 18px;
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-right: 1px solid var(--primary-200-p);
  border-bottom: 1px solid var(--primary-200-p);
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
  width: 44px;
  height: 44px;
  padding: 0;
  color: #97a0ad;
  display: grid;
  place-items: center;
}

.toolbar-icon {
  width: 24px;
  height: 24px;
}

.icon-button:hover,
.icon-button.active {
  color: var(--primary-500-p);
}

.subtle-button {
  font-size: 16px;
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
  background: var(--primary-100-p);
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.input-shell:focus-within {
  background: #fff;
  border-color: var(--primary-200-p);
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
  color: var(--primary-500-p);
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
    font-size: 16px;
  }

  .chat-header {
    text-align: left;
    padding: 18px 16px 20px;
  }

  .fixed-watermark img {
    width: min(56vw, 220px);
    opacity: 0.12;
  }

  .chat-header h1 {
    font-size: 16px;
    letter-spacing: 0.02em;
    margin-left: 8px;
  }

  .message-stack {
    max-width: 84%;
  }

  .stickers-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .quick-replies-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .quick-replies-header > span:first-child {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    font-size: 14px;
  }

  .quick-replies-right {
    width: auto;
    flex-shrink: 0;
    justify-content: flex-end;
  }

  .quick-replies-tools {
    display: none;
  }
}
</style>
