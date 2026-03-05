/**
 * 工具函数模块
 * 参考思源笔记的工具函数设计
 */

const Utils = (function() {
    'use strict';

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
