# Real-Time Fund 部署指南

本目录包含使用 Docker 部署 Real-Time Fund 应用的所有必要文件和脚本。

## 📋 目录结构

```
deploy/
├── docker-compose.yml    # Docker Compose 配置文件
├── start.sh             # 启动服务脚本
├── stop.sh              # 停止服务脚本
├── restart.sh           # 重启服务脚本
├── logs.sh              # 查看日志脚本
├── status.sh            # 查看状态脚本
└── README.md            # 本文件
```

## 🚀 快速开始

### 前置要求

- Docker 已安装并运行
- Docker Compose V2 已安装

### 启动服务

```bash
cd deploy
./start.sh
```

服务启动后，访问 http://localhost:9428

### 停止服务

```bash
./stop.sh
```

### 重启服务

```bash
./restart.sh
```

## 📊 服务管理

### 查看服务状态

```bash
./status.sh
```

这将显示：
- 容器运行状态
- 资源使用情况
- 服务健康检查结果
- 端口访问情况

### 查看日志

```bash
# 查看最后 100 行日志
./logs.sh

# 查看最后 50 行日志
./logs.sh 50

# 实时跟随日志输出
./logs.sh -f

# 查看帮助
./logs.sh -h
```

## 🔧 配置说明

### 端口配置

默认端口为 9428，如需修改，请编辑 `docker-compose.yml`：

```yaml
ports:
  - "YOUR_PORT:9428"
```

### 环境变量

可以在 `docker-compose.yml` 中添加环境变量：

```yaml
environment:
  - NODE_ENV=production
  - PORT=9428
  - YOUR_VAR=value
```

### 健康检查

容器配置了健康检查，每 30 秒检查一次服务是否正常响应。

## 🐳 镜像管理

### 更新镜像

```bash
cd deploy
docker-compose pull
./restart.sh
```

### 查看镜像版本

```bash
docker images klause/real-time-fund
```

## 🔍 故障排查

### 服务无法启动

1. 检查 Docker 是否运行：
   ```bash
   docker info
   ```

2. 查看详细日志：
   ```bash
   ./logs.sh
   ```

3. 检查端口是否被占用：
   ```bash
   lsof -i :9428
   ```

### 服务运行缓慢

1. 检查资源使用情况：
   ```bash
   ./status.sh
   ```

2. 查看容器统计信息：
   ```bash
   docker stats real-time-fund
   ```

### 无法访问服务

1. 检查容器是否健康：
   ```bash
   docker-compose ps
   ```

2. 测试端口连接：
   ```bash
   curl http://localhost:9428
   ```

## 📝 注意事项

1. 所有脚本需要执行权限，首次使用前请运行：
   ```bash
   chmod +x *.sh
   ```

2. 建议使用 `latest` 标签来获取最新版本的镜像

3. 生产环境建议：
   - 使用反向代理（如 Nginx）
   - 配置 HTTPS
   - 定期备份数据
   - 监控容器资源使用

## 🔗 相关链接

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [项目主页](https://github.com/klause/real-time-fund)

## 💡 获取帮助

如遇到问题，请：
1. 查看日志文件
2. 检查 GitHub Issues
3. 提交新的 Issue
