@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  SkillManager 技能编辑器
echo ========================

:: 关闭占用 5173 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING" 2^>nul') do (
    echo  停止已有服务 (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

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

:: 延迟 2 秒后自动打开浏览器
start "" cmd /c "timeout /t 2 >nul && start http://localhost:5173"

npm run dev
