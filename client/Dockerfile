# 仅构建静态文件
FROM node:20.19-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 设置API地址环境变量
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# 构建应用
RUN npm run build

# 创建输出目录
RUN mkdir -p /output

# 将构建产物复制到输出目录
RUN cp -r dist/* /output/

# 设置输出卷
VOLUME /output

# 保持容器运行
CMD ["tail", "-f", "/dev/null"]