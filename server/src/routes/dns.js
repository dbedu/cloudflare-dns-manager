const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const configPath = path.join(__dirname, '../config/app.json');

// 获取Cloudflare API Token
const getApiToken = () => {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.cloudflareApiToken;
    }
  } catch (error) {
    console.error('Error reading API token:', error);
  }
  return process.env.CLOUDFLARE_API_TOKEN;
};

// 创建Cloudflare API实例
const createCloudflareAPI = () => {
  const token = getApiToken();
  if (!token) {
    throw new Error('Cloudflare API token not configured');
  }
  
  return axios.create({
    baseURL: 'https://api.cloudflare.com/client/v4',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// 获取所有域名区域
router.get('/zones', async (req, res) => {
  try {
    const cloudflareAPI = createCloudflareAPI();
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

// 获取指定区域的DNS记录
router.get('/zones/:zoneId/records', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const cloudflareAPI = createCloudflareAPI();
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

// 创建DNS记录
router.post('/zones/:zoneId/records', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const cloudflareAPI = createCloudflareAPI();
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

// 更新DNS记录
router.put('/zones/:zoneId/records/:recordId', async (req, res) => {
  try {
    const { zoneId, recordId } = req.params;
    const cloudflareAPI = createCloudflareAPI();
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

// 删除DNS记录
router.delete('/zones/:zoneId/records/:recordId', async (req, res) => {
  try {
    const { zoneId, recordId } = req.params;
    const cloudflareAPI = createCloudflareAPI();
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

module.exports = router;