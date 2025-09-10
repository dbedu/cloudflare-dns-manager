# Docker Troubleshooting Guide

## Client Container Startup Issues

### Problem
The client container may exit immediately after building because there's no long-running process to keep it alive.

### Solution
The client Dockerfile has been updated to include a command that keeps the container running:

```dockerfile
# 保持容器运行
CMD ["tail", "-f", "/dev/null"]
```

### Testing the Fix

1. **Build and start services:**
   ```bash
   docker compose up --build -d
   ```

2. **Check container status:**
   ```bash
   docker compose ps
   ```
   Both `cloudflare-dns-dashboard-server` and `cloudflare-dns-dashboard-client` should show as "Up".

3. **Verify static files are built:**
   ```bash
   docker compose exec client ls -la /output
   ```
   You should see the built static files (index.html, assets/, etc.)

4. **Check logs if issues persist:**
   ```bash
   # Check client logs
   docker compose logs client
   
   # Check server logs
   docker compose logs server
   ```

### Alternative Approach (if issues persist)

If the client container still has issues, you can use a different approach:

1. **Build static files locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Use a simple nginx container to serve files:**
   Create a `docker-compose.local.yml`:
   ```yaml
   version: '3.8'
   services:
     server:
       build: ./server
       container_name: cloudflare-dns-dashboard-server
       restart: unless-stopped
       environment:
         - NODE_ENV=production
         - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
       expose:
         - "3001"
       networks:
         - app-network
       volumes:
         - ./.env:/app/.env

     nginx:
       image: nginx:alpine
       container_name: cloudflare-dns-dashboard-nginx
       restart: unless-stopped
       ports:
         - "80:80"
       volumes:
         - ./client/dist:/usr/share/nginx/html
         - ./nginx.conf.example:/etc/nginx/nginx.conf:ro
       depends_on:
         - server
       networks:
         - app-network

   networks:
     app-network:
       driver: bridge
   ```

3. **Start with the alternative setup:**
   ```bash
   docker compose -f docker-compose.local.yml up -d
   ```

### Common Issues and Solutions

1. **Permission Issues:**
   - On Linux/Mac, ensure the output directory has proper permissions
   - Run: `chmod 755 ./client/dist`

2. **Build Failures:**
   - Check if all dependencies are properly installed
   - Verify the `package.json` and `package-lock.json` are present

3. **Environment Variables:**
   - Ensure `.env` file exists with proper `CLOUDFLARE_API_TOKEN`
   - Check that `VITE_API_URL` is correctly set during build

4. **Network Issues:**
   - Verify all services are on the same network (`app-network`)
   - Check that the server is accessible from nginx on port 3001

### Verification Steps

After successful startup:

1. **Check all containers are running:**
   ```bash
   docker compose ps
   ```

2. **Test the application:**
   - If using nginx: Open http://localhost
   - Check API connectivity: http://localhost/api/health (if health endpoint exists)

3. **Monitor logs:**
   ```bash
   docker compose logs -f
   ```

This should resolve the client startup issues and provide a working containerized environment.