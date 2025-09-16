const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const configPath = path.join(__dirname, '../src/config/auth.json');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

console.log('');
console.log('请选择操作:');
console.log('1. 重置登录密钥');
console.log('2. 查看当前配置状态');
console.log('3. 生成随机密钥');
console.log('4. 退出');
console.log('');

rl.question('请输入选项 (1-4): ', (choice) => {
  switch (choice) {
    case '1':
      resetLoginKey();
      break;
    case '2':
      showCurrentStatus();
      break;
    case '3':
      generateRandomKey();
      break;
    case '4':
      console.log('退出程序');
      rl.close();
      break;
    default:
      console.log('无效选项，请重新运行程序');
      rl.close();
  }
});

function resetLoginKey() {
  console.log('');
  console.log('--- 重置登录密钥 ---');
  rl.question('请输入新的登录密钥: ', (newKey) => {
    if (!newKey || newKey.length < 6) {
      console.log('❌ 密钥长度至少需要6个字符');
      rl.close();
      return;
    }
    
    rl.question('请再次确认新密钥: ', async (confirmKey) => {
      if (newKey !== confirmKey) {
        console.log('❌ 两次输入的密钥不匹配');
        rl.close();
        return;
      }
      
      try {
        // 生成哈希密钥
        const hashedKey = await bcrypt.hash(newKey, 10);
        
        // 读取或创建配置
        let config = {};
        if (fs.existsSync(configPath)) {
          try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          } catch (error) {
            console.log('⚠ 原配置文件格式错误，将创建新配置');
          }
        }
        
        // 更新配置 - 强制覆盖
        config.loginKey = hashedKey;
        config.jwtSecret = config.jwtSecret || 'dns_manager_secret_' + Date.now();
        config.lastUpdated = new Date().toISOString();
        
        // 保存配置
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log('');
        console.log('✅ 登录密钥重置成功!');
        console.log('   新密钥:', newKey); // 显示明文密钥
        console.log('   配置文件:', configPath);
        console.log('   更新时间:', config.lastUpdated);
        console.log('');
        console.log('⚠ 请妥善保管您的登录密钥，并删除此终端的历史记录');
        
      } catch (error) {
        console.log('❌ 重置失败:', error.message);
      }
      
      rl.close();
    });
  });
}

function showCurrentStatus() {
  console.log('');
  console.log('--- 当前配置状态 ---');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ 配置文件不存在');
    console.log('   请先运行选项1重置登录密钥');
  } else {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('✅ 配置文件存在');
      console.log('   文件路径:', configPath);
      console.log('   登录密钥:', config.loginKey ? '已设置 (哈希值)' : '未设置');
      console.log('   JWT密钥:', config.jwtSecret ? '已设置' : '未设置');
      console.log('   最后更新:', config.lastUpdated || '未知');
      
      if (config.loginKey) {
        console.log('');
        console.log('ℹ 登录密钥已加密存储，无法直接查看原始值');
        console.log('ℹ 如需重置，请选择选项1');
      }
    } catch (error) {
      console.log('❌ 配置文件格式错误:', error.message);
    }
  }
  
  console.log('');
  rl.close();
}

function generateRandomKey() {
  console.log('');
  console.log('--- 生成随机密钥 ---');
  
  // 生成随机密钥
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let randomKey = '';
  for (let i = 0; i < 16; i++) {
    randomKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  console.log('生成的随机密钥:', randomKey);
  console.log('');
  
  rl.question('是否使用此密钥作为登录密钥? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        const hashedKey = await bcrypt.hash(randomKey, 10);
        
        let config = {};
        if (fs.existsSync(configPath)) {
          try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          } catch (error) {
            console.log('⚠ 原配置文件格式错误，将创建新配置');
          }
        }
        
        config.loginKey = hashedKey;
        config.jwtSecret = config.jwtSecret || 'dns_manager_secret_' + Date.now();
        config.lastUpdated = new Date().toISOString();
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log('');
        console.log('✅ 随机密钥设置成功!');
        console.log('   登录密钥:', randomKey);
        console.log('   配置文件:', configPath);
        console.log('');
        console.log('⚠ 请妥善保管您的登录密钥!');
        
      } catch (error) {
        console.log('❌ 设置失败:', error.message);
      }
    } else {
      console.log('已取消设置');
    }
    
    rl.close();
  });
}

// 处理程序退出
rl.on('close', () => {
  console.log('');
  console.log('程序已退出');
  process.exit(0);
});

// 处理Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  console.log('程序被中断');
  rl.close();
});