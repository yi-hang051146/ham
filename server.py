#!/usr/bin/env python3
"""
简单的本地HTTP服务器
用于在本地预览个人主页
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

# 配置
PORT = 8000
DIRECTORY = Path(__file__).parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

def main():
    # 切换到脚本所在目录
    os.chdir(DIRECTORY)

    # 创建服务器
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"🚀 本地服务器已启动！")
        print(f"📍 服务地址: {url}")
        print(f"📁 服务目录: {DIRECTORY}")
        print(f"💡 按 Ctrl+C 停止服务器")
        print("-" * 50)

        # 自动打开浏览器
        webbrowser.open(url)

        try:
            # 启动服务器
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✅ 服务器已停止")

if __name__ == "__main__":
    main()
