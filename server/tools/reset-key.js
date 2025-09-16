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
console.log('    Cloudflare DNS Manager - 登录密钥重置工具');
console.log('='.repeat(50));
console.log('');

// 显示当前状态
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✓ 找到现有配置文件');
    console.log('  配置文件路径:', configPath);
  } catch (error) {
    console.log('⚠ 配置文件存在但格式错误，将创建新配置');
  }
} else {
  console.log('ℹ 未找到配置文件，将创建新配置');
  console.log('  配置文件路径:', configPath);
}

// 首次运行时自动生成默认密钥
async function generateDefaultKey() {
  try {
    // 生成随机默认密钥
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let defaultKey = '';
    for (let i = 0; i < 16; i++) {
      defaultKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 生成哈希密钥
    const hashedKey = await bcrypt.hash(defaultKey, 10);
    
    // 读取或创建配置
    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.log('⚠ 原配置文件格式错误，将创建新配置');
      }
    }
    
    // 更新配置
    config.loginKey = hashedKey;
    config.jwtSecret = config.jwtSecret || 'dns_manager_secret_' + Date.now();
    config.lastUpdated = new Date().toISOString();
    
    // 保存配置
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('');
    console.log('✅ 默认登录密钥已生成!');
    console.log('   默认密钥:', defaultKey);
    console.log('   配置文件:', configPath);
    console.log('   更新时间:', config.lastUpdated);
    console.log('');
    console.log('⚠ 请妥善保管您的登录密钥，并在首次登录后尽快修改');
    
  } catch (error) {
    console.log('❌ 默认密钥生成失败:', error.message);
    process.exit(1);
  }
}

// 检查是否是首次运行（配置文件不存在）
if (!fs.existsSync(configPath)) {
  console.log('检测到首次运行，正在生成默认密钥...');
  generateDefaultKey();
} else {
  console.log('配置文件已存在，如需重置请手动运行此工具');
  console.log('');
  
  // 显示当前配置状态
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('当前配置状态:');
    console.log('   登录密钥:', config.loginKey ? '已设置 (哈希值)' : '未设置');
    console.log('   JWT密钥:', config.jwtSecret ? '已设置' : '未设置');
    console.log('   最后更新:', config.lastUpdated || '未知');
  } catch (error) {
    console.log('❌ 配置文件格式错误:', error.message);
  }
}