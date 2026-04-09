#!/bin/bash
# SkillManager 启动脚本 (Mac / Linux)

cd "$(dirname "$0")"

# 关闭占用 5173 端口的进程
PORT=5173
PIDS=$(lsof -ti tcp:$PORT 2>/dev/null)
if [ -n "$PIDS" ]; then
  echo "停止已有服务 (port $PORT, PID: $PIDS)..."
  echo "$PIDS" | xargs kill -9 2>/dev/null
  sleep 0.5
fi

# 如果 node_modules 不存在则自动安装依赖
if [ ! -d "node_modules" ]; then
  echo "首次运行，安装依赖..."
  npm install
fi

echo "启动技能编辑器..."
echo "   本地地址: http://localhost:5173"
echo "   按 Ctrl+C 停止"
echo ""

# 等待服务启动后自动打开浏览器
(sleep 2 && open "http://localhost:5173") &

npm run dev
