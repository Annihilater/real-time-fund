#!/bin/bash

# Docker 镜像构建和推送脚本
# 支持多平台构建 (arm64, amd64)
set -e

# 配置
IMAGE_NAME="klause/real-time-fund"
VERSION="${1:-latest}"
PLATFORMS="linux/amd64,linux/arm64"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🐳 Docker 多平台镜像构建工具"
echo "================================"
echo "镜像名称: $IMAGE_NAME"
echo "版本标签: $VERSION"
echo "目标平台: $PLATFORMS"
echo "================================"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    print_error "Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查是否登录 Docker Hub
print_info "检查 Docker Hub 登录状态..."
# 检查 Docker 配置文件中是否有认证信息
if [ -f "$HOME/.docker/config.json" ]; then
    if grep -q "auths" "$HOME/.docker/config.json" 2>/dev/null; then
        # 尝试从配置中获取用户名
        if grep -q "docker.io" "$HOME/.docker/config.json" 2>/dev/null || grep -q "index.docker.io" "$HOME/.docker/config.json" 2>/dev/null; then
            print_info "Docker Hub 认证配置已找到"
        else
            print_warn "未找到 Docker Hub 认证信息"
            echo "请先登录: docker login"
            exit 1
        fi
    else
        print_warn "Docker 配置文件中没有认证信息"
        echo "请先登录: docker login"
        exit 1
    fi
else
    print_warn "未找到 Docker 配置文件"
    echo "请先登录: docker login"
    exit 1
fi

# 检查是否启用了 buildx
print_info "检查 Docker Buildx..."
if ! docker buildx version > /dev/null 2>&1; then
    print_error "Docker Buildx 未安装或未启用"
    echo "请参考: https://docs.docker.com/buildx/working-with-buildx/"
    exit 1
fi

# 创建并使用 builder 实例
print_info "配置 Buildx builder..."
if ! docker buildx inspect multiarch-builder > /dev/null 2>&1; then
    print_info "创建新的 builder 实例..."
    docker buildx create --name multiarch-builder --driver docker-container --use
else
    print_info "使用现有的 builder 实例..."
    docker buildx use multiarch-builder
fi

# 启动 builder
print_info "启动 builder..."
docker buildx inspect --bootstrap

# 构建并推送镜像
print_info "开始构建多平台镜像..."
echo ""

docker buildx build \
    --platform "$PLATFORMS" \
    --tag "${IMAGE_NAME}:${VERSION}" \
    --tag "${IMAGE_NAME}:latest" \
    --push \
    --progress=plain \
    .

echo ""
print_info "✅ 镜像构建和推送完成！"
echo ""
echo "📦 已推送的镜像:"
echo "   - ${IMAGE_NAME}:${VERSION}"
echo "   - ${IMAGE_NAME}:latest"
echo ""
echo "🎯 支持的平台:"
echo "   - linux/amd64"
echo "   - linux/arm64"
echo ""
echo "💡 使用方法:"
echo "   docker pull ${IMAGE_NAME}:${VERSION}"
echo "   或者直接使用 deploy 目录下的脚本部署"
echo ""

# 显示镜像信息
print_info "镜像详细信息:"
docker buildx imagetools inspect "${IMAGE_NAME}:${VERSION}"
