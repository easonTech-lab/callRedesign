<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

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
const submitError = ref('');
const closeTimer = ref(null);
const modalRef = ref(null);
const ratingButtonRefs = ref([]);
const previouslyFocusedElement = ref(null);
const modalTitleId = 'survey-feedback-title';
const modalDescriptionId = 'survey-feedback-description';
const errorMessageId = 'survey-feedback-error';
const commentId = 'survey-feedback-comment';
const commentHintId = 'survey-feedback-comment-hint';

const ratingLabels = {
  1: '有待加強',
  2: '需要改善',
  3: '普通',
  4: '不錯',
  5: '非常滿意'
};

const ratingLabel = computed(() => ratingLabels[rating.value] ?? ratingLabels[1]);

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

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
  submitError.value = '';
  ratingButtonRefs.value = [];
};

const setRatingButtonRef = (element, index) => {
  if (element) {
    ratingButtonRefs.value[index] = element;
  }
};

const focusRating = (index) => {
  ratingButtonRefs.value[index]?.focus();
};

const focusFirstElement = async () => {
  await nextTick();

  const focusables = modalRef.value
    ? Array.from(modalRef.value.querySelectorAll(focusableSelector))
    : [];

  const firstFocusable = focusables[0];
  if (firstFocusable instanceof HTMLElement) {
    firstFocusable.focus();
  }
};

const restoreFocus = () => {
  const trigger = previouslyFocusedElement.value;
  if (trigger instanceof HTMLElement && typeof trigger.focus === 'function') {
    trigger.focus();
  }
  previouslyFocusedElement.value = null;
};

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocusedElement.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      resetState();
      await focusFirstElement();
    } else {
      clearCloseTimer();
      restoreFocus();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearCloseTimer();
  restoreFocus();
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

const handleRatingKeydown = (event, index) => {
  if (submitted.value) {
    return;
  }

  let nextIndex = index;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = Math.min(4, index + 1);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = Math.max(0, index - 1);
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = 4;
  } else {
    return;
  }

  event.preventDefault();
  setRating(nextIndex + 1);
  focusRating(nextIndex);
};

const handleDialogKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    requestClose();
    return;
  }

  if (event.key !== 'Tab' || !modalRef.value) {
    return;
  }

  const focusables = Array.from(modalRef.value.querySelectorAll(focusableSelector)).filter(
    (element) => element instanceof HTMLElement && !element.hasAttribute('disabled')
  );

  if (!focusables.length) {
    event.preventDefault();
    return;
  }

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey) {
    if (activeElement === firstFocusable || !modalRef.value.contains(activeElement)) {
      event.preventDefault();
      lastFocusable.focus();
    }
    return;
  }

  if (activeElement === lastFocusable || !modalRef.value.contains(activeElement)) {
    event.preventDefault();
    firstFocusable.focus();
  }
};

const handleSubmit = () => {
  if (submitted.value) {
    return;
  }

  submitError.value = '';

  try {
    emit('submit', {
      rating: rating.value,
      comment: comment.value.trim()
    });
    submitted.value = true;
  } catch (error) {
    submitError.value = '送出失敗，請稍後再試。';
    return;
  }

  clearCloseTimer();
  closeTimer.value = window.setTimeout(() => {
    requestClose();
  }, 1600);
};
</script>

<template>
  <transition name="survey-feedback-fade">
    <div v-if="modelValue" class="survey-feedback-overlay" @click.self="requestClose">
      <div
        ref="modalRef"
        class="survey-feedback-card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
        :aria-describedby="[modalDescriptionId, submitError ? errorMessageId : null].filter(Boolean).join(' ')"
        tabindex="-1"
        @keydown="handleDialogKeydown"
      >
        <div class="survey-feedback-badge">
          <span>{{ title }}</span>
        </div>

        <template v-if="!submitted">
          <div :id="modalTitleId" class="survey-feedback-headline">{{ headline }}</div>
          <div :id="modalDescriptionId" class="survey-feedback-subtitle">{{ subtitle }}</div>
          <p v-if="submitError" :id="errorMessageId" class="survey-feedback-error" role="alert">
            {{ submitError }}
          </p>

          <div class="survey-feedback-stars" role="radiogroup" :aria-labelledby="modalTitleId">
            <button
              v-for="star in 5"
              :key="star"
              :ref="(element) => setRatingButtonRef(element, star - 1)"
              type="button"
              class="survey-feedback-star"
              :class="{ active: star <= rating }"
              :aria-checked="star === rating"
              :aria-label="`${star} 顆星，${ratingLabels[star]}`"
              role="radio"
              :tabindex="star === rating ? 0 : -1"
              @click="setRating(star)"
              @keydown="handleRatingKeydown($event, star - 1)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m12 2.8 2.8 5.68 6.27.91-4.53 4.41 1.07 6.25L12 16.8 6.38 20.05l1.07-6.25L2.92 9.39l6.27-.91L12 2.8Z"
                  :fill="star <= rating ? 'currentColor' : 'none'"
                  :stroke="star <= rating ? 'none' : 'currentColor'"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="survey-feedback-rating">{{ ratingLabel }}</div>

          <label class="survey-feedback-field">
            <span class="survey-feedback-field-meta">
              <span class="survey-feedback-field-label">意見回饋</span>
              <span :id="commentHintId" class="survey-feedback-field-hint">選填，最多 100 字</span>
            </span>
            <textarea
              :id="commentId"
              v-model="comment"
              class="survey-feedback-textarea"
              :class="{ 'is-error': Boolean(submitError) }"
              :placeholder="placeholder"
              maxlength="100"
              rows="4"
              :aria-describedby="[commentHintId, submitError ? errorMessageId : null].filter(Boolean).join(' ')"
            />
          </label>

          <button
            type="button"
            class="purple-action-button survey-feedback-submit"
            :disabled="submitted"
            @click="handleSubmit"
          >
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  padding: 24px 24px 32px;
  background:
    radial-gradient(circle at top, rgba(122, 123, 255, 0.24), transparent 28%),
    rgba(7, 12, 24, 0.82);
  backdrop-filter: blur(10px);
}

