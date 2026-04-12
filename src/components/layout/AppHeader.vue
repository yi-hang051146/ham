<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-brand">
        <div class="brand-mark">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1 class="brand-title">我的主页</h1>
          <p class="brand-subtitle">{{ greeting }}</p>
        </div>
      </div>
      <nav class="header-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-btn"
          :class="{ active: activeTab === tab.id }"
          @click="$emit('tabChange', tab.id)"
        >
          <svg v-if="tab.icon === 'calendar'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <svg v-else-if="tab.icon === 'book'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </nav>
      <div class="header-actions">
        <button class="notify-btn" @click="$emit('requestNotify')" title="开启上课提醒通知">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: String,
  currentHour: Number,
})

defineEmits(['tabChange', 'requestNotify'])

const tabs = [
  { id: 'timetable', label: '课表', icon: 'calendar' },
  { id: 'notes', label: '笔记', icon: 'book' },
]

const greeting = computed(() => {
  const h = props.currentHour
  if (h < 6) return '夜深了，注意休息'
  if (h < 9) return '早安，新的一天开始了'
  if (h < 12) return '上午好，专注学习'
  if (h < 14) return '午安，记得休息'
  if (h < 18) return '下午好，继续加油'
  if (h < 22) return '晚上好，温故知新'
  return '夜深了，注意休息'
})
</script>

<style scoped>
.app-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(250, 245, 228, 0.92);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand-mark {
  color: var(--sol-yellow);
  display: flex;
}

.brand-title {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.2;
  margin-top: 2px;
}

.header-nav {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
}

.nav-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.nav-btn.active {
  color: var(--sol-yellow);
  background: rgba(181, 137, 0, 0.1);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.notify-btn {
  background: none;
  border: 1px solid var(--border-light);
  color: var(--text-muted);
  cursor: pointer;
  padding: 7px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
}

.notify-btn:hover {
  color: var(--sol-yellow);
  border-color: var(--sol-yellow);
  background: rgba(181, 137, 0, 0.06);
}

@media (max-width: 600px) {
  .header-inner {
    padding: 12px 16px;
  }
  .brand-subtitle {
    display: none;
  }
  .nav-btn span {
    display: none;
  }
}
</style>
