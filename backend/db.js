const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      kyc_status TEXT DEFAULT 'verified',
      joined_date TEXT DEFAULT CURRENT_DATE::TEXT,
      trust_score INTEGER DEFAULT 750,
      balance NUMERIC DEFAULT 0,
      total_deposited NUMERIC DEFAULT 0,
      interest_earned NUMERIC DEFAULT 0,
      borrowed_amount NUMERIC DEFAULT 0,
      next_payment_date TEXT,
      avatar_url TEXT,
      two_factor_enabled BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount NUMERIC NOT NULL,
      status TEXT DEFAULT 'COMPLETED',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount NUMERIC NOT NULL,
      method TEXT DEFAULT 'UPI',
      status TEXT DEFAULT 'COMPLETED',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount NUMERIC NOT NULL,
      interest_rate NUMERIC DEFAULT 8.5,
      months INTEGER DEFAULT 12,
      monthly_installment NUMERIC,
      status TEXT DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT NOW()
    );

  `);

  // Seed primary admin user if not exists
  const bcrypt = require('bcryptjs');
  const existing = await query('SELECT id FROM users WHERE phone = $1', ['9922334455']);
  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync('admin_g_in', 10);
    await query(`
      INSERT INTO users (name, phone, password_hash, role, kyc_status, joined_date, trust_score, balance, total_deposited, interest_earned, borrowed_amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, ['Admin Instance', '9922334455', hash, 'admin', 'verified', '2024-01-01', 850, 0, 0, 0, 0]);
    console.log('✅ Admin account created.');
  }
}

module.exports = { query, initDb };
