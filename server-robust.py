#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
健壮的本地预览服务器
使用多线程 HTTP 服务器，解决 Python http.server 容易崩溃的问题
"""

import os
import sys
import socket
import threading
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote

# 初始化 MIME 类型
mimetypes.init()


class ThreadingHTTPServer(HTTPServer):
    """多线程 HTTP 服务器"""
    allow_reuse_address = True
    timeout = 60

    def process_request(self, request, client_address):
        """在新线程中处理请求"""
        thread = threading.Thread(target=self.process_request_thread,
                                  args=(request, client_address))
        thread.daemon = True
        thread.start()

    def process_request_thread(self, request, client_address):
        """处理请求的线程函数"""
        try:
            self.finish_request(request, client_address)
        except Exception:
            self.handle_error(request, client_address)
        finally:
            self.shutdown_request(request)


class RobustHandler(SimpleHTTPRequestHandler):
    """健壮的请求处理器"""

    def log_message(self, format, *args):
        """简化日志"""
        if '404' in str(args) or '500' in str(args):
            print(f"[{self.log_date_time_string()}] {args[0]}")

    def do_GET(self):
        """处理 GET 请求"""
        try:
            # URL 解码
            path = unquote(self.path)

            # 移除查询参数
            if '?' in path:
                path = path.split('?')[0]

            # 构建文件路径
            if path.startswith('/'):
                path = path[1:]

            file_path = os.path.join(os.getcwd(), path)
            file_path = os.path.normpath(file_path)

            # 安全检查
            if not file_path.startswith(os.getcwd()):
                self.send_error(403, "Forbidden")
                return

            # 目录处理
            if os.path.isdir(file_path):
                file_path = os.path.join(file_path, 'index.html')

            # 文件不存在
            if not os.path.isfile(file_path):
                self.send_error(404, "Not Found")
                return

            # 获取 MIME 类型
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                mime_type = 'application/octet-stream'

            # 读取并发送文件
            with open(file_path, 'rb') as f:
                content = f.read()

            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', len(content))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(content)

        except (ConnectionResetError, BrokenPipeError, socket.error):
            # 忽略连接错误
            pass
        except Exception as e:
            print(f"Error: {e}")
            try:
                self.send_error(500, str(e))
            except:
                pass


def main():
    """启动服务器"""
    port = 8000
    directory = os.path.dirname(os.path.abspath(__file__))
    os.chdir(directory)

    print("=" * 50)
    print("  Ham 个人主页 - 本地预览服务器")
    print("=" * 50)
    print(f"  服务目录: {directory}")
    print(f"  服务端口: {port}")
    print(f"  访问地址: http://localhost:{port}")
    print("=" * 50)
    print("  按 Ctrl+C 停止服务器")
    print("=" * 50)
    print()

    server = ThreadingHTTPServer(('127.0.0.1', port), RobustHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()
        sys.exit(0)


if __name__ == '__main__':
    main()
