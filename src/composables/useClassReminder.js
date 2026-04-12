import { ref, computed, onMounted, onUnmounted } from 'vue'
import { scheduleData } from '../data/schedule.js'

export function useClassReminder() {
  const now = ref(new Date())
  const reminderVisible = ref(false)
  const currentReminder = ref(null)
  const notifiedClasses = ref(new Set())
  let timer = null

  // 更新当前时间
  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
      checkUpcomingClasses()
    }, 10000) // 每10秒检查一次
    checkUpcomingClasses()
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  // 当前时间格式化
  const currentTimeStr = computed(() => {
    const h = String(now.value.getHours()).padStart(2, '0')
    const m = String(now.value.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  })

  // 当前是周几 (1-7)
  const currentDay = computed(() => {
    const day = now.value.getDay()
    return day === 0 ? 7 : day
  })

  // 获取今天的课程
  const todayClasses = computed(() => {
    return scheduleData
      .filter(c => c.day === currentDay.value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  // 当前正在上的课
  const currentClass = computed(() => {
    const timeStr = currentTimeStr.value
    return todayClasses.value.find(c => 
      timeStr >= c.startTime && timeStr <= c.endTime
    )
  })

  // 下一节课
  const nextClass = computed(() => {
    const timeStr = currentTimeStr.value
    return todayClasses.value.find(c => c.startTime > timeStr)
  })

  // 距离下一节课还有多少分钟
  const minutesToNext = computed(() => {
    if (!nextClass.value) return null
    const [h, m] = nextClass.value.startTime.split(':').map(Number)
    const classTime = h * 60 + m
    const nowTime = now.value.getHours() * 60 + now.value.getMinutes()
    return classTime - nowTime
  })

  // 检查即将上课的课程（提前5分钟提醒）
  function checkUpcomingClasses() {
    const timeStr = currentTimeStr.value
    const day = currentDay.value

    for (const course of scheduleData) {
      if (course.day !== day) continue

      const [ch, cm] = course.startTime.split(':').map(Number)
      const classMinutes = ch * 60 + cm
      const nowMinutes = now.value.getHours() * 60 + now.value.getMinutes()
      const diff = classMinutes - nowMinutes

      // 提前5分钟提醒
      const reminderKey = `${course.day}-${course.name}-${course.startTime}`
      
      if (diff > 0 && diff <= 5 && !notifiedClasses.value.has(reminderKey)) {
        notifiedClasses.value.add(reminderKey)
        currentReminder.value = {
          course,
          minutesLeft: diff
        }
        reminderVisible.value = true

        // 浏览器通知
        sendBrowserNotification(course, diff)

        // 15秒后自动关闭页面内提醒
        setTimeout(() => {
          reminderVisible.value = false
        }, 15000)
      }
    }

    // 每天重置已通知集合
    if (now.value.getHours() === 0 && now.value.getMinutes() === 0) {
      notifiedClasses.value.clear()
    }
  }

  // 发送浏览器通知
  function sendBrowserNotification(course, minutesLeft) {
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      createNotification(course, minutesLeft)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          createNotification(course, minutesLeft)
        }
      })
    }
  }

  function createNotification(course, minutesLeft) {
    new Notification('上课提醒', {
      body: `${course.name} 将在 ${minutesLeft} 分钟后开始\n地点：${course.location}`,
      icon: '/favicon.svg',
      tag: `class-${course.name}-${course.startTime}`,
    })
  }

  // 请求通知权限
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  function dismissReminder() {
    reminderVisible.value = false
  }

  return {
    now,
    currentTimeStr,
    currentDay,
    todayClasses,
    currentClass,
    nextClass,
    minutesToNext,
    reminderVisible,
    currentReminder,
    dismissReminder,
    requestNotificationPermission,
  }
}
