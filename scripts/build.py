#!/usr/bin/env python3
"""
构建脚本 - 合并 CSS 和 JS 文件
参考思源笔记的构建方式

使用方法:
    python scripts/build.py          # 开发构建
    python scripts/build.py --watch  # 监听文件变化
"""

import os
import sys
import argparse
import time
from pathlib import Path
from datetime import datetime

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / 'src'
DIST_DIR = PROJECT_ROOT / 'dist'
CSS_DIR = SRC_DIR / 'css'
JS_DIR = SRC_DIR / 'js'

# CSS 文件合并顺序（按依赖关系排序）
CSS_FILES = [
    'variables.css',           # 设计变量
    'base.css',                # 基础样式
    'layout.css',              # 布局样式
    'components/header.css',   # 头部组件
    'components/footer.css',   # 页脚组件
    'components/music-player.css',  # 音乐播放器
    'components/schedule.css', # 课表组件
    'components/interests.css', # 关注内容组件
    'components/siyuan.css',   # 思源渲染器样式
    'components/siyuan-card.css', # 思源卡片样式
]

# JS 文件合并顺序（按依赖关系排序）
JS_FILES = [
    'utils.js',                # 工具函数
    'modules/music-player.js', # 音乐播放器
    'modules/schedule.js',     # 课表模块
    'modules/interests.js',    # 关注内容模块
    'renderers/siyuan-renderer.js', # 思源渲染器
    'renderers/siyuan-card.js', # 思源卡片
    'main.js',                 # 主入口
]


