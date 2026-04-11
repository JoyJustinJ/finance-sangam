require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function wipeDatabase() {
    console.log('--- Starting Database Operations ---');
    try {
        // 1. Wipe all activity tables
        console.log('Clearing transactions, deposits, and loans...');
        await pool.query('TRUNCATE transactions, deposits, loans CASCADE;');

        // 2. Remove all non-admin users
        console.log('Removing non-admin users...');
        await pool.query('DELETE FROM users WHERE role != \'admin\';');

        // 3. Reset Admin balance to zero
        console.log('Resetting Admin balance to ₹0...');
        await pool.query(`
      UPDATE users 
      SET balance = 0, 
          total_deposited = 0, 
          interest_earned = 0, 
          borrowed_amount = 0 
      WHERE role = 'admin';
    `);

        // 4. Add missing columns for new features (Avatar, 2FA)
        console.log('Upgrading database schema for new features...');
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
    `);

        console.log('✅ DATABASE WIPE & UPGRADE COMPLETE.');
        console.log('The system is now ready for REAL community members.');
        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR DURING WIPE:', err);
        process.exit(1);
    }
}

wipeDatabase();
