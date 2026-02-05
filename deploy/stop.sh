#!/bin/bash

# 停止脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🛑 停止 Real-Time Fund 服务..."

# 检查容器是否在运行
if docker-compose ps | grep -q "Up"; then
    docker-compose down
    echo "✅ 服务已停止"
else
    echo "ℹ️  服务未在运行"
fi
