# Cloudflare DNS 管理面板

一个简单易用的 Cloudflare DNS 记录管理工具，允许用户查看、添加、修改和删除其 Cloudflare 域名的 DNS 记录。

## 功能特点

- 查看所有域名的 DNS 记录
- 添加新的 DNS 记录
- 修改现有 DNS 记录
- 删除 DNS 记录
- 按类型筛选 DNS 记录

## 项目结构

```
├── client/                # 前端 React 应用
│   ├── src/               # 源代码
│   ├── public/            # 静态资源
│   ├── Dockerfile         # 前端 Docker 构建文件
│   └── ...               # 其他配置文件
├── server/               # 后端 Express 服务器
│   ├── server.js         # 服务器入口文件
│   └── Dockerfile        # 后端 Docker 构建文件
├── .github/              # GitHub 配置
│   └── workflows/        # GitHub Actions 工作流
│       └── docker-publish.yml  # Docker 构建与发布工作流
├── docker-compose.yml            # 主要 Docker Compose 配置文件
├── docker-compose.nginx.example.yml  # Nginx 部署示例配置
├── nginx.conf.example            # Nginx 配置示例文件
└── .env.example                  # 环境变量示例文件
```

## 安装与启动

### 前提条件

#### 本地开发
- Node.js (v20 或更高版本)
- npm (v6 或更高版本)
- Cloudflare API Token

#### Docker 部署
- Docker (v20.10 或更高版本)
- Docker Compose (v2.0 或更高版本)
- Cloudflare API Token

### 本地开发安装步骤

1. 克隆仓库

```bash
git clone <仓库URL>
cd cloudflare-dns-dashboard
```

2. 设置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的 Cloudflare API Token：

```
CLOUDFLARE_API_TOKEN=your_api_token_here
```

3. 安装后端依赖并启动服务器

```bash
cd server
npm install
npm start
```

4. 安装前端依赖并启动开发服务器

```bash
cd ../client
npm install
npm run dev
```

5. 在浏览器中访问应用

```
http://localhost:5173
```

### Docker 部署步骤

本项目采用分离部署方式，将前端构建、后端API和Nginx代理分开部署，更加灵活和安全。

1. 克隆仓库

```bash
git clone <仓库URL>
cd cloudflare-dns-dashboard
```

2. 设置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的 Cloudflare API Token：

```
CLOUDFLARE_API_TOKEN=your_api_token_here
```

3. 构建并启动API服务和前端构建服务

```bash
# 构建并启动API服务和前端构建服务
docker-compose up -d --build
```

4. 配置Nginx代理

```bash
# 复制Nginx配置示例文件
cp nginx.conf.example nginx.conf
cp docker-compose.nginx.example.yml docker-compose.nginx.yml
```

根据你的需求编辑 `nginx.conf` 文件，特别是服务器名称和SSL配置。

5. 启动Nginx代理服务

```bash
docker-compose -f docker-compose.nginx.yml up -d
```

6. 在浏览器中访问应用

```
http://localhost
# 或者你配置的域名
```

### 使用预构建的 Docker 镜像

本项目通过 GitHub Actions 自动构建并发布 Docker 镜像到 GitHub Container Registry。

1. 拉取最新的镜像

```bash
docker pull ghcr.io/<github-username>/cloudflare-dns-dashboard:master-server
docker pull ghcr.io/<github-username>/cloudflare-dns-dashboard:master-client
```

2. 创建主要 docker-compose.yml 文件

```yaml
version: '3.8'

services:
  server:
    image: ghcr.io/<github-username>/cloudflare-dns-dashboard:master-server
    container_name: cloudflare-dns-dashboard-server
    restart: unless-stopped
    environment:
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
    # 仅在内部网络暴露端口
    expose:
      - "3001"
    networks:
      - app-network
    volumes:
      - ./.env:/app/.env

  client:
    image: ghcr.io/<github-username>/cloudflare-dns-dashboard:master-client
    container_name: cloudflare-dns-dashboard-client
    volumes:
      - frontend_build:/output
    networks:
      - app-network

volumes:
  frontend_build:

networks:
  app-network:
    driver: bridge
```

3. 创建 Nginx 配置文件 (nginx.conf) 和 docker-compose.nginx.yml 文件

```yaml
# docker-compose.nginx.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: cloudflare-dns-dashboard-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"  # 如果配置HTTPS
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - frontend_build:/usr/share/nginx/html
      # - ./ssl:/etc/nginx/ssl  # 如果需要SSL证书
    networks:
      - app-network

networks:
  app-network:
    external: true  # 使用已存在的网络

volumes:
  frontend_build:
    external: true  # 使用已存在的卷
```

4. 创建 .env 文件并添加你的 Cloudflare API Token

5. 启动服务

```bash
# 先启动API服务和前端构建服务
docker-compose up -d

# 然后启动Nginx代理服务
docker-compose -f docker-compose.nginx.yml up -d
```

## 使用说明

1. 在下拉菜单中选择你的域名
2. 查看该域名的所有 DNS 记录
3. 使用表单添加新的 DNS 记录
4. 点击记录旁边的编辑按钮修改记录
5. 点击记录旁边的删除按钮删除记录

## 技术栈

- 前端：React、Vite、Tailwind CSS、Axios
- 后端：Node.js、Express
- 容器化：Docker、Docker Compose
- CI/CD：GitHub Actions
- 容器注册表：GitHub Container Registry (GHCR)

## 配置说明

### 分离部署架构

本项目采用分离部署架构，将各组件解耦：

1. **后端API服务**：提供API接口，不对外直接暴露
2. **前端构建服务**：仅负责构建静态文件，输出到共享卷
3. **Nginx代理服务**：负责提供静态文件服务和API代理，是唯一对外暴露的服务

这种架构的优势：
- 更高的安全性：后端服务不直接对外暴露
- 更灵活的部署：可以根据需求自定义Nginx配置
- 更好的可维护性：各组件职责单一，易于维护

### API 配置

前端应用通过环境变量 `VITE_API_URL` 配置API地址：

- 在开发环境中，默认使用相对路径 `/api`
- 在Docker环境中，默认设置为 `/api`，通过Nginx代理转发到后端服务
- 如需自定义，可在构建前端镜像时指定：`docker-compose build --build-arg VITE_API_URL=/custom-api-path client`

### Nginx配置

项目提供了Nginx配置示例文件 `nginx.conf.example`，主要包含：

1. **静态文件服务**：提供前端构建产物的访问
2. **API代理**：将 `/api` 请求代理到后端服务
3. **SPA路由支持**：确保前端路由正常工作

### 部署到HTTPS域名

当通过HTTPS域名访问应用时，需要注意以下几点：

1. **配置SSL证书**：在Nginx配置中添加SSL证书配置

   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       
       # 其他配置...
   }
   ```

2. **HTTP重定向**：将HTTP请求重定向到HTTPS

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$host$request_uri;
   }
   ```

3. **挂载SSL证书**：在docker-compose.nginx.yml中挂载SSL证书目录

   ```yaml
   volumes:
     - ./ssl:/etc/nginx/ssl
   ```

## 注意事项

- 确保你的 Cloudflare API Token 具有足够的权限来管理 DNS 记录
- 本应用仅在本地运行，不建议部署到公共环境，除非添加了适当的身份验证机制
- 对于生产环境，建议添加更多的错误处理和日志记录功能
