/**
 * Ham - 个人主页脚本文件
 * 构建时间: 2026-03-06 02:53:41
 */

'use strict';

// ========== utils.js ==========
/**
 * 工具函数模块
 * 参考思源笔记的工具函数设计
 */

const Utils = (function() {
    

    /**
     * 动态加载脚本
     * 参考: siyuan/app/src/protyle/util/addScript.ts
     * @param {string} path - 脚本路径
     * @param {string} id - 脚本元素 ID
     * @returns {Promise<boolean>}
     */
    function addScript(path, id) {
        return new Promise((resolve) => {
            if (document.getElementById(id)) {
                // 脚本已加载
                resolve(false);
                return;
            }
            const scriptElement = document.createElement('script');
            scriptElement.src = path;
            scriptElement.async = true;
            document.head.appendChild(scriptElement);
            scriptElement.onload = () => {
                if (document.getElementById(id)) {
                    // 循环调用需清除 DOM 中的 script 标签
                    scriptElement.remove();
                    resolve(false);
                    return;
                }
                scriptElement.id = id;
                resolve(true);
            };
            scriptElement.onerror = () => {
                console.error(`[Utils] 脚本加载失败: ${path}`);
                resolve(false);
            };
        });
    }

    /**
     * 动态加载样式
     * 参考: siyuan/app/src/protyle/util/addStyle.ts
     * @param {string} path - 样式路径
     * @param {string} id - 样式元素 ID
     */
    function addStyle(path, id) {
        if (document.getElementById(id)) {
            return;
        }
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = path;
        linkElement.id = id;
        document.head.appendChild(linkElement);
    }

    /**
     * 获取最近的父元素（按属性）
     * 参考: siyuan/app/src/protyle/util/hasClosest.ts
     * @param {Element} element - 起始元素
     * @param {string} attrName - 属性名
     * @param {string} attrValue - 属性值（可选）
     * @returns {Element|false}
     */
    function hasClosestByAttribute(element, attrName, attrValue) {
        let current = element;
        while (current && current !== document.body) {
            if (attrValue) {
                if (current.getAttribute(attrName) === attrValue) {
                    return current;
                }
            } else {
                if (current.hasAttribute(attrName)) {
                    return current;
                }
            }
            current = current.parentElement;
        }
        return false;
    }

    /**
     * 获取最近的父元素（按类名）
     * @param {Element} element - 起始元素
     * @param {string} className - 类名
     * @returns {Element|false}
     */
    function hasClosestByClass(element, className) {
        let current = element;
        while (current && current !== document.body) {
            if (current.classList.contains(className)) {
                return current;
            }
            current = current.parentElement;
        }
        return false;
    }

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function}
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {Function}
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 请求缓存
     * 用于缓存 fetch 请求结果，避免重复请求
     */
    const fetchCache = new Map();

    /**
     * 带缓存的 fetch
     * @param {string} url - 请求 URL
     * @param {Object} options - fetch 选项
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Response>}
     */
    async function cachedFetch(url, options = {}, useCache = true) {
        const cacheKey = url + JSON.stringify(options);

        if (useCache && fetchCache.has(cacheKey)) {
            return fetchCache.get(cacheKey);
        }

        const response = await fetch(url, options);

        if (useCache && response.ok) {
            // 克隆响应以便缓存（响应只能读取一次）
            const clonedResponse = response.clone();
            fetchCache.set(cacheKey, clonedResponse);
        }

        return response;
    }

    /**
     * 清除请求缓存
     * @param {string} urlPattern - URL 模式（可选，不传则清除全部）
     */
    function clearFetchCache(urlPattern) {
        if (!urlPattern) {
            fetchCache.clear();
            return;
        }
        for (const key of fetchCache.keys()) {
            if (key.includes(urlPattern)) {
                fetchCache.delete(key);
            }
        }
    }

    /**
     * 并行执行多个 Promise
     * @param {Array<Function>} promiseFactories - 返回 Promise 的函数数组
     * @param {number} concurrency - 并发数
     * @returns {Promise<Array>}
     */
    async function parallel(promiseFactories, concurrency = 5) {
        const results = [];
        const executing = [];

        for (const factory of promiseFactories) {
            const promise = factory().then(result => {
                executing.splice(executing.indexOf(promise), 1);
                return result;
            });

            results.push(promise);
            executing.push(promise);

            if (executing.length >= concurrency) {
                await Promise.race(executing);
            }
        }

        return Promise.all(results);
    }

    /**
     * 安全地解析 JSON
     * @param {string} str - JSON 字符串
     * @param {*} defaultValue - 解析失败时的默认值
     * @returns {*}
     */
    function safeJSONParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * 转义 HTML
     * @param {string} str - 要转义的字符串
     * @returns {string}
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 反转义 HTML
     * @param {string} str - 要反转义的字符串
     * @returns {string}
     */
    function unescapeHTML(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }

    /**
     * 生成唯一 ID
     * @returns {string}
     */
    function genID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 检测深色模式
     * @returns {boolean}
     */
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * 监听深色模式变化
     * @param {Function} callback - 回调函数
     */
    function onDarkModeChange(callback) {
        if (!window.matchMedia) return;
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', callback);
    }

    // 公开 API
    return {
        addScript,
        addStyle,
        hasClosestByAttribute,
        hasClosestByClass,
        debounce,
        throttle,
        cachedFetch,
        clearFetchCache,
        parallel,
        safeJSONParse,
        escapeHTML,
        unescapeHTML,
        genID,
        isDarkMode,
        onDarkModeChange,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else if (typeof window !== 'undefined') {
    window.Utils = Utils;
}


// ========== modules/music-player.js ==========
/**
 * 音乐播放器模块
 * 功能：歌单循环播放、状态持久化
 */

const MusicPlayer = (function() {
    

    // 配置
    const config = {
        playlist: [
            './assets/audio/希林娜依高-微光星海.flac',
            './assets/audio/G.E.M.邓紫棋-光年之外.flac',
            './assets/audio/IU-에잇.flac',
            './assets/audio/情歌-梁静茹.flac',
            './assets/audio/當山みれい-願い〜あの頃のキミへ〜.flac'
        ],
        saveInterval: 5000, // 保存进度间隔（毫秒）
    };

    // 状态
    const state = {
        currentTrack: 0,
        lastSavedTime: 0,
        isPlaying: false,
    };

    // DOM 元素
    let audioElement = null;
    let toggleButton = null;
    let playIcon = null;
    let pauseIcon = null;

    /**
     * 更新图标状态
     * @param {boolean} playing - 是否正在播放
     */
    function updateIconState(playing) {
        if (!playIcon || !pauseIcon || !toggleButton) return;

        state.isPlaying = playing;

        if (playing) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            toggleButton.classList.add('playing');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            toggleButton.classList.remove('playing');
        }
    }

    /**
     * 加载指定曲目
     * @param {number} index - 曲目索引
     */
    function loadTrack(index) {
        if (!audioElement || index < 0 || index >= config.playlist.length) return;

        state.currentTrack = index;
        audioElement.src = config.playlist[state.currentTrack];
        audioElement.load();
    }

    /**
     * 播放下一首
     */
    function playNext() {
        state.currentTrack = (state.currentTrack + 1) % config.playlist.length;
        loadTrack(state.currentTrack);
        play();
    }

    /**
     * 播放
     */
    function play() {
        if (!audioElement) return;

        audioElement.play().catch(function(error) {
            console.error('[MusicPlayer] 播放失败:', error);
        });
    }

    /**
     * 暂停
     */
    function pause() {
        if (!audioElement) return;
        audioElement.pause();
    }

    /**
     * 切换播放/暂停
     */
    function toggle() {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    }

    /**
     * 保存播放状态
     */
    function saveState() {
        if (!audioElement) return;

        localStorage.setItem('musicTime', audioElement.currentTime.toString());
        localStorage.setItem('musicTrack', state.currentTrack.toString());
        localStorage.setItem('musicPlaying', state.isPlaying.toString());
    }

    /**
     * 恢复播放状态
     */
    function restoreState() {
        const savedTrack = parseInt(localStorage.getItem('musicTrack') || '0');
        const savedTime = parseFloat(localStorage.getItem('musicTime') || '0');
        const savedPlaying = localStorage.getItem('musicPlaying') === 'true';

        if (savedTrack >= 0 && savedTrack < config.playlist.length) {
            state.currentTrack = savedTrack;
            loadTrack(state.currentTrack);

            if (savedTime > 0) {
                audioElement.currentTime = savedTime;
            }

            if (savedPlaying) {
                play();
            }
        }
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        if (!audioElement || !toggleButton) return;

        // 播放状态变化
        audioElement.addEventListener('play', () => updateIconState(true));
        audioElement.addEventListener('pause', () => updateIconState(false));

        // 音频加载错误
        audioElement.addEventListener('error', function(e) {
            console.error('[MusicPlayer] 音频加载错误:', e);
            playNext();
        });

        // 播放结束
        audioElement.addEventListener('ended', playNext);

        // 点击切换
        toggleButton.addEventListener('click', toggle);

        // 保存播放进度（节流）
        audioElement.addEventListener('timeupdate', Utils.throttle(function() {
            const currentTime = audioElement.currentTime;
            if (currentTime - state.lastSavedTime > config.saveInterval / 1000 || state.lastSavedTime > currentTime) {
                saveState();
                state.lastSavedTime = currentTime;
            }
        }, config.saveInterval));

        // 页面离开时保存状态
        window.addEventListener('beforeunload', saveState);
    }

    /**
     * 初始化
     */
    function init() {
        audioElement = document.getElementById('bgMusic');
        toggleButton = document.getElementById('musicToggle');
        playIcon = document.querySelector('.play-icon');
        pauseIcon = document.querySelector('.pause-icon');

        if (!audioElement || !toggleButton) {
            console.log('[MusicPlayer] 未找到音乐播放器元素');
            return;
        }

        bindEvents();
        restoreState();

        console.log('[MusicPlayer] 初始化完成');
    }

    // 公开 API
    return {
        init,
        play,
        pause,
        toggle,
        playNext,
        loadTrack,
        saveState,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicPlayer;
} else if (typeof window !== 'undefined') {
    window.MusicPlayer = MusicPlayer;
}


// ========== modules/schedule.js ==========
/**
 * 课表显示模块
 * 功能：根据当前时间自动显示课程信息
 */

const Schedule = (function() {
    

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


// ========== modules/interests.js ==========
/**
 * 关注内容模块
 * 功能：展示用户关注的内容分类和详情
 */

const Interests = (function() {
    

    // 数据缓存
    let interestsData = null;

    /**
     * 加载数据
     */
    async function loadData() {
        const grid = document.getElementById('interests-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="interest-loading">
                <div class="interest-loading-spinner"></div>
                <div class="interest-loading-text">加载中...</div>
            </div>
        `;

        try {
            const response = await fetch('./data/interests.json?v=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            interestsData = await response.json();
            renderCards();
        } catch (error) {
            console.error('[Interests] 加载数据失败:', error);
            grid.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">⚠️</div>
                    <div class="interest-empty-text">数据加载失败</div>
                    <div class="interest-empty-detail">错误: ${error.message}</div>
                    <button class="interest-retry-btn" onclick="Interests.loadData()">重试</button>
                </div>
            `;
        }
    }

    /**
     * 渲染卡片
     */
    function renderCards() {
        const grid = document.getElementById('interests-grid');
        if (!grid || !interestsData) return;

        const categories = interestsData.categories;

        if (categories.length === 0) {
            grid.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">📭</div>
                    <div class="interest-empty-text">暂无关注内容</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = categories.map(category => `
            <div class="interest-card" data-category-id="${category.id}">
                <span class="interest-card-count">${category.items.length}</span>
                <span class="interest-card-icon">${category.icon}</span>
                <div class="interest-card-title">${category.name}</div>
                <div class="interest-card-desc">${category.description}</div>
            </div>
        `).join('');

        // 绑定点击事件
        grid.querySelectorAll('.interest-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                openModal(categoryId);
            });
        });
    }

    /**
     * 打开模态框
     */
    function openModal(categoryId) {
        const category = interestsData.categories.find(c => c.id === categoryId);
        if (!category) return;

        const overlay = document.getElementById('modal-overlay');
        const icon = document.getElementById('modal-icon');
        const titleText = document.getElementById('modal-title-text');
        const body = document.getElementById('modal-body');

        icon.textContent = category.icon;
        titleText.textContent = category.name;

        if (category.items.length === 0) {
            body.innerHTML = `
                <div class="interest-empty">
                    <div class="interest-empty-icon">📭</div>
                    <div class="interest-empty-text">该分类下暂无内容</div>
                </div>
            `;
        } else {
            body.innerHTML = category.items.map(item => `
                <div class="interest-item" data-item-title="${item.title}">
                    <div class="interest-item-title">${item.title}</div>
                    ${item.subtitle ? `<div class="interest-item-subtitle">${item.subtitle}</div>` : ''}
                    ${item.content ? `<div class="interest-item-content">${item.content}</div>` : ''}
                    ${item.rating ? `<div class="interest-item-rating">${item.rating}</div>` : ''}
                    ${item.hasImage && item.imagePath ? `
                        <img src="${item.imagePath}" alt="${item.title}" class="interest-item-image"
                             onerror="this.style.display='none'">
                    ` : ''}
                    ${item.hasSiyuanNote && item.siyuanNotePath ? `
                        <div class="sy-note-container" data-sy-path="${item.siyuanNotePath}">
                            <div class="sy-loading">加载笔记中...</div>
                        </div>
                    ` : ''}
                    ${item.hasSiyuanNotebook && item.siyuanNotebookPath ? `
                        <div class="sy-notebook-container" data-notebook-path="${item.siyuanNotebookPath}" data-notebook-title="${item.title}">
                            <div class="sy-loading">加载笔记本中...</div>
                        </div>
                    ` : ''}
                </div>
            `).join('');

            // 加载思源笔记内容
            body.querySelectorAll('.sy-note-container').forEach(container => {
                const syPath = container.dataset.syPath;
                if (syPath && typeof SiyuanRenderer !== 'undefined') {
                    SiyuanRenderer.loadAndRender(syPath, container);
                }
            });

            // 加载思源笔记本
            body.querySelectorAll('.sy-notebook-container').forEach(container => {
                const notebookPath = container.dataset.notebookPath;
                const notebookTitle = container.dataset.notebookTitle;
                if (notebookPath) {
                    loadSiyuanNotebook(notebookPath, container, notebookTitle);
                }
            });
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭模态框
     */
    function closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * 加载思源笔记本
     */
    async function loadSiyuanNotebook(notebookPath, container, notebookTitle) {
        let targetContainer = container;
        if (container.classList && container.classList.contains('sy-error')) {
            targetContainer = container.parentElement;
        }

        targetContainer.innerHTML = '<div class="sy-loading">加载笔记本中...</div>';

        try {
            const sortUrl = `${notebookPath}/.siyuan/sort.json?v=${Date.now()}`;
            const sortResponse = await fetch(sortUrl);

            if (!sortResponse.ok) {
                targetContainer.innerHTML = `
                    <div class="sy-error">
                        <div class="sy-error-title">无法加载笔记本目录</div>
                        <div class="sy-error-detail">路径: ${sortUrl}</div>
                        <div class="sy-error-detail">状态: HTTP ${sortResponse.status}</div>
                        <button class="sy-retry-btn" data-notebook-path="${notebookPath}" data-notebook-title="${notebookTitle}">重试</button>
                    </div>
                `;
                return;
            }

            const sortData = await sortResponse.json();
            const notes = [];

            // 并行加载笔记
            const loadPromises = Object.entries(sortData).map(async ([noteId, sortOrder]) => {
                const notePath = `${notebookPath}/${noteId}.sy`;
                try {
                    const noteResponse = await fetch(notePath);
                    if (noteResponse.ok) {
                        const noteData = await noteResponse.json();
                        const title = noteData?.Properties?.title || noteId;

                        const subDirPath = `${notebookPath}/${noteId}`;
                        const subNotes = await loadSubDirectoryNotes(subDirPath, notebookPath);

                        return {
                            id: noteId,
                            title: title,
                            path: notePath,
                            order: sortOrder,
                            hasChildren: subNotes.length > 0,
                            children: subNotes
                        };
                    }
                } catch (e) {
                    console.warn('[Interests] 笔记加载异常:', notePath, e);
                }
                return null;
            });

            const results = await Promise.all(loadPromises);
            for (const note of results) {
                if (note) {
                    notes.push(note);
                }
            }

            // 排序
            notes.sort((a, b) => a.order - b.order);

            if (notes.length === 0) {
                targetContainer.innerHTML = '<div class="sy-empty">笔记本为空</div>';
                return;
            }

            renderNestedNotebookTabs(notes, targetContainer, notebookPath);

        } catch (error) {
            console.error('[Interests] 加载笔记本失败:', error);
            targetContainer.innerHTML = `
                <div class="sy-error">
                    <div class="sy-error-title">加载笔记本失败</div>
                    <div class="sy-error-detail">错误: ${error.message}</div>
                    <button class="sy-retry-btn" data-notebook-path="${notebookPath}" data-notebook-title="${notebookTitle}">重试</button>
                </div>
            `;
        }
    }

    /**
     * 加载子目录笔记
     */
    async function loadSubDirectoryNotes(subDirPath, basePath) {
        const subNotes = [];

        try {
            const subSortUrl = `${subDirPath}/.siyuan/sort.json?v=${Date.now()}`;
            const subSortResponse = await fetch(subSortUrl);

            if (subSortResponse.ok) {
                const subSortData = await subSortResponse.json();

                // 并行加载
                const loadPromises = Object.entries(subSortData).map(async ([noteId, sortOrder]) => {
                    const notePath = `${subDirPath}/${noteId}.sy`;
                    try {
                        const noteResponse = await fetch(notePath);
                        if (noteResponse.ok) {
                            const noteData = await noteResponse.json();
                            const title = noteData?.Properties?.title || noteId;
                            return {
                                id: noteId,
                                title: title,
                                path: notePath,
                                order: sortOrder
                            };
                        }
                    } catch (e) {
                        // 忽略
                    }
                    return null;
                });

                const results = await Promise.all(loadPromises);
                for (const note of results) {
                    if (note) {
                        subNotes.push(note);
                    }
                }

                subNotes.sort((a, b) => a.order - b.order);
            }
        } catch (e) {
            // 忽略
        }

        return subNotes;
    }

    /**
     * 渲染嵌套标签页
     */
    function renderNestedNotebookTabs(notes, container, notebookPath) {
        const hasNested = notes.some(n => n.hasChildren && n.children.length > 0);

        if (!hasNested) {
            renderSimpleTabs(notes, container);
            return;
        }

        container.innerHTML = `
            <div class="sy-notebook sy-notebook-nested">
                <div class="sy-tabs sy-tabs-primary">
                    ${notes.map((note, index) => `
                        <button class="sy-tab ${index === 0 ? 'active' : ''}"
                                data-note-index="${index}"
                                data-has-children="${note.hasChildren}">
                            ${note.title}
                            ${note.hasChildren ? '<span class="sy-tab-arrow">▼</span>' : ''}
                        </button>
                    `).join('')}
                </div>
                <div class="sy-tabs-secondary-container"></div>
                <div class="sy-tab-content">
                    <div class="sy-note-content" data-note-index="0">
                        <div class="sy-loading">加载中...</div>
                    </div>
                </div>
            </div>
        `;

        const firstNote = notes[0];
        initNoteDisplay(container, firstNote, 0, notebookPath);

        container.querySelectorAll('.sy-tabs-primary .sy-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const noteIndex = parseInt(tab.dataset.noteIndex);
                const note = notes[noteIndex];

                container.querySelectorAll('.sy-tabs-primary .sy-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                initNoteDisplay(container, note, noteIndex, notebookPath);
            });
        });
    }

    /**
     * 初始化笔记显示
     */
    function initNoteDisplay(container, note, noteIndex, notebookPath) {
        const secondaryContainer = container.querySelector('.sy-tabs-secondary-container');
        const contentArea = container.querySelector('.sy-tab-content');

        contentArea.innerHTML = '';

        if (note.hasChildren && note.children.length > 0) {
            secondaryContainer.innerHTML = `
                <div class="sy-tabs sy-tabs-secondary">
                    ${note.children.map((child, childIndex) => `
                        <button class="sy-tab ${childIndex === 0 ? 'active' : ''}"
                                data-note-path="${child.path}"
                                data-child-index="${childIndex}">
                            ${child.title}
                        </button>
                    `).join('')}
                </div>
            `;

            const firstChild = note.children[0];
            const contentDiv = document.createElement('div');
            contentDiv.className = 'sy-note-content';
            contentDiv.dataset.noteIndex = noteIndex;
            contentDiv.dataset.childIndex = '0';
            contentDiv.innerHTML = '<div class="sy-loading">加载中...</div>';
            contentArea.appendChild(contentDiv);

            if (typeof SiyuanRenderer !== 'undefined') {
                SiyuanRenderer.loadAndRender(firstChild.path, contentDiv);
            }

            secondaryContainer.querySelectorAll('.sy-tab').forEach(childTab => {
                childTab.addEventListener('click', () => {
                    secondaryContainer.querySelectorAll('.sy-tab').forEach(t => t.classList.remove('active'));
                    childTab.classList.add('active');

                    const childPath = childTab.dataset.notePath;
                    const childIndex = childTab.dataset.childIndex;

                    contentArea.innerHTML = `
                        <div class="sy-note-content" data-note-index="${noteIndex}" data-child-index="${childIndex}">
                            <div class="sy-loading">加载中...</div>
                        </div>
                    `;

                    if (typeof SiyuanRenderer !== 'undefined') {
                        SiyuanRenderer.loadAndRender(childPath, contentArea.querySelector('.sy-note-content'));
                    }
                });
            });
        } else {
            secondaryContainer.innerHTML = '';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'sy-note-content';
            contentDiv.dataset.noteIndex = noteIndex;
            contentDiv.innerHTML = '<div class="sy-loading">加载中...</div>';
            contentArea.appendChild(contentDiv);

            if (typeof SiyuanRenderer !== 'undefined') {
                SiyuanRenderer.loadAndRender(note.path, contentDiv);
            }
        }
    }

    /**
     * 渲染简单标签页
     */
    function renderSimpleTabs(notes, container) {
        container.innerHTML = `
            <div class="sy-notebook">
                <div class="sy-tabs">
                    ${notes.map((note, index) => `
                        <button class="sy-tab ${index === 0 ? 'active' : ''}" data-note-path="${note.path}" data-note-index="${index}">
                            ${note.title}
                        </button>
                    `).join('')}
                </div>
                <div class="sy-tab-content">
                    <div class="sy-note-content" data-note-index="0">
                        <div class="sy-loading">加载中...</div>
                    </div>
                </div>
            </div>
        `;

        const firstNotePath = notes[0].path;
        const contentContainer = container.querySelector('.sy-note-content');
        if (typeof SiyuanRenderer !== 'undefined') {
            SiyuanRenderer.loadAndRender(firstNotePath, contentContainer);
        }

        container.querySelectorAll('.sy-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.sy-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const notePath = tab.dataset.notePath;
                const noteIndex = tab.dataset.noteIndex;
                const contentArea = container.querySelector('.sy-tab-content');

                let contentDiv = container.querySelector(`.sy-note-content[data-note-index="${noteIndex}"]`);
                if (!contentDiv) {
                    container.querySelectorAll('.sy-note-content').forEach(c => c.style.display = 'none');
                    contentDiv = document.createElement('div');
                    contentDiv.className = 'sy-note-content';
                    contentDiv.dataset.noteIndex = noteIndex;
                    contentDiv.innerHTML = '<div class="sy-loading">加载中...</div>';
                    contentArea.appendChild(contentDiv);

                    if (typeof SiyuanRenderer !== 'undefined') {
                        SiyuanRenderer.loadAndRender(notePath, contentDiv);
                    }
                } else {
                    container.querySelectorAll('.sy-note-content').forEach(c => c.style.display = 'none');
                    contentDiv.style.display = 'block';
                }
            });
        });
    }

    /**
     * 初始化
     */
    function init() {
        loadData();

        // 关闭按钮
        const closeBtn = document.getElementById('modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // 点击遮罩关闭
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                // 重试按钮
                const retryBtn = e.target.closest('.sy-retry-btn');
                if (retryBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const notebookPath = retryBtn.dataset.notebookPath;
                    const notebookTitle = retryBtn.dataset.notebookTitle;
                    const container = retryBtn.closest('.sy-notebook-container');
                    if (container && notebookPath) {
                        loadSiyuanNotebook(notebookPath, container, notebookTitle);
                    }
                    return;
                }

                if (e.target === overlay) {
                    closeModal();
                }
            });
        }

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    // 公开 API
    return {
        init,
        loadData,
        openModal,
        closeModal,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interests;
} else if (typeof window !== 'undefined') {
    window.Interests = Interests;
}


// ========== renderers/siyuan-renderer.js ==========
/**
 * 思源笔记渲染器
 * 参考: siyuan/app/src/protyle/render/
 *
 * 功能特性：
 * - 支持多种节点类型渲染
 * - 数学公式渲染（KaTeX）
 * - 代码高亮（Highlight.js）
 * - 标题折叠/展开
 * - 请求缓存
 */

const SiyuanRenderer = (function() {
    

    // 配置
    const config = {
        collapsible: true,
        cdn: 'https://cdn.jsdelivr.net/npm',
        katexVersion: '0.16.9',
        hljsVersion: '11.9.0',
    };

    // 缓存
    const docCache = new Map();
    const scriptLoaded = {
        katex: false,
        hljs: false,
    };

    /**
     * 加载 KaTeX
     * 参考: siyuan/app/src/protyle/render/mathRender.ts
     */
    async function loadKatex() {
        if (scriptLoaded.katex || typeof window.katex !== 'undefined') {
            scriptLoaded.katex = true;
            return;
        }

        // 加载样式
        Utils.addStyle(
            `${config.cdn}/katex@${config.katexVersion}/dist/katex.min.css`,
            'katex-style'
        );

        // 加载脚本
        await Utils.addScript(
            `${config.cdn}/katex@${config.katexVersion}/dist/katex.min.js`,
            'katex-script'
        );

        scriptLoaded.katex = true;
    }

    /**
     * 加载 Highlight.js
     * 参考: siyuan/app/src/protyle/render/highlightRender.ts
     */
    async function loadHighlight() {
        if (scriptLoaded.hljs || typeof window.hljs !== 'undefined') {
            scriptLoaded.hljs = true;
            return;
        }

        // 加载样式
        Utils.addStyle(
            `${config.cdn}/highlight.js@${config.hljsVersion}/styles/github-dark.min.css`,
            'hljs-style'
        );

        // 加载脚本
        await Utils.addScript(
            `${config.cdn}/highlight.js@${config.hljsVersion}/lib/highlight.min.js`,
            'hljs-script'
        );

        scriptLoaded.hljs = true;
    }

    /**
     * 渲染数学公式
     * @param {string} content - 公式内容
     * @param {HTMLElement} container - 容器元素
     * @param {boolean} displayMode - 是否为块级公式
     */
    async function renderMath(content, container, displayMode = true) {
        await loadKatex();

        if (typeof window.katex === 'undefined') {
            container.textContent = displayMode ? `$$${content}$$` : `$${content}$`;
            return;
        }

        try {
            window.katex.render(content, container, {
                displayMode,
                throwOnError: false,
                trust: true,
            });
        } catch (e) {
            container.textContent = displayMode ? `$$${content}$$` : `$${content}$`;
            console.warn('[SiyuanRenderer] KaTeX 渲染失败:', e);
        }
    }

    /**
     * 渲染代码块
     * @param {string} code - 代码内容
     * @param {string} language - 语言
     * @param {HTMLElement} container - 容器元素
     */
    async function renderCode(code, language, container) {
        await loadHighlight();

        const pre = document.createElement('pre');
        pre.className = 'sy-code-block';

        const codeEl = document.createElement('code');
        if (language) {
            codeEl.className = `language-${language}`;
        }

        codeEl.textContent = code;
        pre.appendChild(codeEl);
        container.appendChild(pre);

        if (typeof window.hljs !== 'undefined') {
            window.hljs.highlightElement(codeEl);
        }
    }

    /**
     * 渲染节点
     * @param {Object} node - 节点数据
     * @returns {HTMLElement|null}
     */
    function renderNode(node) {
        if (!node || !node.Type) return null;

        switch (node.Type) {
            case 'NodeDocument':
                return renderDocumentNode(node);
            case 'NodeHeading':
                return renderHeading(node);
            case 'NodeParagraph':
                return renderParagraph(node);
            case 'NodeList':
                return renderList(node);
            case 'NodeListItem':
                return renderListItem(node);
            case 'NodeBlockquote':
                return renderBlockquote(node);
            case 'NodeMathBlock':
                return renderMathBlock(node);
            case 'NodeCodeBlock':
                return renderCodeBlock(node);
            case 'NodeTable':
                return renderTable(node);
            case 'NodeThematicBreak':
                return renderThematicBreak();
            case 'NodeSuperBlock':
                return renderSuperBlock(node);
            default:
                return null;
        }
    }

    function renderDocumentNode(node) {
        const container = document.createElement('div');
        container.className = 'sy-document-content';
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) container.appendChild(el);
            }
        }
        return container;
    }

    function renderHeading(node) {
        const level = node.HeadingLevel || 1;
        const heading = document.createElement(`h${level}`);
        heading.className = 'sy-heading';
        heading.dataset.nodeId = node.ID;

        if (node.Properties?.fold === '1') {
            heading.classList.add('sy-heading-collapsed');
        }

        if (node.Children) {
            for (const child of node.Children) {
                const inline = renderInlineNode(child);
                if (inline) heading.appendChild(inline);
            }
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'sy-heading-wrapper';
        wrapper.appendChild(heading);

        // 折叠按钮
        const toggle = document.createElement('span');
        toggle.className = 'sy-heading-toggle';
        toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M7 10l5 5 5-5z"/></svg>';
        heading.insertBefore(toggle, heading.firstChild);

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHeadingCollapse(wrapper, level);
        });

        return wrapper;
    }

    function toggleHeadingCollapse(wrapper, level) {
        const heading = wrapper.querySelector('.sy-heading');
        const isCollapsed = heading.classList.contains('sy-heading-collapsed');

        if (isCollapsed) {
            heading.classList.remove('sy-heading-collapsed');
            showContentUntilNextHeading(wrapper, level, true);
        } else {
            heading.classList.add('sy-heading-collapsed');
            showContentUntilNextHeading(wrapper, level, false);
        }
    }

    function showContentUntilNextHeading(wrapper, level, show) {
        let sibling = wrapper.nextElementSibling;
        while (sibling) {
            const siblingHeading = sibling.querySelector('.sy-heading');
            if (siblingHeading) {
                const siblingLevel = parseInt(siblingHeading.tagName.substring(1));
                if (siblingLevel <= level) break;
            }
            sibling.classList.toggle('sy-content-hidden', !show);
            sibling = sibling.nextElementSibling;
        }
    }

    function renderParagraph(node) {
        const p = document.createElement('p');
        p.className = 'sy-paragraph';
        p.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const inline = renderInlineNode(child);
                if (inline) p.appendChild(inline);
            }
        }
        return p;
    }

    function renderList(node) {
        const isOrdered = node.ListData?.Typ === 1;
        const list = document.createElement(isOrdered ? 'ol' : 'ul');
        list.className = 'sy-list';
        list.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) list.appendChild(el);
            }
        }
        return list;
    }

    function renderListItem(node) {
        const li = document.createElement('li');
        li.className = 'sy-list-item';
        li.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) li.appendChild(el);
            }
        }
        return li;
    }

    function renderBlockquote(node) {
        const bq = document.createElement('blockquote');
        bq.className = 'sy-blockquote';
        bq.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) bq.appendChild(el);
            }
        }
        return bq;
    }

    function renderMathBlock(node) {
        const div = document.createElement('div');
        div.className = 'sy-math-block';
        div.dataset.nodeId = node.ID;

        let mathContent = '';
        if (node.Children) {
            for (const child of node.Children) {
                if (child.Type === 'NodeMathBlockContent') {
                    mathContent += child.Data || '';
                }
            }
        }

        if (mathContent) {
            renderMath(mathContent, div, true);
        }

        return div;
    }

    function renderCodeBlock(node) {
        const container = document.createElement('div');
        container.className = 'sy-code-block-container';
        container.dataset.nodeId = node.ID;

        let codeContent = '';
        if (node.Children) {
            for (const child of node.Children) {
                if (child.Type === 'NodeCodeBlockCode') {
                    codeContent += child.Data || '';
                }
            }
        }

        renderCode(codeContent, node.Language, container);

        return container;
    }

    function renderTable(node) {
        const table = document.createElement('table');
        table.className = 'sy-table';
        table.dataset.nodeId = node.ID;

        if (node.Children) {
            const tbody = document.createElement('tbody');
            for (const child of node.Children) {
                if (child.Type === 'NodeTableRow') {
                    const tr = document.createElement('tr');
                    if (child.Children) {
                        for (const cell of child.Children) {
                            if (cell.Type === 'NodeTableCell') {
                                const td = document.createElement('td');
                                if (cell.Children) {
                                    for (const inline of cell.Children) {
                                        const el = renderInlineNode(inline);
                                        if (el) td.appendChild(el);
                                    }
                                }
                                tr.appendChild(td);
                            }
                        }
                    }
                    tbody.appendChild(tr);
                }
            }
            table.appendChild(tbody);
        }
        return table;
    }

    function renderThematicBreak() {
        const hr = document.createElement('hr');
        hr.className = 'sy-thematic-break';
        return hr;
    }

    function renderSuperBlock(node) {
        const div = document.createElement('div');
        div.className = 'sy-super-block';
        div.dataset.nodeId = node.ID;
        if (node.Children) {
            for (const child of node.Children) {
                const el = renderNode(child);
                if (el) div.appendChild(el);
            }
        }
        return div;
    }

    function renderInlineNode(node) {
        if (!node) return null;

        switch (node.Type) {
            case 'NodeText':
                return document.createTextNode(node.Data || '');
            case 'NodeTextMark':
                return renderTextMark(node);
            case 'NodeBackslash':
                if (node.Children && node.Children[0]?.Type === 'NodeBackslashContent') {
                    return document.createTextNode(node.Children[0].Data || '');
                }
                return document.createTextNode('');
            case 'NodeCodeSpan':
                const code = document.createElement('code');
                code.className = 'sy-code-inline';
                code.textContent = node.Data || '';
                return code;
            default:
                if (node.Children) {
                    const span = document.createElement('span');
                    for (const child of node.Children) {
                        const el = renderInlineNode(child);
                        if (el) span.appendChild(el);
                    }
                    return span;
                }
                return document.createTextNode(node.Data || '');
        }
    }

    function renderTextMark(node) {
        const type = node.TextMarkType || '';
        const content = node.TextMarkTextContent || '';
        const types = type.split(' ');

        let element = document.createTextNode(content);

        for (const t of types) {
            switch (t) {
                case 'strong':
                    const strong = document.createElement('strong');
                    strong.appendChild(element);
                    element = strong;
                    break;
                case 'em':
                    const em = document.createElement('em');
                    em.appendChild(element);
                    element = em;
                    break;
                case 'u':
                    const u = document.createElement('u');
                    u.appendChild(element);
                    element = u;
                    break;
                case 's':
                    const s = document.createElement('s');
                    s.appendChild(element);
                    element = s;
                    break;
                case 'mark':
                    const mark = document.createElement('mark');
                    mark.className = 'sy-mark';
                    mark.appendChild(element);
                    element = mark;
                    break;
                case 'code':
                    const code = document.createElement('code');
                    code.className = 'sy-code-inline';
                    code.appendChild(element);
                    element = code;
                    break;
                case 'a':
                    const a = document.createElement('a');
                    a.href = node.TextMarkAHref || '#';
                    a.target = '_blank';
                    a.className = 'sy-link';
                    a.appendChild(element);
                    element = a;
                    break;
                case 'block-ref':
                    const ref = document.createElement('span');
                    ref.className = 'sy-block-ref';
                    ref.dataset.refId = node.TextMarkBlockRefID || '';
                    ref.appendChild(element);
                    element = ref;
                    break;
                case 'sup':
                    const sup = document.createElement('sup');
                    sup.appendChild(element);
                    element = sup;
                    break;
                case 'sub':
                    const sub = document.createElement('sub');
                    sub.appendChild(element);
                    element = sub;
                    break;
                case 'tag':
                    const tag = document.createElement('span');
                    tag.className = 'sy-tag';
                    tag.appendChild(element);
                    element = tag;
                    break;
            }
        }
        return element;
    }

    /**
     * 渲染文档
     * @param {Object} syData - 思源文档数据
     * @param {HTMLElement} container - 容器元素
     */
    function render(syData, container) {
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();

            // 渲染文档标题
            if (syData.Properties?.title) {
                const title = document.createElement('h1');
                title.className = 'sy-doc-title';
                title.textContent = syData.Properties.title;
                fragment.appendChild(title);
            }

            // 渲染子节点
            if (syData.Children && syData.Children.length > 0) {
                for (const child of syData.Children) {
                    const element = renderNode(child);
                    if (element) {
                        fragment.appendChild(element);
                    }
                }
            }

            container.innerHTML = '';
            container.appendChild(fragment);
        });
    }

    /**
     * 加载并渲染文档（带缓存）
     * @param {string} url - 文档 URL
     * @param {HTMLElement} container - 容器元素
     */
    async function loadAndRender(url, container) {
        // 检查缓存
        if (docCache.has(url)) {
            render(docCache.get(url), container);
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // 缓存数据
            docCache.set(url, data);

            render(data, container);
        } catch (error) {
            console.error('[SiyuanRenderer] 加载文档失败:', error);
            container.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 获取文档标题
     * @param {Object} syData - 思源文档数据
     * @returns {string}
     */
    function getTitle(syData) {
        return syData?.Properties?.title || '未命名文档';
    }

    /**
     * 配置
     * @param {Object} options - 配置选项
     */
    function configure(options) {
        Object.assign(config, options);
    }

    /**
     * 清除缓存
     */
    function clearCache() {
        docCache.clear();
    }

    // 公开 API
    return {
        render,
        loadAndRender,
        getTitle,
        configure,
        clearCache,
        loadKatex,
        loadHighlight,
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiyuanRenderer;
} else if (typeof window !== 'undefined') {
    window.SiyuanRenderer = SiyuanRenderer;
}


// ========== renderers/siyuan-card.js ==========
/**
 * 思源笔记卡片渲染器
 * 参考: siyuan/app/src/protyle/
 *
 * 功能特性：
 * - 文档树导航
 * - 思源风格渲染
 * - 标题折叠/展开
 * - 请求缓存
 * - 并行加载
 */

const SiyuanCard = (function() {
    

    // 获取基础路径（支持 GitHub Pages 子目录）
    function getBasePath() {
        const path = window.location.pathname;
        // 如果是 GitHub Pages 子目录（如 /ham/），返回子目录路径
        if (path !== '/' && path.endsWith('/')) {
            return path.slice(0, -1);
        }
        // 如果是 index.html 结尾
        if (path.endsWith('index.html')) {
            return path.substring(0, path.lastIndexOf('/'));
        }
        return '';
    }

    // 配置
    let config = {
        notebookPath: getBasePath() + '/data/siyuan',
        defaultNotebook: '20260303125754-igehgl8',
    };

    // 状态
    let state = {
        currentNotebook: null,
        currentDoc: null,
        expandedNodes: new Set(),
    };

    // 文档缓存
    const docCache = new Map();

    // 已知的目录结构
    const knownStructure = {
        '20260303125754-igehgl8': {
            name: '大三下',
            subDirs: ['20260214081507-0j2zcju'],
            childDocs: {
                '20260214081507-0j2zcju': [
                    '20260214214126-ot1y6sc',
                    '20260214223131-27ze0lr',
                    '20260214225220-6tab0f8',
                    '20260215135533-yym375g',
                    '20260215152537-mz9li80',
                    '20260215153352-rf286lw',
                    '20260305143459-uj111aq'
                ]
            }
        }
    };

    /**
     * 初始化
     */
    function init(container, options = {}) {
        config = { ...config, ...options };

        // 创建卡片结构
        container.innerHTML = `
            <div class="sy-card">
                <div class="sy-card-header">
                    <div class="sy-card-title">
                        <svg class="sy-card-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        </svg>
                        <span>思源</span>
                    </div>
                    <div class="sy-card-actions">
                        <button class="sy-btn sy-btn-icon" id="sy-refresh" title="刷新">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="sy-card-body">
                    <div class="sy-sidebar">
                        <div class="sy-tree-header">
                            <span>文档树</span>
                        </div>
                        <div class="sy-tree-container" id="sy-tree">
                            <div class="sy-loading">加载中...</div>
                        </div>
                    </div>
                    <div class="sy-content">
                        <div class="sy-content-header">
                            <div class="sy-breadcrumb" id="sy-breadcrumb"></div>
                        </div>
                        <div class="sy-content-body" id="sy-content">
                            <div class="sy-empty">请从左侧选择文档</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        bindEvents(container);
        loadNotebooks();
    }

    /**
     * 绑定事件
     */
    function bindEvents(container) {
        // 刷新按钮
        const refreshBtn = container.querySelector('#sy-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                clearCache();
                loadNotebooks();
            });
        }

        // 文档树点击事件（事件委托）
        const treeContainer = container.querySelector('#sy-tree');
        if (treeContainer) {
            treeContainer.addEventListener('click', (e) => {
                const treeItem = e.target.closest('.sy-tree-item');
                if (!treeItem) return;

                const toggle = e.target.closest('.sy-tree-toggle');
                if (toggle) {
                    toggleTreeNode(treeItem);
                    return;
                }

                const docId = treeItem.dataset.docId;
                const notebookId = treeItem.dataset.notebookId;
                if (docId && notebookId) {
                    loadDocument(notebookId, docId);
                    setActiveTreeItem(treeItem);
                }
            });
        }
    }

    /**
     * 加载笔记本列表
     */
    async function loadNotebooks() {
        const treeContainer = document.getElementById('sy-tree');
        if (!treeContainer) return;

        treeContainer.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const notebooks = await fetchNotebooks();

            if (notebooks.length === 0) {
                treeContainer.innerHTML = '<div class="sy-empty">暂无笔记本</div>';
                return;
            }

            // 渲染笔记本列表
            let html = '<ul class="sy-tree">';
            for (const notebook of notebooks) {
                html += `
                    <li class="sy-tree-item sy-tree-notebook" data-notebook-id="${notebook.id}">
                        <span class="sy-tree-toggle">
                            <svg class="sy-tree-arrow" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                        </span>
                        <svg class="sy-tree-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                        </svg>
                        <span class="sy-tree-text">${notebook.name}</span>
                    </li>
                    <ul class="sy-tree-children" data-parent="${notebook.id}" style="display: none;"></ul>
                `;
            }
            html += '</ul>';
            treeContainer.innerHTML = html;

            // 绑定笔记本展开事件
            treeContainer.querySelectorAll('.sy-tree-notebook').forEach(item => {
                const toggle = item.querySelector('.sy-tree-toggle');
                if (toggle) {
                    toggle.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const notebookId = item.dataset.notebookId;

                        const childrenContainer = treeContainer.querySelector(`ul[data-parent="${notebookId}"]`);

                        if (item.classList.contains('sy-tree-expanded')) {
                            item.classList.remove('sy-tree-expanded');
                            childrenContainer.style.display = 'none';
                        } else {
                            item.classList.add('sy-tree-expanded');
                            childrenContainer.style.display = 'block';

                            if (childrenContainer.children.length === 0) {
                                await loadNotebookDocs(notebookId, childrenContainer);
                            }
                        }
                    });
                }
            });

        } catch (error) {
            console.error('[SiyuanCard] 加载笔记本失败:', error);
            treeContainer.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 加载笔记本内的文档列表（并行加载）
     */
    async function loadNotebookDocs(notebookId, container) {
        container.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const docs = await fetchNotebookDocs(notebookId);

            if (docs.length === 0) {
                container.innerHTML = '<li class="sy-tree-empty">暂无文档</li>';
                return;
            }

            let html = '';
            for (const doc of docs) {
                html += renderTreeItem(doc, notebookId, 0);
            }
            container.innerHTML = html;

        } catch (error) {
            console.error('[SiyuanCard] 加载文档列表失败:', error);
            container.innerHTML = '<li class="sy-error">加载失败</li>';
        }
    }

    /**
     * 渲染树节点
     */
    function renderTreeItem(doc, notebookId, depth) {
        const hasChildren = doc.children && doc.children.length > 0;
        const indent = depth * 18;

        let html = `
            <li class="sy-tree-item ${hasChildren ? 'sy-tree-has-children' : ''}"
                data-doc-id="${doc.id}"
                data-notebook-id="${notebookId}"
                style="--sy-indent: ${indent}px">
                <span class="sy-tree-toggle ${hasChildren ? '' : 'sy-tree-toggle-hidden'}">
                    <svg class="sy-tree-arrow" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </span>
                <svg class="sy-tree-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
                <span class="sy-tree-text">${doc.title}</span>
            </li>
        `;

        if (hasChildren) {
            html += `<ul class="sy-tree-children" data-parent="${doc.id}" style="display: none;">`;
            for (const child of doc.children) {
                html += renderTreeItem(child, notebookId, depth + 1);
            }
            html += '</ul>';
        }

        return html;
    }

    /**
     * 切换树节点展开/折叠
     */
    function toggleTreeNode(item) {
        const docId = item.dataset.docId || item.dataset.notebookId;
        const childrenContainer = item.nextElementSibling;

        if (!childrenContainer || !childrenContainer.classList.contains('sy-tree-children')) {
            return;
        }

        if (item.classList.contains('sy-tree-expanded')) {
            item.classList.remove('sy-tree-expanded');
            childrenContainer.style.display = 'none';
            state.expandedNodes.delete(docId);
        } else {
            item.classList.add('sy-tree-expanded');
            childrenContainer.style.display = 'block';
            state.expandedNodes.add(docId);
        }
    }

    /**
     * 设置当前选中的树节点
     */
    function setActiveTreeItem(item) {
        document.querySelectorAll('.sy-tree-item').forEach(i => {
            i.classList.remove('sy-tree-active');
        });
        item.classList.add('sy-tree-active');
    }

    /**
     * 加载文档内容（带缓存）
     */
    async function loadDocument(notebookId, docId) {
        const contentContainer = document.getElementById('sy-content');
        const breadcrumbContainer = document.getElementById('sy-breadcrumb');

        if (!contentContainer) return;

        contentContainer.innerHTML = '<div class="sy-loading">加载中...</div>';

        try {
            const docData = await fetchDocument(notebookId, docId);

            // 更新面包屑
            if (breadcrumbContainer) {
                breadcrumbContainer.innerHTML = `
                    <span class="sy-breadcrumb-item">${docData.notebookName || '笔记本'}</span>
                    <span class="sy-breadcrumb-separator">/</span>
                    <span class="sy-breadcrumb-item sy-breadcrumb-current">${docData.title}</span>
                `;
            }

            // 渲染文档内容
            renderDocument(docData, contentContainer);

        } catch (error) {
            console.error('[SiyuanCard] 加载文档失败:', error);
            contentContainer.innerHTML = `<div class="sy-error">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 渲染文档内容
     */
    function renderDocument(docData, container) {
        if (typeof SiyuanRenderer !== 'undefined') {
            SiyuanRenderer.render(docData, container);
        } else {
            container.innerHTML = '<div class="sy-error">渲染器未加载</div>';
        }
    }

    // ==================== 数据获取函数 ====================

    /**
     * 获取笔记本列表
     */
    async function fetchNotebooks() {
        const notebookId = config.defaultNotebook;
        const confUrl = `${config.notebookPath}/${notebookId}/.siyuan/conf.json`;

        const response = await fetch(confUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const confData = await response.json();

        return [{ id: notebookId, name: confData.name || '笔记本' }];
    }

    /**
     * 获取笔记本内的文档列表（并行加载）
     */
    async function fetchNotebookDocs(notebookId) {
        const sortUrl = `${config.notebookPath}/${notebookId}/.siyuan/sort.json`;

        const sortResponse = await fetch(sortUrl);
        if (!sortResponse.ok) {
            throw new Error(`HTTP ${sortResponse.status}`);
        }
        const sortData = await sortResponse.json();

        const docs = [];
        const docIds = Object.keys(sortData);
        const structure = knownStructure[notebookId];

        // 收集所有子文档 ID
        const allChildDocIds = new Set();
        if (structure && structure.childDocs) {
            for (const parentId of Object.keys(structure.childDocs)) {
                for (const childId of structure.childDocs[parentId]) {
                    allChildDocIds.add(childId);
                }
            }
        }

        // 并行加载文档
        const loadPromises = [];

        for (const docId of docIds) {
            if (allChildDocIds.has(docId)) continue;

            loadPromises.push(
                (async () => {
                    try {
                        const docUrl = `${config.notebookPath}/${notebookId}/${docId}.sy`;
                        let docResponse = await fetch(docUrl);

                        if (!docResponse.ok && structure && structure.subDirs) {
                            for (const subDir of structure.subDirs) {
                                const subDocUrl = `${config.notebookPath}/${notebookId}/${subDir}/${docId}.sy`;
                                docResponse = await fetch(subDocUrl);
                                if (docResponse.ok) break;
                            }
                        }

                        if (!docResponse.ok) return null;

                        const docData = await docResponse.json();
                        const children = await fetchChildDocs(notebookId, docId);

                        return {
                            id: docId,
                            title: docData.Properties?.title || '未命名',
                            children: children
                        };
                    } catch (e) {
                        console.warn('[SiyuanCard] 加载文档失败', docId, e);
                        return null;
                    }
                })()
            );
        }

        const results = await Promise.all(loadPromises);

        // 过滤掉失败的请求
        for (const doc of results) {
            if (doc) {
                docs.push(doc);
            }
        }

        return docs;
    }

    /**
     * 获取子文档列表
     */
    async function fetchChildDocs(notebookId, parentId) {
        const children = [];
        const structure = knownStructure[notebookId];

        if (structure && structure.childDocs && structure.childDocs[parentId]) {
            // 并行加载子文档
            const loadPromises = structure.childDocs[parentId].map(async (childId) => {
                try {
                    const docUrl = `${config.notebookPath}/${notebookId}/${parentId}/${childId}.sy`;
                    const docResponse = await fetch(docUrl);

                    if (docResponse.ok) {
                        const docData = await docResponse.json();
                        return {
                            id: childId,
                            title: docData.Properties?.title || '未命名',
                            children: []
                        };
                    }
                } catch (e) {
                    // 忽略
                }
                return null;
            });

            const results = await Promise.all(loadPromises);
            for (const child of results) {
                if (child) {
                    children.push(child);
                }
            }
        }

        return children;
    }

    /**
     * 获取文档内容（带缓存）
     */
    async function fetchDocument(notebookId, docId) {
        const cacheKey = `${notebookId}/${docId}`;

        if (docCache.has(cacheKey)) {
            return docCache.get(cacheKey);
        }

        let docUrl = `${config.notebookPath}/${notebookId}/${docId}.sy`;
        let response = await fetch(docUrl);

        // 尝试子目录
        if (!response.ok) {
            const structure = knownStructure[notebookId];
            if (structure && structure.subDirs) {
                for (const subDir of structure.subDirs) {
                    docUrl = `${config.notebookPath}/${notebookId}/${subDir}/${docId}.sy`;
                    response = await fetch(docUrl);
                    if (response.ok) break;
                }
            }
        }

        // 尝试子文档目录
        if (!response.ok) {
            const structure = knownStructure[notebookId];
            if (structure && structure.childDocs) {
                for (const parentId of Object.keys(structure.childDocs)) {
                    docUrl = `${config.notebookPath}/${notebookId}/${parentId}/${docId}.sy`;
                    response = await fetch(docUrl);
                    if (response.ok) break;
                }
            }
        }

        if (!response.ok) {
            throw new Error('文档不存在');
        }

        const docData = await response.json();

        // 获取笔记本名称
        try {
            const confUrl = `${config.notebookPath}/${notebookId}/.siyuan/conf.json`;
            const confResponse = await fetch(confUrl);
            const confData = await confResponse.json();
            docData.notebookName = confData.name;
        } catch (e) {
            docData.notebookName = '笔记本';
        }

        // 缓存
        docCache.set(cacheKey, docData);

        return docData;
    }

    /**
     * 清除缓存
     */
    function clearCache() {
        docCache.clear();
        if (typeof SiyuanRenderer !== 'undefined') {
            SiyuanRenderer.clearCache();
        }
    }

    // 公开 API
    return {
        init,
        loadNotebooks,
        loadDocument,
        renderDocument,
        clearCache,
        configure: (options) => { Object.assign(config, options); }
    };
})();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiyuanCard;
} else if (typeof window !== 'undefined') {
    window.SiyuanCard = SiyuanCard;
}


// ========== main.js ==========
/**
 * 主入口文件
 * 初始化所有模块
 */

(function() {
    

    /**
     * 初始化应用
     */
    function initApp() {
        console.log('[App] 开始初始化...');

        // 初始化音乐播放器
        if (typeof MusicPlayer !== 'undefined') {
            MusicPlayer.init();
        }

        // 初始化课表
        if (typeof Schedule !== 'undefined') {
            Schedule.init();
        }

        // 初始化关注内容
        if (typeof Interests !== 'undefined') {
            Interests.init();
        }

        // 初始化思源卡片
        const siyuanContainer = document.getElementById('siyuan-card-container');
        if (siyuanContainer && typeof SiyuanCard !== 'undefined') {
            SiyuanCard.init(siyuanContainer);
        }

        console.log('[App] 初始化完成');
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();

