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
│   ├── nginx.conf         # Nginx 配置文件
│   └── ...               # 其他配置文件
├── server/               # 后端 Express 服务器
│   ├── server.js         # 服务器入口文件
│   └── Dockerfile        # 后端 Docker 构建文件
├── .github/              # GitHub 配置
│   └── workflows/        # GitHub Actions 工作流
│       └── docker-publish.yml  # Docker 构建与发布工作流
├── docker-compose.yml    # Docker Compose 配置文件
└── .env.example          # 环境变量示例文件
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
# 可选：自定义API地址
VITE_API_URL=/api  # 推荐使用相对路径，避免HTTPS访问时的混合内容问题
```

3. 使用 Docker Compose 构建并启动服务

```bash
# 使用默认配置构建
docker-compose up -d --build

# 或者指定自定义API地址（推荐使用相对路径）
docker-compose build --build-arg VITE_API_URL=/api
docker-compose up -d
```

4. 在浏览器中访问应用

```
http://localhost
```

### 使用预构建的 Docker 镜像

本项目通过 GitHub Actions 自动构建并发布 Docker 镜像到 GitHub Container Registry。

1. 拉取最新的镜像

```bash
docker pull ghcr.io/<github-username>/cloudflare-dns-dashboard:master-server
docker pull ghcr.io/<github-username>/cloudflare-dns-dashboard:master-client
```

2. 创建 docker-compose.yml 文件

```yaml
version: '3.8'

services:
  server:
    image: ghcr.io/<github-username>/cloudflare-dns-dashboard:master-server
    container_name: cloudflare-dns-dashboard-server
    restart: unless-stopped
    environment:
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
    ports:
      - "3001:3001"
    networks:
      - app-network

  client:
    image: ghcr.io/<github-username>/cloudflare-dns-dashboard:master-client
    container_name: cloudflare-dns-dashboard-client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - server
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

3. 创建 .env 文件并添加你的 Cloudflare API Token

4. 启动服务

```bash
docker-compose up -d
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

### API 配置

前端应用通过环境变量 `VITE_API_URL` 配置API地址：

- 在开发环境中，默认使用相对路径 `/api`，通过Nginx代理转发到后端服务
- 在Docker环境中，通过Dockerfile中的环境变量设置：`ENV VITE_API_URL=${VITE_API_URL}`
- 如需自定义API地址，可在构建时指定：`docker-compose build --build-arg VITE_API_URL=http://your-api-url`

### 部署到HTTPS域名

当通过HTTPS域名访问应用时，需要注意以下几点：

1. **避免混合内容问题**：当网站通过HTTPS访问时，浏览器会阻止HTTP请求，导致API调用失败。确保在docker-compose.yml中将`VITE_API_URL`设置为相对路径`/api`而非`http://`开头的绝对路径。

2. **配置示例**：
   ```yaml
   client:
     build:
       context: ./client
       dockerfile: Dockerfile
       args:
         - VITE_API_URL=/api  # 使用相对路径，避免混合内容问题
   ```

3. **Nginx配置**：前端的nginx.conf已配置将`/api`请求代理到后端服务，确保此配置正确。

## 注意事项

- 确保你的 Cloudflare API Token 具有足够的权限来管理 DNS 记录
- 本应用仅在本地运行，不建议部署到公共环境，除非添加了适当的身份验证机制
- 对于生产环境，建议添加更多的错误处理和日志记录功能
