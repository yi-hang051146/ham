/**
 * 课表显示模块
 * 功能：根据当前时间自动显示当前应上的课程信息
 */

// ============================================
// 📝 课表数据配置区 - 在这里修改您的课表
// ============================================
/**
 * 课表数据格式说明：
 * - name: 课程名称
 * - location: 教室位置
 * - startTime: 开始时间（格式："HH:MM"，如 "9:50"）
 * - endTime: 结束时间（格式："HH:MM"，如 "12:15"）
 * - dayOfWeek: 星期几（1=周一, 2=周二, ..., 7=周日）
 */
const scheduleData = [
    // 周一课程
    { name: "中国金融特色化专题", location: "1区6-213", startTime: "14:05", endTime: "16:30", dayOfWeek: 1 },

    // 周二课程
    { name: "随机过程", location: "1区5-401", startTime: "9:50", endTime: "12:15", dayOfWeek: 2 },
    { name: "证券投资分析", location: "1区6-106", startTime: "14:05", endTime: "16:30", dayOfWeek: 2 },
    { name: "动态最优化", location: "1区3-402", startTime: "18:30", endTime: "20:55", dayOfWeek: 2 },

    // 周三课程
    { name: "衍生金融工具", location: "1区6-103", startTime: "9:50", endTime: "12:15", dayOfWeek: 3 },
    { name: "公司金融", location: "未知", startTime: "18:30", endTime: "20:55", dayOfWeek: 3 },

    // 周四课程
    { name: "常微分方程", location: "1区5-111", startTime: "9:50", endTime: "12:15", dayOfWeek: 4 },
    { name: "投资学", location: "1区6-209", startTime: "18:30", endTime: "20:55", dayOfWeek: 4 },

    // 周五课程
    { name: "固定收益证券", location: "1区枫-305", startTime: "9:50", endTime: "12:15", dayOfWeek: 5 },

    // 周六、周日无课程安排
];
// ============================================

/**
 * 课程状态枚举
 */
const CourseStatus = {
    ONGOING: 'ongoing',      // 进行中
    UPCOMING: 'upcoming',    // 未开始
    ENDED: 'ended'           // 已结束
};

/**
 * 将时间字符串转换为分钟数
 * @param {string} timeStr - 时间字符串，格式 "HH:MM"
 * @returns {number} 从午夜开始的分钟数
 */
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * 判断课程状态
 * @param {Object} course - 课程对象
 * @param {Date} currentTime - 当前时间
 * @returns {string} 课程状态（ONGOING/UPCOMING/ENDED）
 */
function getCourseStatus(course, currentTime) {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = timeToMinutes(course.startTime);
    const endMinutes = timeToMinutes(course.endTime);

    if (currentMinutes < startMinutes) {
        return CourseStatus.UPCOMING;
    } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return CourseStatus.ONGOING;
    } else {
        return CourseStatus.ENDED;
    }
}

/**
 * 获取当日课程列表
 * @returns {Array} 当日课程数组
 */
function getTodayCourses() {
    const today = new Date().getDay();
    // JavaScript 的 getDay() 返回 0=周日, 1=周一, ..., 6=周六
    // 转换为我们的格式：1=周一, ..., 7=周日
    const dayOfWeek = today === 0 ? 7 : today;

    return scheduleData.filter(course => course.dayOfWeek === dayOfWeek);
}

/**
 * 获取当前应显示的课程
 * @returns {Object|null} 当前课程对象和状态，或 null（无课程）
 */
function getCurrentCourse() {
    const todayCourses = getTodayCourses();
    const currentTime = new Date();

    if (todayCourses.length === 0) {
        return { type: 'no-courses' };
    }

    // 分类课程
    const ongoingCourses = [];
    const upcomingCourses = [];

    todayCourses.forEach(course => {
        const status = getCourseStatus(course, currentTime);
        if (status === CourseStatus.ONGOING) {
            ongoingCourses.push(course);
        } else if (status === CourseStatus.UPCOMING) {
            upcomingCourses.push(course);
        }
    });

    // 优先返回进行中的课程
    if (ongoingCourses.length > 0) {
        return { course: ongoingCourses[0], status: CourseStatus.ONGOING };
    }

    // 返回最近的未开始课程
    if (upcomingCourses.length > 0) {
        // 按开始时间排序，取最近的
        upcomingCourses.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        return { course: upcomingCourses[0], status: CourseStatus.UPCOMING };
    }

    // 所有课程已结束
    return { type: 'all-ended' };
}

/**
 * 渲染课程卡片
 * @param {Object} course - 课程对象
 * @param {string} status - 课程状态
 * @returns {string} HTML 字符串
 */
function renderScheduleCard(course, status) {
    const statusText = status === CourseStatus.ONGOING ? '进行中' : '即将开始';

    return `
        <div class="schedule-card ${status}">
            <div class="schedule-course-name">${course.name}</div>
            <div class="schedule-location">${course.location}</div>
            <span class="schedule-status ${status}">${statusText}</span>
        </div>
    `;
}

/**
 * 渲染空状态
 * @param {string} type - 空状态类型（'no-courses' 或 'all-ended'）
 * @returns {string} HTML 字符串
 */
function renderEmptyState(type) {
    const content = type === 'no-courses'
        ? { icon: '📚', text: '今日无课' }
        : { icon: '✨', text: '今日课程已结束' };

    return `
        <div class="schedule-empty">
            <div class="schedule-empty-icon">${content.icon}</div>
            <div class="schedule-empty-text">${content.text}</div>
        </div>
    `;
}

/**
 * 刷新课表显示
 */
function refreshSchedule() {
    const container = document.getElementById('schedule-container');
    if (!container) return;

    const result = getCurrentCourse();

    if (result.type) {
        // 无课程或课程已结束
        container.innerHTML = renderEmptyState(result.type);
    } else {
        // 显示课程
        container.innerHTML = renderScheduleCard(result.course, result.status);
    }
}

/**
 * 初始化课表模块
 */
function initSchedule() {
    // 首次渲染
    refreshSchedule();

    // 设置定时刷新（每1分钟）
    let refreshInterval = setInterval(refreshSchedule, 60000);

    // 页面可见性检测
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面隐藏时，暂停刷新
            clearInterval(refreshInterval);
            refreshInterval = null;
        } else {
            // 页面可见时，立即刷新并恢复定时刷新
            refreshSchedule();
            if (!refreshInterval) {
                refreshInterval = setInterval(refreshSchedule, 60000);
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSchedule);
