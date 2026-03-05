/**
 * 音乐播放器模块
 * 功能：歌单循环播放、状态持久化
 */

const MusicPlayer = (function() {
    'use strict';

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
