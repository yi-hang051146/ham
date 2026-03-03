// 音乐播放器控制 - 歌单循环播放
document.addEventListener('DOMContentLoaded', function() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    // 检查是否有音乐文件
    if (!bgMusic || !musicToggle) return;

    // ============================================
    // 歌单配置 - 在这里修改播放顺序
    // ============================================
    const playlist = [
        './assets/audio/希林娜依高-微光星海.flac',
        './assets/audio/G.E.M.邓紫棋-光年之外.flac',
        './assets/audio/IU-에잇.flac',
        './assets/audio/情歌-梁静茹.flac',
        './assets/audio/當山みれい-願い〜あの頃のキミへ〜.flac'
    ];
    // ============================================

    let currentTrack = 0;
    let lastSavedTime = 0;

    // 更新图标状态
    function updateIconState(playing) {
        if (playing) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            musicToggle.classList.add('playing');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            musicToggle.classList.remove('playing');
        }
    }

    // 加载并播放指定曲目
    function loadTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        currentTrack = index;
        bgMusic.src = playlist[currentTrack];
        bgMusic.load();
    }

    // 播放下一首
    function playNext() {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
        bgMusic.play().catch(function(error) {
            console.error('播放失败:', error);
        });
    }

    // 监听播放状态
    bgMusic.addEventListener('play', () => updateIconState(true));
    bgMusic.addEventListener('pause', () => updateIconState(false));

    // 音频加载错误处理
    bgMusic.addEventListener('error', function(e) {
        console.error('音频加载错误:', e);
        // 尝试播放下一首
        playNext();
    });

    // 播放结束时自动播放下一首
    bgMusic.addEventListener('ended', function() {
        playNext();
    });

    // 点击切换播放/暂停
    musicToggle.addEventListener('click', function() {
        if (bgMusic.paused) {
            // 如果还没有加载音频，加载第一首
            if (!bgMusic.src || bgMusic.src === '') {
                loadTrack(0);
            }
            bgMusic.play().catch(function(error) {
                console.error('播放失败:', error);
            });
            localStorage.setItem('musicPlaying', 'true');
        } else {
            bgMusic.pause();
            localStorage.setItem('musicPlaying', 'false');
        }
    });

    // 保存播放进度（节流，每5秒保存一次）
    bgMusic.addEventListener('timeupdate', function() {
        const currentTime = bgMusic.currentTime;
        if (currentTime - lastSavedTime > 5 || lastSavedTime > currentTime) {
            localStorage.setItem('musicTime', currentTime.toString());
            localStorage.setItem('musicTrack', currentTrack.toString());
            lastSavedTime = currentTime;
        }
    });

    // 页面离开时保存状态
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('musicTime', bgMusic.currentTime.toString());
        localStorage.setItem('musicTrack', currentTrack.toString());
        localStorage.setItem('musicPlaying', (!bgMusic.paused).toString());
    });

    // 初始化：加载第一首歌（不自动播放）
    loadTrack(0);
});
