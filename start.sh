#!/bin/bash
# SkillManager 启动脚本 (Mac / Linux)

cd "$(dirname "$0")"

# 如果 node_modules 不存在则自动安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 首次运行，安装依赖..."
  npm install
fi

echo "🚀 启动技能编辑器..."
echo "   本地地址: http://localhost:5173"
echo "   按 Ctrl+C 停止"
echo ""

npm run dev
