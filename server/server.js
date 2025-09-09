/**
 * Cloudflare DNS Manager - 后端服务器
 * 这个服务器作为代理，负责接收前端请求，附加认证信息后，再转发给Cloudflare API
 */

require('dotenv').config({ path: '../.env' }); // 加载根目录下的.env文件
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// 检查必要的环境变量
if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error('错误: 缺少环境变量 CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Vite 默认端口
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// 创建一个预配置的axios实例用于Cloudflare API请求
const cloudflareAPI = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('API错误:', err.response ? err.response.data : err.message);
  
  if (err.response) {
    // Cloudflare API 错误
    return res.status(err.response.status).json({
      success: false,
      errors: err.response.data.errors || [{ message: '来自Cloudflare API的错误' }]
    });
  }
  
  // 其他错误
  res.status(500).json({
    success: false,
    errors: [{ message: err.message || '服务器内部错误' }]
  });
};

// API路由

// 获取所有域名列表
app.get('/api/zones', async (req, res, next) => {
  try {
    const response = await cloudflareAPI.get('/zones');
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// 获取指定域名的DNS解析记录
app.get('/api/zones/:zoneId/dns_records', async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const response = await cloudflareAPI.get(`/zones/${zoneId}/dns_records`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// 添加新的DNS解析记录
app.post('/api/zones/:zoneId/dns_records', async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const response = await cloudflareAPI.post(`/zones/${zoneId}/dns_records`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    next(error);
  }
});

// 修改DNS解析记录
app.put('/api/zones/:zoneId/dns_records/:recordId', async (req, res, next) => {
  try {
    const { zoneId, recordId } = req.params;
    const response = await cloudflareAPI.put(`/zones/${zoneId}/dns_records/${recordId}`, req.body);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// 删除DNS解析记录
app.delete('/api/zones/:zoneId/dns_records/:recordId', async (req, res, next) => {
  try {
    const { zoneId, recordId } = req.params;
    const response = await cloudflareAPI.delete(`/zones/${zoneId}/dns_records/${recordId}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

// 注册错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});