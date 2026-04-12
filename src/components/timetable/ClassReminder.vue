<template>
  <Transition name="slide-down">
    <div v-if="visible && reminder" class="reminder-overlay" @click="dismiss">
      <div class="reminder-card" @click.stop>
        <div class="reminder-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div class="reminder-content">
          <div class="reminder-title">上课提醒</div>
          <div class="reminder-course">{{ reminder.course.name }}</div>
          <div class="reminder-detail">
            <span class="reminder-time">{{ reminder.minutesLeft }} 分钟后开始</span>
            <span class="reminder-sep">·</span>
            <span class="reminder-location">{{ reminder.course.location }}</span>
          </div>
          <div class="reminder-teacher">{{ reminder.course.teacher }}</div>
        </div>
        <button class="reminder-close" @click="dismiss" aria-label="关闭提醒">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="reminder-progress">
          <div class="reminder-progress-bar" :style="{ animationDuration: '15s' }"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  reminder: Object,
})

const emit = defineEmits(['dismiss'])

function dismiss() {
  emit('dismiss')
}
</script>

<style scoped>
.reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: 20px;
  pointer-events: all;
}

.reminder-card {
  background: var(--bg-card);
  border: 1px solid var(--sol-yellow);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(181, 137, 0, 0.2), var(--shadow-lift);
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 480px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.reminder-icon {
  color: var(--sol-yellow);
  flex-shrink: 0;
  animation: bell-shake 0.5s ease-in-out;
}

@keyframes bell-shake {
  0% { transform: rotate(0); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0); }
}

.reminder-content {
  flex: 1;
  min-width: 0;
}

.reminder-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.reminder-course {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.reminder-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.reminder-time {
  color: var(--sol-yellow);
  font-weight: 600;
}

.reminder-sep {
  color: var(--text-muted);
}

.reminder-location {
  color: var(--text-muted);
}

.reminder-teacher {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.reminder-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.reminder-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.reminder-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--border-light);
}

.reminder-progress-bar {
  height: 100%;
  background: var(--sol-yellow);
  animation: progress-shrink linear forwards;
}

@keyframes progress-shrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* 过渡动画 */
.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
