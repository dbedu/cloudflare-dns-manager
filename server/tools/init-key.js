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

// 在 init-key.js 中添加以下代码来显示当前密钥（仅用于调试）
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('当前配置状态:');
    console.log('  登录密钥状态:', config.loginKey ? '已设置' : '未设置');
    // 注意：这里不能显示明文密钥，因为只存储了哈希值
  } catch (error) {
    console.log('配置文件格式错误:', error.message);
  }
}

// 检查配置文件是否已存在
if (fs.existsSync(configPath)) {
  console.log('✓ 配置文件已存在，跳过密钥生成');
  console.log('  配置文件路径:', configPath);
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('  登录密钥状态:', config.loginKey ? '已设置' : '未设置');
    console.log('  JWT密钥状态:', config.jwtSecret ? '已设置' : '未设置');
    console.log('  强制修改密钥状态:', config.forceKeyChange ? '是' : '否');
  } catch (error) {
    console.log('⚠ 配置文件格式错误:', error.message);
  }
  
  console.log('='.repeat(50));
} else {
  console.log('ℹ 检测到首次启动，正在生成默认密钥...');
  
  // 使用 IIFE (Immediately Invoked Function Expression) 来处理 async/await
  (async () => {
    try {
      // 使用 admin123 作为默认密钥
      const defaultKey = 'admin123';
      
      // 生成哈希密钥
      const hashedKey = await bcrypt.hash(defaultKey, 10);
      
      // 创建配置对象
      const config = {
        loginKey: hashedKey,
        jwtSecret: 'dns_manager_secret_' + Date.now(),
        lastUpdated: new Date().toISOString(),
        forceKeyChange: true // Add this flag
      };
      
      // 保存配置
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log('');
      console.log('✅ 默认密钥生成成功!');
      console.log('   默认密钥:', defaultKey);
      console.log('   配置文件:', configPath);
      console.log('   更新时间:', config.lastUpdated);
      console.log('   强制修改密钥: 是');
      console.log('');
      console.log('⚠ 请妥善保管此密钥，并在首次登录后尽快修改!');
      console.log('='.repeat(50));
      
    } catch (error) {
      console.log('❌ 密钥生成失败:', error.message);
      process.exit(1);
    }
  })();
}
