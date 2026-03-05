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
# 服务目录为项目根目录（scripts 的父目录）
DIRECTORY = Path(__file__).parent.parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        """添加 CORS 头"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """处理 OPTIONS 请求（CORS 预检）"""
        self.send_response(200)
        self.end_headers()

def main():
    # 切换到项目根目录
    os.chdir(DIRECTORY)

    # 创建服务器
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"[OK] 本地服务器已启动！")
        print(f"[URL] 服务地址: {url}")
        print(f"[DIR] 服务目录: {DIRECTORY}")
        print(f"[TIP] 按 Ctrl+C 停止服务器")
        print("-" * 50)

        # 自动打开浏览器
        webbrowser.open(url)

        try:
            # 启动服务器
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n[OK] 服务器已停止")

if __name__ == "__main__":
    main()
