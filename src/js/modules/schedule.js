/**
 * 课表显示模块
 * 功能：根据当前时间自动显示课程信息
 */

const Schedule = (function() {
    'use strict';

    // 课表数据
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
    ];

    // 课程状态枚举
    const CourseStatus = {
        ONGOING: 'ongoing',
        UPCOMING: 'upcoming',
        ENDED: 'ended'
    };

    // 刷新间隔（毫秒）
    const REFRESH_INTERVAL = 60000;

    // 刷新定时器
    let refreshInterval = null;

    /**
     * 时间字符串转分钟数
     * @param {string} timeStr - 时间字符串（格式："HH:MM"）
     * @returns {number}
     */
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * 获取课程状态
     * @param {Object} course - 课程对象
     * @param {Date} currentTime - 当前时间
     * @returns {string}
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
     * 获取今日课程
     * @returns {Array}
     */
    function getTodayCourses() {
        const today = new Date().getDay();
        const dayOfWeek = today === 0 ? 7 : today; // 将周日从 0 转换为 7
        return scheduleData.filter(course => course.dayOfWeek === dayOfWeek);
    }

    /**
     * 渲染课表
     */
    function render() {
        const container = document.getElementById('schedule-container');
        if (!container) return;

        const now = new Date();
        const courses = getTodayCourses();

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="schedule-empty">
                    <div class="schedule-empty-icon">📅</div>
                    <div class="schedule-empty-text">今日无课程安排</div>
                </div>
            `;
            return;
        }

        // 找出当前课程和下一节课
        let currentCourse = null;
        let nextCourse = null;

        for (const course of courses) {
            const status = getCourseStatus(course, now);
            if (status === CourseStatus.ONGOING) {
                currentCourse = course;
                break;
            } else if (status === CourseStatus.UPCOMING && !nextCourse) {
                nextCourse = course;
            }
        }

        // 渲染
        let html = '';

        if (currentCourse) {
            html = `
                <div class="schedule-card schedule-current">
                    <div class="schedule-status">进行中</div>
                    <div class="schedule-name">${currentCourse.name}</div>
                    <div class="schedule-info">
                        <span class="schedule-location">📍 ${currentCourse.location}</span>
                        <span class="schedule-time">🕐 ${currentCourse.startTime} - ${currentCourse.endTime}</span>
                    </div>
                </div>
            `;
        } else if (nextCourse) {
            html = `
                <div class="schedule-card schedule-next">
                    <div class="schedule-status">即将开始</div>
                    <div class="schedule-name">${nextCourse.name}</div>
                    <div class="schedule-info">
                        <span class="schedule-location">📍 ${nextCourse.location}</span>
                        <span class="schedule-time">🕐 ${nextCourse.startTime} - ${nextCourse.endTime}</span>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="schedule-card schedule-ended">
                    <div class="schedule-status">今日课程已结束</div>
                    <div class="schedule-name">休息一下吧 😊</div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * 开始自动刷新
     */
    function startAutoRefresh() {
        // 页面可见性检测
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(refreshInterval);
            } else {
                render();
                refreshInterval = setInterval(render, REFRESH_INTERVAL);
            }
        });

        // 启动刷新
        refreshInterval = setInterval(render, REFRESH_INTERVAL);
    }

    /**
     * 初始化
     */
    function init() {
        render();
        startAutoRefresh();
        console.log('[Schedule] 初始化完成');
    }

    // 公开 API
    return {
        init,
        render,
        getTodayCourses,
        getCourseStatus,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Schedule;
} else if (typeof window !== 'undefined') {
    window.Schedule = Schedule;
}
