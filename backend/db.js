const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL !== 'postgresql://user:password@host/dbname';
const bcrypt = require('bcryptjs');

let query;
let pool;

if (isPostgres) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });

  query = async (text, params) => {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  };
} else {
  const Database = require('better-sqlite3');
  const db = new Database('sangam.db');

  query = async (text, params = []) => {
    // Basic conversion of Postgres syntax $1, $2 to SQLite ?, ?
    let sqliteText = text.replace(/\$\d+/g, '?');

    // Convert 'CURRENT_DATE::TEXT' to 'CURRENT_DATE'
    sqliteText = sqliteText.replace(/CURRENT_DATE::TEXT/gi, "CURRENT_DATE");

    // SQLite Schema conversions
    sqliteText = sqliteText.replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    sqliteText = sqliteText.replace(/TIMESTAMP DEFAULT NOW\(\)/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP');

    try {
      if (sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.trim().toUpperCase().startsWith('WITH') || sqliteText.toUpperCase().includes('RETURNING')) {
        const rows = db.prepare(sqliteText).all(...params);
        return { rows, rowCount: rows.length };
      } else {
        // For multiple DDL statements without params, db.exec must be used in better-sqlite3
        if (params.length === 0 && sqliteText.includes(';')) {
          db.exec(sqliteText);
          return { rows: [], rowCount: 0 };
        } else {
          const info = db.prepare(sqliteText).run(...params);
          return { rows: [], rowCount: info.changes };
        }
      }
    } catch (err) {
      throw new Error(err.message + ' \nQuery failed: ' + sqliteText.slice(0, 200));
    }
  };
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

  // Safe column migrations for existing databases (add missing columns if not present)
  // SQLite doesn't support IF NOT EXISTS in ADD COLUMN, so we rely on the catch block to ignore duplicates
  const migrations = [
    `ALTER TABLE users ADD COLUMN avatar_url TEXT`,
    `ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN total_deposited NUMERIC DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN interest_earned NUMERIC DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN borrowed_amount NUMERIC DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN next_payment_date TEXT`,
    `ALTER TABLE users ADD COLUMN trust_score INTEGER DEFAULT 750`,
    `ALTER TABLE users ADD COLUMN balance NUMERIC DEFAULT 0`,
  ];
  for (const sql of migrations) {
    await query(sql).catch((e) => console.warn('Migration skipped:', e.message));
  }

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
