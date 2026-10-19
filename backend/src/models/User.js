const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, business_name, phone }) {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, business_name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, business_name, phone',
      [email, password_hash, business_name, phone]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT id, email, business_name, phone, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = User;