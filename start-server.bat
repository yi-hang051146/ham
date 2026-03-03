@echo off
chcp 65001 >nul
echo ========================================
echo    个人主页本地预览服务器
echo ========================================
echo.
echo 正在启动服务器...
echo.
python "%~dp0server.py"
pause
