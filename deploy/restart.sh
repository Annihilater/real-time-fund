#!/bin/bash

# 重启脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔄 重启 Real-Time Fund 服务..."

# 停止服务
./stop.sh

# 等待一下
sleep 2

# 启动服务
./start.sh
