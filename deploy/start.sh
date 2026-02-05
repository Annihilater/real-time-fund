#!/bin/bash

# 启动脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 启动 Real-Time Fund 服务..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker 未运行，请先启动 Docker"
    exit 1
fi

# 拉取最新镜像
echo "📦 拉取最新镜像..."
docker-compose pull

# 启动服务
echo "🔧 启动容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "📍 访问地址: http://localhost:9428"
    echo "📊 查看日志: ./logs.sh"
    echo "📈 查看状态: ./status.sh"
else
    echo "❌ 服务启动失败，请查看日志"
    docker-compose logs --tail=50
    exit 1
fi
