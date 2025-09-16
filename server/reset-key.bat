@echo off
chcp 65001 >nul
echo.
echo ====================================================
echo     Cloudflare DNS Manager - 登录密钥重置工具
echo ====================================================
echo.
echo 正在启动密钥重置工具...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo 错误: 未找到 node_modules 目录
    echo 请先运行 npm install 安装依赖
    pause
    exit /b 1
)

node tools/reset-key.js

echo.
echo 按任意键退出...
pause >nul