.survey-feedback-card {
  position: relative;
  width: min(100%, 420px);
  padding: 28px 24px 22px;
  margin: auto 0;
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
  font-size: var(--font-size-caption);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.survey-feedback-headline {
  margin-top: 6px;
  color: #1b2340;
  font-size: var(--font-size-title);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: 0.01em;
}

.survey-feedback-subtitle {
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: var(--font-size-body-sm);
  font-weight: 700;
}

.survey-feedback-field {
  display: block;
  margin-top: 18px;
  text-align: left;
}

.survey-feedback-field-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.survey-feedback-field-label {
  flex: 0 0 auto;
  color: #1b2340;
  font-size: var(--font-size-body-sm);
  font-weight: 800;
  line-height: 1.4;
}

.survey-feedback-field-hint {
  flex: 0 1 auto;
  text-align: right;
  color: var(--color-text-faint);
  font-size: var(--font-size-body-sm);
  font-weight: 700;
  line-height: 1.5;
  white-space: nowrap;
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
  color: var(--color-text-subtle);
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
}

.survey-feedback-star svg {
  width: 44px;
  height: 44px;
}

.survey-feedback-star.active {
  color: var(--color-icon-rating);
}

.survey-feedback-star:hover {
  color: #b45309;
  background: rgba(217, 119, 6, 0.12);
  transform: translateY(-2px) scale(1.04);
}

.survey-feedback-star:active:not(:disabled) {
  color: #92400e;
  background: rgba(217, 119, 6, 0.2);
  transform: translateY(0) scale(0.96);
}

.survey-feedback-star.active:hover {
  color: #b45309;
}

.survey-feedback-star:focus-visible,
.survey-feedback-return:focus-visible,
.survey-feedback-textarea:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 3px;
}

.survey-feedback-rating {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-sm);
  font-weight: 800;
  letter-spacing: 0.03em;
}

.survey-feedback-error {
  margin-top: 14px;
  padding: 12px 14px;
  color: var(--color-error);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 16px;
  font-size: var(--font-size-body-sm);
  font-weight: 700;
  line-height: 1.5;
  text-align: left;
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
  font-size: var(--font-size-input);
  line-height: 1.6;
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.survey-feedback-textarea::placeholder {
  color: var(--color-text-faint);
  font-weight: 400;
}

.survey-feedback-textarea:focus {
  border-color: rgba(76, 68, 234, 0.45);
  box-shadow:
    0 0 0 4px rgba(76, 68, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.survey-feedback-textarea.is-error {
  border-color: var(--color-error);
  box-shadow:
    0 0 0 4px rgba(220, 38, 38, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.survey-feedback-textarea:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 3px;
}

.survey-feedback-submit {
  --purple-action-width: 100%;
  --purple-action-min-height: 48px;
  --purple-action-margin-top: 20px;
  --purple-action-radius: 18px;
  --purple-action-font-size: var(--font-size-button);
  --purple-action-letter-spacing: 0.03em;
  --purple-action-padding: 0 16px;
}

.survey-feedback-return {
  margin-top: 16px;
  padding: 0;
  color: var(--color-text-faint);
  background: transparent;
  border: 0;
  font-size: var(--font-size-link);
  font-weight: 800;
  cursor: pointer;
  transition: color 0.18s ease;
}

.survey-feedback-return:hover {
  color: #4f5a6d;
}

.survey-feedback-return:active:not(:disabled) {
  color: #3e495c;
  transform: translateY(1px);
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
  font-size: var(--font-size-title);
  font-weight: 900;
}

.survey-feedback-success-subtitle {
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: var(--font-size-body-sm);
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

  .survey-feedback-textarea {
    min-height: 110px;
    padding: 14px 16px;
  }

  .survey-feedback-field-meta {
    gap: 8px;
    margin-bottom: 6px;
  }
}

@media (max-height: 760px) {
  .survey-feedback-overlay {
    align-items: flex-start;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .survey-feedback-card {
    margin: 0;
  }
}
</style>
