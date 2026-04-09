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
      next_payment_date TEXT
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

    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      joined_date TEXT,
      avatar_url TEXT,
      contribution_pct INTEGER DEFAULT 50,
      level TEXT DEFAULT 'Rising'
    );
  `);

  // Seed admin user if not exists
  const bcrypt = require('bcryptjs');
  const existing = await query('SELECT id FROM users WHERE phone = $1', ['9922334455']);
  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync('admin_g_in', 10);
    const adminRes = await query(`
      INSERT INTO users (name, phone, password_hash, role, kyc_status, joined_date, trust_score, balance, total_deposited, interest_earned, borrowed_amount, next_payment_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id
    `, ['Vikram Malhotra', '9922334455', hash, 'admin', 'verified', '2022-01-12', 840, 428500, 350000, 12450, 65000, '2023-10-24']);
    const adminId = adminRes.rows[0].id;

    const txData = [
      ['credit', 'Monthly Savings Deposit', 'Sangam Pool #42', 5000, 'COMPLETED'],
      ['debit', 'Loan Repayment', 'Personal Loan ID: 902', 2400, 'PROCESSING'],
      ['credit', 'Interest Credited', 'Annual Yield Adjustment', 1240.50, 'COMPLETED'],
      ['credit', 'Monthly Interest Payout', 'Interest auto-credit', 4250, 'COMPLETED'],
      ['debit', 'Emergency Personal Loan', 'Community Loan', 50000, 'COMPLETED'],
      ['credit', 'Savings Pool Deposit', 'Monthly deposit', 15000, 'COMPLETED'],
      ['credit', 'Referral Bonus', 'Referral reward', 500, 'COMPLETED'],
      ['debit', 'Loan EMI Repayment', 'Auto EMI deduction', 5200, 'COMPLETED'],
    ];
    for (const [type, title, description, amount, status] of txData) {
      await query(
        'INSERT INTO transactions (user_id, type, title, description, amount, status) VALUES ($1,$2,$3,$4,$5,$6)',
        [adminId, type, title, description, amount, status]
      );
    }

    const memberData = [
      ['Priya Sharma', 'Oct 2023', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdGWdwLSvcqH-I_NHECFSp_4aT3E9kaiOzfzAZVAaY-rn0WZUMKZ-1l8bskFTYFvvhEHcW4dCd--wMG5tuf5FBKyzd4qsXtTr2nZxWLvSXUWYRmPsFHYgirp39-qjyNldXy4yDWdd7SDdCII3HaCSUAWs5zY-gI7lgNP5aAC8gddfltevYsD5Ld6dOVv-KWoY5IXDUVqlc9Ulw4I_BiKUfblWcv5Ee6oZnFZTsH9_QInFZZWiLsVxu6dffCTce5Zltt8OU0k506Gw', 88, 'Master'],
      ['Rahul Verma', 'Jan 2024', null, 45, 'Rising'],
      ['Sara Khan', 'Dec 2023', null, 72, 'Core'],
      ['Arun Patel', 'Mar 2023', null, 95, 'Master'],
      ['Meera Joshi', 'Jun 2023', null, 61, 'Core'],
    ];
    for (const [name, joined_date, avatar_url, contribution_pct, level] of memberData) {
      await query(
        'INSERT INTO members (name, joined_date, avatar_url, contribution_pct, level) VALUES ($1,$2,$3,$4,$5)',
        [name, joined_date, avatar_url, contribution_pct, level]
      );
    }
    console.log('✅ Database seeded with admin user and demo data');
  }
}

module.exports = { query, initDb };
