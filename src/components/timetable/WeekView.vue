<template>
  <div class="week-view">
    <!-- 顶部：今日概览 -->
    <div class="today-overview">
      <div class="overview-header">
        <span class="day-badge">{{ dayNames[currentDay - 1] }}</span>
        <span class="date-text">{{ formattedDate }}</span>
        <span class="time-text">{{ currentTimeStr }}</span>
      </div>
      <div class="overview-status" v-if="currentClass">
        <span class="status-dot ongoing"></span>
        <span class="status-label">正在上课：</span>
        <span class="status-course">{{ currentClass.name }}</span>
        <span class="status-location">{{ currentClass.location }}</span>
      </div>
      <div class="overview-status" v-else-if="nextClass">
        <span class="status-dot upcoming"></span>
        <span class="status-label">下一节课：</span>
        <span class="status-course">{{ nextClass.name }}</span>
        <span class="status-time">{{ minutesToNext }}分钟后</span>
      </div>
      <div class="overview-status" v-else>
        <span class="status-dot free"></span>
        <span class="status-label">今天没有更多课程了</span>
      </div>
    </div>

    <!-- 按天分列的课表 -->
    <div class="week-columns">
      <div 
        v-for="day in activeDays" 
        :key="day" 
        class="day-column"
        :class="{ 'is-today': day === currentDay }"
      >
        <div class="column-header">
          <span class="column-day">{{ dayNames[day - 1] }}</span>
          <span class="column-date">{{ getDayDate(day) }}</span>
        </div>
        <div class="column-courses">
          <div 
            v-for="course in getDayCourses(day)" 
            :key="course.name"
            class="course-card"
            :class="[`color-${course.colorIndex}`, { 
              'is-ongoing': isOngoing(course),
              'is-upcoming': isUpcoming(course)
            }]"
          >
            <div class="card-time">
              <span class="time-start">{{ course.startTime }}</span>
              <span class="time-sep">-</span>
              <span class="time-end">{{ course.endTime }}</span>
            </div>
            <span class="course-name">{{ course.name }}</span>
            <span class="course-location">{{ course.location }}</span>
            <span class="course-teacher" v-if="course.allTeachers">{{ course.allTeachers.join(' / ') }}</span>
            <span class="course-teacher" v-else>{{ course.teacher }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { scheduleData, dayNames } from '../../data/schedule.js'

// 只显示有课的天：周一、二、四、五
const activeDays = [1, 2, 4, 5]

const props = defineProps({
  currentDay: Number,
  currentTimeStr: String,
  now: Date,
  currentClass: Object,
  nextClass: Object,
  minutesToNext: Number,
})

const formattedDate = computed(() => {
  const d = props.now
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

function getDayDate(day) {
  const d = new Date(props.now)
  const currentDayOfWeek = d.getDay() === 0 ? 7 : d.getDay()
  const diff = day - currentDayOfWeek
  d.setDate(d.getDate() + diff)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getDayCourses(day) {
  const courses = scheduleData
    .filter(c => c.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  
  // 同名课程去重，合并教师信息
  const seen = new Map()
  for (const c of courses) {
    if (seen.has(c.name)) {
      const existing = seen.get(c.name)
      if (!existing.allTeachers.includes(c.teacher)) {
        existing.allTeachers.push(c.teacher)
      }
    } else {
      seen.set(c.name, { ...c, allTeachers: [c.teacher] })
    }
  }
  return Array.from(seen.values())
}

function isOngoing(course) {
  const time = props.currentTimeStr
  return course.day === props.currentDay && 
    time >= course.startTime && time <= course.endTime
}

function isUpcoming(course) {
  const time = props.currentTimeStr
  return course.day === props.currentDay && course.startTime > time
}
</script>

<style scoped>
.week-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 今日概览 */
.today-overview {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-soft);
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.day-badge {
  background: var(--sol-yellow);
  color: var(--sol-base03);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 3px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.date-text {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  color: var(--text-secondary);
}

.time-text {
  margin-left: auto;
  font-size: 1.3rem;
  font-weight: 300;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

.overview-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.ongoing {
  background: var(--sol-green);
  animation: pulse 2s ease-in-out infinite;
}

.status-dot.upcoming {
  background: var(--sol-yellow);
}

.status-dot.free {
  background: var(--text-muted);
}

.status-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.status-course {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.status-location,
.status-time {
  font-size: 0.85rem;
  color: var(--text-muted);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

/* 按天分列布局 */
.week-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.day-column {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.day-column.is-today {
  border-color: var(--sol-yellow);
  box-shadow: 0 0 0 1px var(--sol-yellow), var(--shadow-soft);
}

.column-header {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-day {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.day-column.is-today .column-day {
  color: var(--sol-yellow);
}

.column-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.column-courses {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

/* 课程卡片 - 便利贴风格 */
.course-card {
  border-radius: var(--radius-md);
  padding: 12px 14px;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-left: 3px solid;
  position: relative;
  overflow: hidden;
  box-shadow: 1px 2px 6px rgba(101, 123, 131, 0.1);
  flex: 1;
}

.course-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
}

.course-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, var(--bg-card) 50%, rgba(101, 123, 131, 0.06) 50%);
  border-radius: 0 0 0 3px;
}

/* 课程颜色 */
.color-1 { border-left-color: var(--course-1); }
.color-1::before { background: var(--course-1); }
.color-1 .course-name { color: var(--course-1); }

.color-2 { border-left-color: var(--course-2); }
.color-2::before { background: var(--course-2); }
.color-2 .course-name { color: var(--course-2); }

.color-3 { border-left-color: var(--course-3); }
.color-3::before { background: var(--course-3); }
.color-3 .course-name { color: var(--course-3); }

.color-4 { border-left-color: var(--course-4); }
.color-4::before { background: var(--course-4); }
.color-4 .course-name { color: var(--course-4); }

.color-5 { border-left-color: var(--course-5); }
.color-5::before { background: var(--course-5); }
.color-5 .course-name { color: var(--course-5); }

.color-6 { border-left-color: var(--course-6); }
.color-6::before { background: var(--course-6); }
.color-6 .course-name { color: var(--course-6); }

.color-7 { border-left-color: var(--course-7); }
.color-7::before { background: var(--course-7); }
.color-7 .course-name { color: var(--course-7); }

.color-8 { border-left-color: var(--course-8); }
.color-8::before { background: var(--course-8); }
.color-8 .course-name { color: var(--course-8); }

.course-card.is-ongoing {
  box-shadow: 0 0 0 2px var(--sol-green), var(--shadow-soft);
}

.course-card.is-upcoming {
  box-shadow: 0 0 0 1px var(--sol-yellow);
}

.card-time {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 2px;
}

.time-start,
.time-end {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.time-sep {
  font-size: 0.65rem;
  color: var(--text-muted);
  opacity: 0.5;
}

.course-name {
  font-weight: 600;
  font-size: 0.88rem;
  line-height: 1.3;
}

.course-location {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.course-teacher {
  font-size: 0.72rem;
  color: var(--text-muted);
  opacity: 0.8;
}

/* 响应式 */
@media (max-width: 700px) {
  .week-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 450px) {
  .week-columns {
    grid-template-columns: 1fr;
  }
}
</style>
