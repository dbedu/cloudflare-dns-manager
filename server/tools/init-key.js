const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const configPath = path.join(__dirname, '../src/config/auth.json');

// 确保配置目录存在
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

console.log('='.repeat(50));
console.log('    Cloudflare DNS Manager - 初始化密钥');
console.log('='.repeat(50));

// 检查配置文件是否已存在
if (fs.existsSync(configPath)) {
  console.log('✓ 配置文件已存在，跳过密钥生成');
  console.log('  配置文件路径:', configPath);
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('  登录密钥状态:', config.loginKey ? '已设置' : '未设置');
    console.log('  JWT密钥状态:', config.jwtSecret ? '已设置' : '未设置');
  } catch (error) {
    console.log('⚠ 配置文件格式错误:', error.message);
  }
  
  console.log('='.repeat(50));
} else {
  console.log('ℹ 检测到首次启动，正在生成默认密钥...');
  
  // 使用 IIFE (Immediately Invoked Function Expression) 来处理 async/await
  (async () => {
    try {
      // 生成随机默认密钥
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let defaultKey = '';
      for (let i = 0; i < 16; i++) {
        defaultKey += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 生成哈希密钥
      const hashedKey = await bcrypt.hash(defaultKey, 10);
      
      // 创建配置对象
      const config = {
        loginKey: hashedKey,
        jwtSecret: 'dns_manager_secret_' + Date.now(),
        lastUpdated: new Date().toISOString(),
        firstRun: true
      };
      
      // 保存配置
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log('');
      console.log('✅ 默认密钥生成成功!');
      console.log('   默认密钥:', defaultKey);
      console.log('   配置文件:', configPath);
      console.log('   更新时间:', config.lastUpdated);
      console.log('');
      console.log('⚠ 请妥善保管此密钥，并在首次登录后尽快修改!');
      console.log('='.repeat(50));
      
    } catch (error) {
      console.log('❌ 密钥生成失败:', error.message);
      process.exit(1);
    }
  })();
}