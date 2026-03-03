// 音乐播放器控制
document.addEventListener('DOMContentLoaded', function() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    // 检查是否有音乐文件
    if (!bgMusic || !musicToggle) return;

    // 从 localStorage 恢复播放状态
    const isPlaying = localStorage.getItem('musicPlaying') === 'true';
    const savedTime = parseFloat(localStorage.getItem('musicTime')) || 0;

    if (isPlaying) {
        bgMusic.currentTime = savedTime;
        bgMusic.play().catch(() => {
            // 自动播放被浏览器阻止，需要用户手动点击
            console.log('自动播放被阻止');
        });
    }

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

    // 监听播放状态
    bgMusic.addEventListener('play', () => updateIconState(true));
    bgMusic.addEventListener('pause', () => updateIconState(false));

    // 点击切换播放/暂停
    musicToggle.addEventListener('click', function() {
        if (bgMusic.paused) {
            bgMusic.play();
            localStorage.setItem('musicPlaying', 'true');
        } else {
            bgMusic.pause();
            localStorage.setItem('musicPlaying', 'false');
        }
    });

    // 保存播放进度
    bgMusic.addEventListener('timeupdate', function() {
        localStorage.setItem('musicTime', bgMusic.currentTime.toString());
    });

    // 页面离开时保存状态
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('musicTime', bgMusic.currentTime.toString());
        localStorage.setItem('musicPlaying', (!bgMusic.paused).toString());
    });
});
