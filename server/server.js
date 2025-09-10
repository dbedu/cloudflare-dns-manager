// server/server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost'], // 允许前端访问
  credentials: true
}));
app.use(express.json());

// 创建 Cloudflare API 实例
const cloudflareAPI = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// API 路由

// 获取所有域名区域
app.get('/api/zones', async (req, res) => {
  try {
    const response = await cloudflareAPI.get('/zones');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching zones:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '获取域名列表失败',
      details: error.response?.data || error.message 
    });
  }
});

// 获取指定区域的 DNS 记录
app.get('/api/zones/:zoneId/dns_records', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const response = await cloudflareAPI.get(`/zones/${zoneId}/dns_records`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching DNS records:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '获取DNS记录失败',
      details: error.response?.data || error.message 
    });
  }
});

// 创建新的 DNS 记录
app.post('/api/zones/:zoneId/dns_records', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const response = await cloudflareAPI.post(`/zones/${zoneId}/dns_records`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating DNS record:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '创建DNS记录失败',
      details: error.response?.data || error.message 
    });
  }
});

// 更新 DNS 记录
app.put('/api/zones/:zoneId/dns_records/:recordId', async (req, res) => {
  try {
    const { zoneId, recordId } = req.params;
    const response = await cloudflareAPI.put(`/zones/${zoneId}/dns_records/${recordId}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating DNS record:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '更新DNS记录失败',
      details: error.response?.data || error.message 
    });
  }
});

// 删除 DNS 记录
app.delete('/api/zones/:zoneId/dns_records/:recordId', async (req, res) => {
  try {
    const { zoneId, recordId } = req.params;
    const response = await cloudflareAPI.delete(`/zones/${zoneId}/dns_records/${recordId}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting DNS record:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '删除DNS记录失败',
      details: error.response?.data || error.message 
    });
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cloudflare DNS 管理服务器运行在端口 ${PORT}`);
});