def log(message: str, level: str = 'INFO'):
    """打印日志"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    colors = {
        'INFO': '\033[92m',    # 绿色
        'WARN': '\033[93m',    # 黄色
        'ERROR': '\033[91m',   # 红色
        'RESET': '\033[0m',
    }
    color = colors.get(level, colors['INFO'])
    reset = colors['RESET']
    print(f"{color}[{timestamp}] [{level}]{reset} {message}")


def build_css():
    """合并 CSS 文件"""
    log('开始构建 CSS...')
    output = []
    output.append('/* ========================================')
    output.append(' * Ham - 个人主页样式文件')
    output.append(f' * 构建时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    output.append(' * ======================================== */')
    output.append('')

    for file_path in CSS_FILES:
        file = CSS_DIR / file_path
        if file.exists():
            log(f'  合并: {file_path}', 'INFO')
            output.append(f'/* ========== {file_path} ========== */')
            content = file.read_text(encoding='utf-8')
            # 移除 @import 语句（因为我们已经合并了）
            lines = content.split('\n')
            filtered_lines = [line for line in lines if not line.strip().startswith('@import')]
            output.append('\n'.join(filtered_lines))
            output.append('')
        else:
            log(f'  文件不存在: {file_path}', 'WARN')

    # 确保输出目录存在
    output_dir = DIST_DIR / 'css'
    output_dir.mkdir(parents=True, exist_ok=True)

    # 写入合并后的文件
    output_file = output_dir / 'app.css'
    output_file.write_text('\n'.join(output), encoding='utf-8')

    # 同时输出到根目录（方便开发）
    root_output = PROJECT_ROOT / 'css' / 'app.css'
    root_output.parent.mkdir(parents=True, exist_ok=True)
    root_output.write_text('\n'.join(output), encoding='utf-8')

    # 计算文件大小
    size_kb = output_file.stat().st_size / 1024
    log(f'CSS 构建完成: {output_file} ({size_kb:.2f} KB)')

    return output_file


def build_js():
    """合并 JS 文件"""
    log('开始构建 JavaScript...')
    output = []
    output.append('/**')
    output.append(' * Ham - 个人主页脚本文件')
    output.append(f' * 构建时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    output.append(' */')
    output.append('')
    output.append("'use strict';")
    output.append('')

    for file_path in JS_FILES:
        file = JS_DIR / file_path
        if file.exists():
            log(f'  合并: {file_path}', 'INFO')
            output.append(f'// ========== {file_path} ==========')
            content = file.read_text(encoding='utf-8')
            # 移除 'use strict'; 声明（已经在开头添加了）
            content = content.replace("'use strict';", '')
            content = content.replace('"use strict";', '')
            output.append(content)
            output.append('')
        else:
            log(f'  文件不存在: {file_path}', 'WARN')

    # 确保输出目录存在
    output_dir = DIST_DIR / 'js'
    output_dir.mkdir(parents=True, exist_ok=True)

    # 写入合并后的文件
    output_file = output_dir / 'app.js'
    output_file.write_text('\n'.join(output), encoding='utf-8')

    # 同时输出到根目录（方便开发）
    root_output = PROJECT_ROOT / 'js' / 'app.js'
    root_output.parent.mkdir(parents=True, exist_ok=True)
    root_output.write_text('\n'.join(output), encoding='utf-8')

    # 计算文件大小
    size_kb = output_file.stat().st_size / 1024
    log(f'JavaScript 构建完成: {output_file} ({size_kb:.2f} KB)')

    return output_file


def copy_assets():
    """复制静态资源"""
    log('复制静态资源...')

    # 复制 assets 目录
    src_assets = PROJECT_ROOT / 'assets'
    dist_assets = DIST_DIR / 'assets'
    if src_assets.exists():
        import shutil
        if dist_assets.exists():
            shutil.rmtree(dist_assets)
        shutil.copytree(src_assets, dist_assets)
        log(f'  复制 assets 目录完成')

    # 复制 data 目录
    src_data = PROJECT_ROOT / 'data'
    dist_data = DIST_DIR / 'data'
    if src_data.exists():
        import shutil
        if dist_data.exists():
            shutil.rmtree(dist_data)
        shutil.copytree(src_data, dist_data)
        log(f'  复制 data 目录完成')


def build():
    """执行完整构建"""
    start_time = time.time()
    log('=' * 50)
    log('开始构建项目...')
    log('=' * 50)

    # 构建 CSS
    css_file = build_css()

    # 构建 JS
    js_file = build_js()

    # 复制资源
    copy_assets()

    # 复制 index.html
    src_index = PROJECT_ROOT / 'index.html'
    dist_index = DIST_DIR / 'index.html'
    if src_index.exists():
        import shutil
        shutil.copy(src_index, dist_index)
        log(f'复制 index.html 完成')

    elapsed = time.time() - start_time
    log('=' * 50)
    log(f'构建完成! 耗时: {elapsed:.2f} 秒')
    log(f'输出目录: {DIST_DIR}')
    log('=' * 50)

    return css_file, js_file


def watch():
    """监听文件变化并自动构建"""
    log('开始监听文件变化...')
    log('按 Ctrl+C 停止监听')

    last_build = 0
    debounce_seconds = 1  # 防抖时间

    try:
        import watchdog
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler

        class BuildHandler(FileSystemEventHandler):
            def __init__(self, callback):
                self.callback = callback
                self.last_time = 0

            def on_modified(self, event):
                if event.is_directory:
                    return
                # 防抖
                now = time.time()
                if now - self.last_time < debounce_seconds:
                    return
                self.last_time = now

                # 只处理 CSS 和 JS 文件
                path = Path(event.src_path)
                if path.suffix in ['.css', '.js']:
                    log(f'检测到文件变化: {path.name}')
                    self.callback()

        def do_build():
            nonlocal last_build
            now = time.time()
            if now - last_build < debounce_seconds:
                return
            last_build = now
            build()

        handler = BuildHandler(do_build)
        observer = Observer()
        observer.schedule(handler, str(SRC_DIR), recursive=True)
        observer.start()

        # 首次构建
        build()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

    except ImportError:
        log('未安装 watchdog 库，使用简单轮询模式', 'WARN')
        log('提示: 运行 pip install watchdog 启用更高效的监听模式')

        # 简单轮询模式
        last_mtimes = {}
        while True:
            try:
                changed = False
                for css_file in CSS_FILES:
                    path = CSS_DIR / css_file
                    if path.exists():
                        mtime = path.stat().st_mtime
                        if path not in last_mtimes or last_mtimes[path] != mtime:
                            last_mtimes[path] = mtime
                            changed = True

                for js_file in JS_FILES:
                    path = JS_DIR / js_file
                    if path.exists():
                        mtime = path.stat().st_mtime
                        if path not in last_mtimes or last_mtimes[path] != mtime:
                            last_mtimes[path] = mtime
                            changed = True

                if changed:
                    build()

                time.sleep(1)
            except KeyboardInterrupt:
                log('停止监听')
                break


def main():
    parser = argparse.ArgumentParser(description='Ham 项目构建脚本')
    parser.add_argument('--watch', '-w', action='store_true', help='监听文件变化并自动构建')
    parser.add_argument('--css', action='store_true', help='只构建 CSS')
    parser.add_argument('--js', action='store_true', help='只构建 JS')
    args = parser.parse_args()

    if args.watch:
        watch()
    elif args.css:
        build_css()
    elif args.js:
        build_js()
    else:
        build()


if __name__ == '__main__':
    main()
