/**
 * 主入口文件
 * 初始化所有模块
 */

(function() {
    'use strict';

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
