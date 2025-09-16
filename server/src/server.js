const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 导入路由
const authRoutes = require('./routes/auth');
const dnsRoutes = require('./routes/dns');
const configRoutes = require('./routes/config');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost'],
  credentials: true
}));
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/dns', authenticate, dnsRoutes);
app.use('/api/config', authenticate, configRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;