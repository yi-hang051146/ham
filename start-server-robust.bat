@echo off
chcp 65001 >nul
title Ham 本地预览服务器
cd /d "%~dp0"
python server-robust.py
pause
