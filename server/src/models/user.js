const bcrypt = require('bcryptjs');

class User {
  constructor(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
  }

  static async findByUsername(username) {
    // In a real implementation, this would query a database
    // For demo purposes, we'll use a mock user
    if (username === 'admin') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      return new User(1, 'admin', hashedPassword);
    }
    return null;
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
}

module.exports = User;