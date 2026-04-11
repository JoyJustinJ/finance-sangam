const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied. Admins only.' });
    next();
};

// GET all users (to manage community)
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const result = await query('SELECT id, name, phone, role, kyc_status, joined_date, trust_score, balance FROM users ORDER BY joined_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all pending deposits
router.get('/pending-deposits', auth, isAdmin, async (req, res) => {
    try {
        const result = await query(`
      SELECT d.*, u.name as user_name, u.phone as user_phone 
      FROM deposits d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.status = 'PENDING' 
      ORDER BY d.created_at ASC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// APPROVE a deposit
router.post('/approve-deposit/:id', auth, isAdmin, async (req, res) => {
    const depositId = req.params.id;
    try {
        const depRes = await query('SELECT * FROM deposits WHERE id = $1 AND status = $2', [depositId, 'PENDING']);
        if (depRes.rows.length === 0) return res.status(404).json({ error: 'Pending deposit not found' });

        const deposit = depRes.rows[0];
        const { user_id, amount } = deposit;

        // 1. Update Deposit Status
        await query("UPDATE deposits SET status = 'COMPLETED' WHERE id = $1", [depositId]);

        // 2. Update User Balance
        await query('UPDATE users SET balance = balance + $1, total_deposited = total_deposited + $1 WHERE id = $2', [amount, user_id]);

        // 3. Mark the related transaction as COMPLETED (logic to match the amount and user)
        await query("UPDATE transactions SET status = 'COMPLETED' WHERE user_id = $1 AND amount = $2 AND status = 'PENDING'", [user_id, amount]);

        res.json({ message: 'Deposit approved and balance updated!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// APPROVE a user KYC
router.post('/approve-user/:id', auth, isAdmin, async (req, res) => {
    try {
        await query("UPDATE users SET kyc_status = 'verified' WHERE id = $1", [req.params.id]);
        res.json({ message: 'User verified!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// REJECT a deposit
router.post('/reject-deposit/:id', auth, isAdmin, async (req, res) => {
    const depositId = req.params.id;
    try {
        const depRes = await query('SELECT * FROM deposits WHERE id = $1', [depositId]);
        if (depRes.rows.length === 0) return res.status(404).json({ error: 'Deposit not found' });

        const { user_id, amount } = depRes.rows[0];

        await query("UPDATE deposits SET status = 'REJECTED' WHERE id = $1", [depositId]);
        await query(
            "UPDATE transactions SET status = 'FAILED' WHERE user_id = $1 AND amount = $2 AND status = 'PENDING' AND type = 'credit'",
            [user_id, amount]
        );
        res.json({ message: 'Deposit rejected' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all pending loans
router.get('/pending-loans', auth, isAdmin, async (req, res) => {
    try {
        const result = await query(`
            SELECT l.*, u.name as user_name, u.phone as user_phone 
            FROM loans l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.status = 'PENDING' 
            ORDER BY l.created_at ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// APPROVE a loan
router.post('/approve-loan/:id', auth, isAdmin, async (req, res) => {
    const loanId = req.params.id;
    try {
        const loanRes = await query("SELECT * FROM loans WHERE id = $1 AND status = 'PENDING'", [loanId]);
        if (loanRes.rows.length === 0) return res.status(404).json({ error: 'Pending loan not found' });

        const loan = loanRes.rows[0];
        const { user_id, amount } = loan;

        // 1. Update Loan Status
        await query("UPDATE loans SET status = 'ACTIVE' WHERE id = $1", [loanId]);

        // 2. Update User Balance & Borrowed Amount
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        await query(
            "UPDATE users SET balance = balance + $1, borrowed_amount = borrowed_amount + $1, next_payment_date = $2 WHERE id = $3",
            [amount, nextPaymentDate.toISOString().split('T')[0], user_id]
        );

        // 3. Mark the transaction as COMPLETED
        await query(
            "INSERT INTO transactions (user_id, type, title, description, amount, status) VALUES ($1,'debit','Loan Disbursed','Community Loan',$2,'COMPLETED')",
            [user_id, amount]
        );

        res.json({ message: 'Loan approved and disbursed!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// REJECT a loan
router.post('/reject-loan/:id', auth, isAdmin, async (req, res) => {
    const loanId = req.params.id;
    try {
        await query("UPDATE loans SET status = 'REJECTED' WHERE id = $1 AND status = 'PENDING'", [loanId]);
        res.json({ message: 'Loan rejected' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// TOTAL SYSTEM WIPE (Dangerous - Admins only)
router.post('/wipe-system', auth, isAdmin, async (req, res) => {
    try {
        await query('TRUNCATE transactions, deposits, loans CASCADE;');
        await query("DELETE FROM users WHERE role != 'admin'");
        await query("UPDATE users SET balance = 0, total_deposited = 0, interest_earned = 0, borrowed_amount = 0 WHERE role = 'admin'");
        res.json({ message: 'System wiped successfully. Start fresh!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
