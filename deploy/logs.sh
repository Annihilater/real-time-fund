#!/bin/bash

# 日志查看脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 默认显示最后 100 行日志，并跟随输出
LINES=${1:-100}

if [ "$1" = "-f" ] || [ "$1" = "--follow" ]; then
    echo "📜 实时查看日志 (Ctrl+C 退出)..."
    docker-compose logs -f
elif [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "用法: ./logs.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -f, --follow     实时跟随日志输出"
    echo "  -h, --help       显示帮助信息"
    echo "  [数字]           显示最后 N 行日志 (默认: 100)"
    echo ""
    echo "示例:"
    echo "  ./logs.sh          # 显示最后 100 行日志"
    echo "  ./logs.sh 50       # 显示最后 50 行日志"
    echo "  ./logs.sh -f       # 实时跟随日志"
else
    echo "📜 显示最后 ${LINES} 行日志..."
    docker-compose logs --tail="${LINES}"
fi
