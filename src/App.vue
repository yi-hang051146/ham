<template>
  <div class="app">
    <AppHeader 
      :activeTab="activeTab" 
      :currentHour="now.getHours()"
      @tabChange="activeTab = $event"
      @requestNotify="requestNotificationPermission"
    />

    <main class="app-main">
      <div class="main-inner">
        <Transition name="page" mode="out-in">
          <!-- 课表页 -->
          <div v-if="activeTab === 'timetable'" key="timetable" class="page">
            <WeekView 
              :currentDay="currentDay"
              :currentTimeStr="currentTimeStr"
              :now="now"
              :currentClass="currentClass"
              :nextClass="nextClass"
              :minutesToNext="minutesToNext"
            />
          </div>

          <!-- 笔记页 -->
          <div v-else-if="activeTab === 'notes'" key="notes" class="page">
            <SiYuanNotes />
          </div>
        </Transition>
      </div>
    </main>

    <!-- 上课提醒 -->
    <ClassReminder 
      :visible="reminderVisible"
      :reminder="currentReminder"
      @dismiss="dismissReminder"
    />

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="footer-inner">
        <span class="footer-text">Solarized Theme</span>
        <span class="footer-sep">·</span>
        <span class="footer-text">Vue 3 + Vite</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import WeekView from './components/timetable/WeekView.vue'
import ClassReminder from './components/timetable/ClassReminder.vue'
import SiYuanNotes from './components/notes/SiYuanNotes.vue'
import { useClassReminder } from './composables/useClassReminder.js'

const activeTab = ref('timetable')

// 课表提醒功能
const {
  now,
  currentTimeStr,
  currentDay,
  currentClass,
  nextClass,
  minutesToNext,
  reminderVisible,
  currentReminder,
  dismissReminder,
  requestNotificationPermission,
} = useClassReminder()
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.app-main {
  flex: 1;
  padding: 24px 0;
}

.main-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.page {
  width: 100%;
}

/* 页面切换动画 */
.page-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-leave-active {
  transition: all 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 页脚 */
.app-footer {
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
  margin-top: auto;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.footer-sep {
  font-size: 0.75rem;
  color: var(--border-color);
}

@media (max-width: 600px) {
  .main-inner {
    padding: 0 12px;
  }
}
</style>
