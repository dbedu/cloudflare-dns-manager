require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // 引入 path 模块

const app = express();
app.use(cors());
app.use(express.json());

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

const cloudflareApi = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4/',
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// --- API 路由 ---
app.get('/api/dns-records', async (req, res) => {
  try {
    const response = await cloudflareApi.get(`zones/${CLOUDFLARE_ZONE_ID}/dns_records`);
    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching DNS records', error: error.message });
  }
});

app.post('/api/dns-records', async (req, res) => {
    try {
        const response = await cloudflareApi.post(`zones/${CLOUDFLARE_ZONE_ID}/dns_records`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error creating DNS record', error: error.message });
    }
});

app.put('/api/dns-records/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await cloudflareApi.put(`zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error updating DNS record', error: error.message });
    }
});

app.delete('/api/dns-records/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await cloudflareApi.delete(`zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`);
        res.json({ message: 'DNS record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting DNS record', error: error.message });
    }
});

// --- 新增代码开始：提供前端静态文件 ---

// 1. 指定前端构建产物的静态资源目录
app.use(express.static(path.join(__dirname, 'frontend/build')));

// 2. 对于所有未匹配到 API 的 GET 请求，都返回前端的 index.html
//    这对于单页面应用(SPA)的路由至关重要
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// --- 新增代码结束 ---


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});