@echo off
chcp 65001 >nul
title Ham 本地预览服务器
cd /d "%~dp0.."
python scripts/server-robust.py
pause
