# 安装和运行说明
## 1. 本地开发环境设置
### 后端设置:
bash
#### 进入 server 目录
cd server

#### 安装依赖
npm install

#### 复制环境变量文件并填写您的 Cloudflare API Token
cp .env.example .env
#### 编辑 .env 文件，填入您的 CLOUDFLARE_API_TOKEN

#### 启动后端服务
npm run dev
### 前端设置:
bash
#### 进入 client 目录
cd client

#### 安装依赖
npm install

#### 启动前端开发服务器
npm run dev

---

## 2. Docker 部署
1.Download the `docker-compose.yml`, change the `your_github_username` to `dbedu` to use my images. 
2.Fork the repository and start the github actions to create your own docker images.(Optional)

### 复制环境变量文件并填写您的 Cloudflare API Token
cp .env.example .env
### 编辑 .env 文件，填入您的 CLOUDFLARE_API_TOKEN

### 使用 docker-compose 启动服务
docker compose up -d
应用将在以下地址可用:

前端界面: http://localhost
后端 API: http://localhost:3001
这个完整的解决方案提供了一个功能齐全的 Cloudflare DNS 管理面板，具有直观的用户界面和安全的后端代理，满足所有指定要求。
