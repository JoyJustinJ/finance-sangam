const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const members = await query('SELECT * FROM members ORDER BY contribution_pct DESC');
        const userCount = await query('SELECT COUNT(*) FROM users');
        const totalDep = await query("SELECT COALESCE(SUM(amount),0) as total FROM deposits WHERE status='COMPLETED'");
        const totalLoans = await query("SELECT COALESCE(SUM(amount),0) as total FROM loans WHERE status='ACTIVE'");
        const totalRepayments = await query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='credit' AND title ILIKE '%repay%'");

        res.json({
            total_members: parseInt(userCount.rows[0].count) + members.rows.length,
            total_pooled: parseFloat(totalDep.rows[0].total),
            total_loans: parseFloat(totalLoans.rows[0].total),
            total_repayments: parseFloat(totalRepayments.rows[0].total),
            members: members.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
