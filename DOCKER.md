# Docker 部署快速参考

## 📁 文件结构

```
real-time-fund/
├── Dockerfile                 # Docker 镜像定义
├── .dockerignore             # Docker 构建排除文件
├── next.config.js            # Next.js 配置（已启用 standalone 模式）
├── deploy/                   # 部署目录
│   ├── docker-compose.yml    # Docker Compose 配置
│   ├── start.sh             # 启动服务
│   ├── stop.sh              # 停止服务
│   ├── restart.sh           # 重启服务
│   ├── logs.sh              # 查看日志
│   ├── status.sh            # 查看状态
│   └── README.md            # 部署详细文档
└── scripts/                 # 构建脚本
    ├── build.sh             # 多平台镜像构建脚本
    └── README.md            # 构建详细文档
```

## 🚀 快速命令

### 部署管理

```bash
cd deploy

./start.sh      # 启动服务
./stop.sh       # 停止服务
./restart.sh    # 重启服务
./status.sh     # 查看状态
./logs.sh       # 查看日志
./logs.sh -f    # 实时跟随日志
```

### 镜像构建

```bash
cd scripts

./build.sh              # 构建 latest 版本
./build.sh v1.0.0      # 构建指定版本
```

## 🔧 前置准备

### 1. 使用预构建镜像（简单）

只需要安装 Docker：

```bash
# macOS
brew install --cask docker

# 或下载 Docker Desktop
# https://www.docker.com/products/docker-desktop
```

### 2. 构建自己的镜像（高级）

需要额外配置：

1. **Docker Hub 登录**

   ```bash
   docker login
   ```

2. **启用 Buildx（多平台构建）**

   ```bash
   # 检查是否已启用
   docker buildx version

   # 安装 QEMU（用于跨平台构建）
   docker run --privileged --rm tonistiigi/binfmt --install all
   ```

## 📊 使用流程

### 场景 1：快速部署到服务器

```bash
# 1. 克隆项目
git clone https://github.com/your-username/real-time-fund.git
cd real-time-fund

# 2. 启动服务
cd deploy
./start.sh

# 3. 访问应用
open http://localhost:3000
```

### 场景 2：开发者自定义镜像

```bash
# 1. 登录 Docker Hub
docker login

# 2. 修改 scripts/build.sh 中的镜像名称
#    IMAGE_NAME="your-username/real-time-fund"

# 3. 构建并推送
cd scripts
./build.sh v1.0.0

# 4. 修改 deploy/docker-compose.yml 中的镜像地址
#    image: your-username/real-time-fund:v1.0.0

# 5. 部署
cd ../deploy
./start.sh
```

### 场景 3：生产环境部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 构建新版本镜像
cd scripts
./build.sh $(date +%Y%m%d)

# 3. 更新 docker-compose.yml 中的版本号

# 4. 重启服务
cd ../deploy
./restart.sh

# 5. 验证
./status.sh
```

## 🔍 常见问题

### Q1: 端口被占用怎么办？

编辑 `deploy/docker-compose.yml`，修改端口映射：

```yaml
ports:
  - "8080:3000" # 使用 8080 端口
```

### Q2: 如何查看日志？

```bash
cd deploy
./logs.sh -f  # 实时查看
```

### Q3: 镜像构建失败？

检查：

1. Docker 是否运行
2. 是否登录 Docker Hub
3. Buildx 是否正确配置

```bash
docker info
docker buildx ls
```

### Q4: 如何更新到最新版本？

```bash
cd deploy
docker-compose pull
./restart.sh
```

### Q5: 如何备份数据？

由于是纯前端应用，数据存储在浏览器 localStorage，无需备份容器数据。

### Q6: 支持 HTTPS 吗？

容器本身不包含 HTTPS，建议使用 Nginx 反向代理：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 💡 最佳实践

1. **生产环境建议**
   - 使用特定版本标签，不要用 `latest`
   - 配置反向代理（Nginx/Traefik）
   - 设置 HTTPS
   - 配置日志轮转

2. **开发环境建议**
   - 使用 `latest` 标签快速迭代
   - 定期清理未使用的镜像：`docker system prune`

3. **CI/CD 集成**
   ```yaml
   # GitHub Actions 示例
   - name: Build and push Docker image
     run: |
       cd scripts
       ./build.sh ${{ github.sha }}
   ```

## 🔗 相关链接

- [部署详细文档](../deploy/README.md)
- [构建详细文档](../scripts/README.md)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

## 📧 获取帮助

遇到问题？

1. 查看 [deploy/README.md](../deploy/README.md)
2. 查看 [scripts/README.md](../scripts/README.md)
3. 提交 GitHub Issue
