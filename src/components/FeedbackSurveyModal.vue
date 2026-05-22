<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '滿意度調查'
  },
  headline: {
    type: String,
    default: '您的聲音，讓新竹更好'
  },
  subtitle: {
    type: String,
    default: '請為本次 1999 服務評分'
  },
  placeholder: {
    type: String,
    default: '歡迎留下您的具體建議，幫助我們持續優化客服品質…（100字內選填）'
  },
  submitText: {
    type: String,
    default: '送出回饋'
  },
  returnText: {
    type: String,
    default: '返回通話'
  },
  successTitle: {
    type: String,
    default: '回饋已送出'
  },
  successSubtitle: {
    type: String,
    default: '感謝您的回饋，我們會持續優化服務。'
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'submit']);

const rating = ref(1);
const comment = ref('');
const submitted = ref(false);
const closeTimer = ref(null);

const ratingLabels = {
  1: '有待加強',
  2: '需要改善',
  3: '普通',
  4: '不錯',
  5: '非常滿意'
};

const ratingLabel = computed(() => ratingLabels[rating.value] ?? ratingLabels[1]);

const clearCloseTimer = () => {
  if (closeTimer.value) {
    window.clearTimeout(closeTimer.value);
    closeTimer.value = null;
  }
};

const resetState = () => {
  clearCloseTimer();
  rating.value = 1;
  comment.value = '';
  submitted.value = false;
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetState();
    } else {
      clearCloseTimer();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearCloseTimer();
});

const requestClose = () => {
  emit('update:modelValue', false);
  emit('close');
};

const setRating = (value) => {
  if (submitted.value) {
    return;
  }

  rating.value = value;
};

const handleSubmit = () => {
  if (submitted.value) {
    return;
  }

  submitted.value = true;
  emit('submit', {
    rating: rating.value,
    comment: comment.value.trim()
  });

  clearCloseTimer();
  closeTimer.value = window.setTimeout(() => {
    requestClose();
  }, 1600);
};
</script>

<template>
  <transition name="survey-feedback-fade">
    <div v-if="modelValue" class="survey-feedback-overlay" @click.self="requestClose">
      <div class="survey-feedback-card" role="dialog" aria-modal="true" :aria-label="title">
        <div class="survey-feedback-badge">
          <span>{{ title }}</span>
        </div>

        <template v-if="!submitted">
          <div class="survey-feedback-headline">{{ headline }}</div>
          <div class="survey-feedback-subtitle">{{ subtitle }}</div>

          <div class="survey-feedback-stars" role="radiogroup" :aria-label="title">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="survey-feedback-star"
              :class="{ active: star <= rating }"
              :aria-checked="star === rating"
              :aria-label="`${star} 顆星`"
              role="radio"
              @click="setRating(star)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m12 2.8 2.8 5.68 6.27.91-4.53 4.41 1.07 6.25L12 16.8 6.38 20.05l1.07-6.25L2.92 9.39l6.27-.91L12 2.8Z"
                />
              </svg>
            </button>
          </div>

          <div class="survey-feedback-rating">{{ ratingLabel }}</div>

          <label class="survey-feedback-field">
            <span class="survey-feedback-sr-only">意見回饋</span>
            <textarea
              v-model="comment"
              class="survey-feedback-textarea"
              :placeholder="placeholder"
              maxlength="100"
              rows="4"
            />
          </label>

          <button type="button" class="survey-feedback-submit" :disabled="submitted" @click="handleSubmit">
            {{ submitText }}
          </button>

          <button type="button" class="survey-feedback-return" @click="requestClose">
            {{ returnText }}
          </button>
        </template>

        <template v-else>
          <div class="survey-feedback-success">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="survey-feedback-success-icon">
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
            <div class="survey-feedback-success-title">{{ successTitle }}</div>
            <div class="survey-feedback-success-subtitle">{{ successSubtitle }}</div>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.survey-feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(122, 123, 255, 0.24), transparent 28%),
    rgba(7, 12, 24, 0.82);
  backdrop-filter: blur(10px);
}

