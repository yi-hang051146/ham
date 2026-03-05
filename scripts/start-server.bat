@echo off
chcp 65001 >nul
echo ========================================
echo    个人主页本地预览服务器
echo ========================================
echo.
echo 正在启动服务器...
echo.

REM 切换到项目根目录
cd /d "%~dp0.."

REM 运行服务器
python scripts/server.py

pause
