# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 Next.js 静态站点
RUN npm run build

# 生产阶段 - 使用 Nginx
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制静态文件到 nginx 目录
COPY --from=builder /app/out /usr/share/nginx/html

# 创建健康检查脚本
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget --quiet --tries=1 --spider http://localhost/ || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
