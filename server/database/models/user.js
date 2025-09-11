const db = require('../db');

class User {
  static getAll(callback) {
    db.all('SELECT * FROM users', callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  }

  static create(user, callback) {
    const { name, email } = user;
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', 
      [name, email], 
      function(err) {
        callback(err, this ? this.lastID : null);
      }
    );
  }

  static update(id, user, callback) {
    const { name, email } = user;
    db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', 
      [name, email, id], 
      function(err) {
        callback(err, this.changes);
      }
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      callback(err, this.changes);
    });
  }
}

module.exports = User;