#!/bin/bash

# 状态查看脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📊 Real-Time Fund 服务状态"
echo "================================"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行"
    exit 1
fi

# 显示容器状态
echo "🐳 容器状态:"
docker-compose ps
echo ""

# 检查服务健康状态
if docker-compose ps | grep -q "Up"; then
    echo "✅ 服务运行中"
    
    # 显示资源使用情况
    echo ""
    echo "📈 资源使用情况:"
    docker stats --no-stream real-time-fund 2>/dev/null || echo "无法获取资源使用情况"
    
    # 测试服务连接
    echo ""
    echo "🔍 服务连接测试:"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo "✅ 服务可访问: http://localhost:3000"
    else
        echo "⚠️  服务端口已开放，但可能尚未完全就绪"
    fi
else
    echo "❌ 服务未运行"
    echo ""
    echo "💡 使用 ./start.sh 启动服务"
fi

echo ""
echo "================================"
echo "💡 提示:"
echo "  启动服务: ./start.sh"
echo "  停止服务: ./stop.sh"
echo "  重启服务: ./restart.sh"
echo "  查看日志: ./logs.sh"
