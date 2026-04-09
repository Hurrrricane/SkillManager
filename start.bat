@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  SkillManager 技能编辑器
echo ========================

if not exist "node_modules" (
    echo  首次运行，安装依赖...
    npm install
    if errorlevel 1 (
        echo  依赖安装失败，请检查 Node.js 是否已安装
        pause
        exit /b 1
    )
)

echo  启动中...
echo  本地地址: http://localhost:5173
echo  按 Ctrl+C 停止
echo.

npm run dev
