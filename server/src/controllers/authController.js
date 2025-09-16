const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// 配置文件路径
const configPath = path.join(__dirname, '../config/auth.json');

// 初始化配置文件
const initConfig = () => {
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      loginKey: bcrypt.hashSync('default-admin-key', 10),
      jwtSecret: 'dns_manager_secret_' + Date.now(),
      forceKeyChange: true // Default to true if config doesn't exist
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('Created default auth config. Default login key: default-admin-key');
  }
};

// 读取配置
const getConfig = () => {
  initConfig();
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};

// 保存配置
const saveConfig = (config) => {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

const login = async (req, res) => {
  try {
    const { loginKey } = req.body;
    
    if (!loginKey) {
      return res.status(400).json({ error: 'Login key is required' });
    }
    
    const config = getConfig();
    
    // 验证登录密钥
    const isValidKey = await bcrypt.compare(loginKey, config.loginKey);
    if (!isValidKey) {
      return res.status(401).json({ error: 'Invalid login key' });
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { authenticated: true, timestamp: Date.now() },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { authenticated: true, forceKeyChange: config.forceKeyChange || false } // Pass forceKeyChange status
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

const getProfile = (req, res) => {
  res.json({
    user: { authenticated: true },
    timestamp: new Date().toISOString()
  });
};

const changeLoginKey = async (req, res) => {
  try {
    const { currentKey, newKey } = req.body;
    
    if (!currentKey || !newKey) {
      return res.status(400).json({ error: 'Current key and new key are required' });
    }
    
    const config = getConfig();
    
    // 验证当前密钥
    const isValidKey = await bcrypt.compare(currentKey, config.loginKey);
    if (!isValidKey) {
      return res.status(401).json({ error: 'Invalid current key' });
    }
    
    // 更新密钥
    config.loginKey = await bcrypt.hash(newKey, 10);
    config.forceKeyChange = false; // Set to false after successful change
    saveConfig(config);
    
    res.json({ message: 'Login key updated successfully' });
  } catch (error) {
    console.error('Change key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  changeLoginKey,
  getConfig,
  saveConfig
};