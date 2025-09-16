const express = require('express');
const fs = require('fs');
const path = require('path');
const { changeLoginKey } = require('../controllers/authController');

const router = express.Router();

// 配置文件路径
const envPath = path.join(__dirname, '../../.env');
const configPath = path.join(__dirname, '../config/app.json');

// 初始化应用配置
const initAppConfig = () => {
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || '',
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  }
};

// 获取当前配置
router.get('/', (req, res) => {
  try {
    initAppConfig();
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 不返回完整的API Token，只返回前几位用于确认
    const maskedToken = config.cloudflareApiToken 
      ? config.cloudflareApiToken.substring(0, 8) + '...' 
      : '';
    
    res.json({
      cloudflareApiToken: maskedToken,
      hasApiToken: !!config.cloudflareApiToken,
      lastUpdated: config.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

// 更新Cloudflare API Token
router.put('/cloudflare-token', (req, res) => {
  try {
    const { apiToken } = req.body;
    
    if (!apiToken) {
      return res.status(400).json({ error: 'API token is required' });
    }
    
    initAppConfig();
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.cloudflareApiToken = apiToken;
    config.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // 同时更新.env文件
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('CLOUDFLARE_API_TOKEN=')) {
      envContent += `
CLOUDFLARE_API_TOKEN=${apiToken}`;
    } else {
      envContent += `\nCLOUDFLARE_API_TOKEN=${apiToken}`;
    }
    fs.writeFileSync(envPath, envContent);
    
    res.json({ message: 'Cloudflare API token updated successfully' });
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ error: 'Failed to update API token' });
  }
});

// 更新登录密钥
router.put('/login-key', changeLoginKey);

// 测试Cloudflare API连接
router.post('/test-cloudflare', async (req, res) => {
  try {
    const axios = require('axios');
    initAppConfig();
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!config.cloudflareApiToken) {
      return res.status(400).json({ error: 'No API token configured' });
    }
    
    const response = await axios.get('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: {
        'Authorization': `Bearer ${config.cloudflareApiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      res.json({ success: true, message: 'API token is valid' });
    } else {
      res.status(400).json({ success: false, message: 'API token is invalid' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify API token',
      error: error.response?.data || error.message 
    });
  }
});

module.exports = router;