.survey-feedback-card {
  position: relative;
  width: min(100%, 420px);
  padding: 28px 24px 22px;
  border-radius: 34px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfe 100%);
  box-shadow: 0 28px 64px rgba(10, 16, 34, 0.3);
  text-align: center;
}

.survey-feedback-badge {
  position: absolute;
  top: -18px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  color: #ffffff;
  background: linear-gradient(180deg, #5d5af4 0%, #4a47e6 100%);
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(74, 71, 230, 0.28);
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.survey-feedback-headline {
  margin-top: 6px;
  color: #1b2340;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: 0.01em;
}

.survey-feedback-subtitle {
  margin-top: 8px;
  color: #7d8797;
  font-size: 14px;
  font-weight: 700;
}

.survey-feedback-stars {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.survey-feedback-star {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  padding: 0;
  color: #d8deea;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    color 0.18s ease;
}

.survey-feedback-star svg {
  width: 44px;
  height: 44px;
  fill: currentColor;
}

.survey-feedback-star.active {
  color: #ffbe16;
}

.survey-feedback-star:hover {
  transform: translateY(-2px) scale(1.04);
}

.survey-feedback-rating {
  margin-top: 8px;
  color: #ff9b00;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.survey-feedback-field {
  display: block;
  margin-top: 18px;
}

.survey-feedback-textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px 18px;
  color: #2a3550;
  background: #f9fbff;
  border: 1px solid #d7e2f2;
  border-radius: 22px;
  resize: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
  font-size: 16px;
  line-height: 1.6;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.survey-feedback-textarea::placeholder {
  color: #97a6bf;
  font-weight: 400;
}

.survey-feedback-textarea:focus {
  border-color: rgba(76, 68, 234, 0.45);
  box-shadow:
    0 0 0 4px rgba(76, 68, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.survey-feedback-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  margin-top: 20px;
  color: #ffffff;
  background: linear-gradient(180deg, #5a57f2 0%, #4b46e8 100%);
  border: 0;
  border-radius: 18px;
  box-shadow: 0 14px 28px rgba(75, 70, 232, 0.28);
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.survey-feedback-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(75, 70, 232, 0.32);
}

.survey-feedback-submit:disabled {
  cursor: default;
  filter: saturate(0.95) opacity(0.92);
}

.survey-feedback-return {
  margin-top: 16px;
  padding: 0;
  color: #9aa3b2;
  background: transparent;
  border: 0;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: color 0.18s ease;
}

.survey-feedback-return:hover {
  color: #6f7887;
}

.survey-feedback-success {
  padding: 36px 12px 30px;
}

.survey-feedback-success-icon {
  width: 68px;
  height: 68px;
  color: #4b46e8;
}

.survey-feedback-success-title {
  margin-top: 18px;
  color: #1b2340;
  font-size: 22px;
  font-weight: 900;
}

.survey-feedback-success-subtitle {
  margin-top: 8px;
  color: #7d8797;
  font-size: 14px;
  font-weight: 700;
}

.survey-feedback-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.survey-feedback-fade-enter-active,
.survey-feedback-fade-leave-active {
  transition: opacity 0.22s ease;
}

.survey-feedback-fade-enter-active .survey-feedback-card,
.survey-feedback-fade-leave-active .survey-feedback-card {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.survey-feedback-fade-enter-from,
.survey-feedback-fade-leave-to {
  opacity: 0;
}

.survey-feedback-fade-enter-from .survey-feedback-card,
.survey-feedback-fade-leave-to .survey-feedback-card {
  transform: translateY(18px) scale(0.96);
  opacity: 0;
}

@media (max-width: 480px) {
  .survey-feedback-overlay {
    padding: 16px;
  }

  .survey-feedback-card {
    padding: 24px 18px 18px;
    border-radius: 30px;
  }

  .survey-feedback-headline,
  .survey-feedback-success-title {
    font-size: 20px;
  }

  .survey-feedback-subtitle,
  .survey-feedback-rating,
  .survey-feedback-success-subtitle,
  .survey-feedback-return {
    font-size: 14px;
  }

  .survey-feedback-textarea {
    min-height: 110px;
    padding: 14px 16px;
    font-size: 15px;
  }
}
</style>
