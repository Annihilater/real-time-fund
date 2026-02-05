# Real-Time Fund 构建脚本

本目录包含用于构建和发布 Docker 镜像的脚本。

## 📋 脚本说明

### build.sh

多平台 Docker 镜像构建和推送脚本。

**功能特性：**
- ✅ 支持多平台构建 (linux/amd64, linux/arm64)
- ✅ 自动推送到 Docker Hub
- ✅ 版本标签管理
- ✅ 构建状态检查

**使用方法：**

```bash
# 构建并推送 latest 版本
./build.sh

# 构建并推送指定版本
./build.sh v1.0.0

# 构建并推送带日期的版本
./build.sh $(date +%Y%m%d)
```

## 🔧 前置要求

### 1. Docker 环境

确保已安装 Docker 并启用 Buildx：

```bash
# 检查 Docker 版本
docker --version

# 检查 Buildx
docker buildx version
```

### 2. Docker Hub 认证

登录到 Docker Hub：

```bash
docker login
```

确保你有权限推送到 `klause` 组织/用户的仓库。

### 3. 多平台构建支持

启用 QEMU 支持（macOS 和 Linux）：

```bash
# 安装 QEMU 模拟器
docker run --privileged --rm tonistiigi/binfmt --install all

# 验证支持的平台
docker buildx ls
```

## 📦 构建流程

脚本执行以下步骤：

1. **环境检查**
   - 检查 Docker 是否运行
   - 验证 Docker Hub 登录状态
   - 确认 Buildx 可用性

2. **Builder 配置**
   - 创建或使用多平台 builder 实例
   - 启动 builder

3. **镜像构建**
   - 同时构建 amd64 和 arm64 架构
   - 应用版本标签
   - 使用 buildx 特性优化构建

4. **推送镜像**
   - 自动推送到 Docker Hub
   - 同时推送指定版本和 latest 标签

5. **验证**
   - 显示镜像详细信息
   - 列出支持的平台

## 🎯 镜像标签策略

构建脚本会创建两个标签：

- `klause/real-time-fund:latest` - 最新版本
- `klause/real-time-fund:VERSION` - 指定版本

**版本命名建议：**
- 语义化版本：`v1.0.0`, `v1.2.3`
- 日期版本：`20260205`, `2026-02-05`
- 分支版本：`develop`, `staging`

## 🔍 故障排查

### 问题：Buildx 不可用

```bash
# 创建新的 builder
docker buildx create --use --name multiarch-builder

# 启动 builder
docker buildx inspect --bootstrap
```

### 问题：平台不支持

```bash
# 安装 QEMU
docker run --privileged --rm tonistiigi/binfmt --install all

# 验证
docker buildx ls
```

### 问题：推送失败

```bash
# 重新登录 Docker Hub
docker logout
docker login

# 检查仓库权限
```

### 问题：构建缓慢

```bash
# 使用本地缓存
docker buildx build --cache-from=type=local,src=/tmp/.buildx-cache ...

# 或使用 registry 缓存
docker buildx build --cache-from=type=registry,ref=klause/real-time-fund:cache ...
```

## 📊 构建性能优化

### 使用缓存

编辑 `build.sh`，添加缓存选项：

```bash
docker buildx build \
    --platform "$PLATFORMS" \
    --cache-from type=registry,ref=${IMAGE_NAME}:cache \
    --cache-to type=registry,ref=${IMAGE_NAME}:cache,mode=max \
    ...
```

### 并行构建

Buildx 默认支持并行构建多个平台，无需额外配置。

## 🔐 安全最佳实践

1. **不要在镜像中包含敏感信息**
   - 使用 `.dockerignore` 排除敏感文件
   - 环境变量在运行时注入

2. **定期更新基础镜像**
   ```bash
   docker pull node:18-alpine
   ```

3. **扫描漏洞**
   ```bash
   docker scan klause/real-time-fund:latest
   ```

## 💡 高级用法

### 仅构建不推送

修改脚本，移除 `--push` 选项，添加 `--load`：

```bash
docker buildx build \
    --platform linux/amd64 \
    --tag "${IMAGE_NAME}:${VERSION}" \
    --load \
    .
```

注意：`--load` 只支持单平台构建。

### 构建特定平台

```bash
# 仅构建 arm64
PLATFORMS="linux/arm64" ./build.sh

# 仅构建 amd64  
PLATFORMS="linux/amd64" ./build.sh
```

### 添加构建参数

在 `build.sh` 中添加 `--build-arg`：

```bash
docker buildx build \
    --build-arg NODE_VERSION=18 \
    --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    ...
```

## 📝 脚本权限

首次使用前，确保脚本有执行权限：

```bash
chmod +x build.sh
```

## 🔗 相关资源

- [Docker Buildx 文档](https://docs.docker.com/buildx/working-with-buildx/)
- [多平台构建指南](https://docs.docker.com/build/building/multi-platform/)
- [Docker Hub](https://hub.docker.com/)

## 📧 获取帮助

如遇问题，请：
1. 检查脚本输出的错误信息
2. 查看 Docker 日志
3. 提交 GitHub Issue
