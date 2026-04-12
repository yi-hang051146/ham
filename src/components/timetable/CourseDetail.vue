<template>
  <Transition name="fade">
    <div v-if="course" class="detail-overlay" @click="$emit('close')">
      <div class="detail-card" @click.stop>
        <div class="detail-color-bar" :class="`color-${course.colorIndex}`"></div>
        <button class="detail-close" @click="$emit('close')" aria-label="关闭">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="detail-body">
          <h3 class="detail-name">{{ course.name }}</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">教师</span>
              <span class="detail-value">{{ course.allTeachers ? course.allTeachers.join(' / ') : course.teacher }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">地点</span>
              <span class="detail-value">{{ course.location }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">时间</span>
              <span class="detail-value">{{ dayNames[course.day - 1] }} {{ course.startTime }} - {{ course.endTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">周次</span>
              <span class="detail-value">{{ formatWeeks(course) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { dayNames } from '../../data/schedule.js'

defineProps({
  course: Object,
})

defineEmits(['close'])

function formatWeeks(course) {
  if (course.allWeeks) {
    const sorted = [...course.allWeeks].sort((a, b) => a[0] - b[0])
    return sorted.map(w => w[0] === w[1] ? `第${w[0]}周` : `第${w[0]}-${w[1]}周`).join(', ')
  }
  return course.weeks[0] === course.weeks[1] ? `第${course.weeks[0]}周` : `第${course.weeks[0]}-${course.weeks[1]}周`
}
</script>

<style scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(253, 246, 227, 0.7);
  backdrop-filter: blur(4px);
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.detail-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lift);
  max-width: 400px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.detail-color-bar {
  height: 4px;
}

.color-1 { background: var(--course-1); }
.color-2 { background: var(--course-2); }
.color-3 { background: var(--course-3); }
.color-4 { background: var(--course-4); }
.color-5 { background: var(--course-5); }
.color-6 { background: var(--course-6); }
.color-7 { background: var(--course-7); }
.color-8 { background: var(--course-8); }

.detail-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.detail-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.detail-body {
  padding: 28px 28px 24px;
}

.detail-name {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
}

.fade-enter-active { transition: all 0.3s ease; }
.fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .detail-card { transform: scale(0.95); }
</style>
