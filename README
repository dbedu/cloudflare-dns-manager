# 项目部署指南

本文档将指导你如何通过 Docker 和 Docker Compose 部署 Cloudflare DNS 管理面板。

## 先决条件

1.  **Docker**: 确保你的服务器上已经安装了 Docker。
2.  **Docker Compose**: (推荐) 确保你的服务器上已经安装了 Docker Compose。
3.  **Cloudflare API 凭证**:
    * `CLOUDFLARE_API_TOKEN`: 你的 Cloudflare API 令牌。
    * `CLOUDFLARE_ZONE_ID`: 你要管理的域名的区域 ID。
4.  **GitHub Container Registry (ghcr.io) 登录**:
    * 你需要登录到 ghcr.io 才能拉取私有镜像。如果是公开镜像，则无需登录。
    * 使用你的 GitHub 用户名和 Personal Access Token (PAT) 登录：
        ```bash
        echo $GH_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
        ```

## 部署步骤

### 方法一：使用 Docker Compose (推荐)

这是最简单的部署方式。

1.  **创建 `docker-compose.yml` 文件**:
    将项目中的 `docker-compose.yml` 文件复制到你的服务器上。记得修改文件中的 `image` 字段，将 `<YOUR_GITHUB_USERNAME>` 替换为你的GitHub用户名。

2.  **创建 `.env` 文件**:
    在 `docker-compose.yml` 所在的目录中，创建一个名为 `.env` 的文件，并填入你的Cloudflare凭证：
    ```
    CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
    CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id_here
    ```

3.  **启动服务**:
    在该目录下运行以下命令来启动容器：
    ```bash
    docker-compose up -d
    ```

4.  **访问应用**:
    现在你可以通过 `http://<your_server_ip>:3001` 访问你的应用了。

### 方法二：使用 Docker 命令

如果你不想使用 Docker Compose，也可以直接使用 `docker run` 命令。

1.  **拉取镜像**:
    从 GitHub Container Registry 拉取最新的镜像。将 `<YOUR_GITHUB_USERNAME>` 替换为你的 GitHub 用户名。
    ```bash
    docker pull ghcr.io/<YOUR_GITHUB_USERNAME>/cloudflare-dns-dashboard:latest
    ```

2.  **运行容器**:
    执行以下命令来启动容器。请务必将命令中的占位符替换为你的实际信息。

    ```bash
    docker run -d \
      --name cloudflare-dns-dashboard \
      -p 3001:3001 \
      -e CLOUDFLARE_API_TOKEN="your_cloudflare_api_token_here" \
      -e CLOUDFLARE_ZONE_ID="your_cloudflare_zone_id_here" \
      --restart unless-stopped \
      ghcr.io/<YOUR_GITHUB_USERNAME>/cloudflare-dns-dashboard:latest
    ```

3.  **访问应用**:
    现在你可以通过 `http://<your_server_ip>:3001` 访问你的应用了。

## 管理服务

* **查看日志**:
    * **Docker Compose**: `docker-compose logs -f`
    * **Docker**: `docker logs -f cloudflare-dns-dashboard`

* **停止服务**:
    * **Docker Compose**: `docker-compose down`
    * **Docker**: `docker stop cloudflare-dns-dashboard`

* **更新镜像**:
    1.  拉取最新镜像: `docker pull ghcr.io/<YOUR_GITHUB_USERNAME>/cloudflare-dns-dashboard:latest`
    2.  重新部署:
        * **Docker Compose**: `docker-compose up -d`
        * **Docker**: 先停止并移除旧容器 (`docker stop/rm ...`)，然后用新的镜像重新运行 `docker run` 命令。
