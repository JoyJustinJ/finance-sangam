const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const userCount = await query('SELECT COUNT(*) AS count FROM users');
        const totalDep = await query("SELECT COALESCE(SUM(amount),0) as total FROM deposits WHERE status='COMPLETED'");
        const totalLoans = await query("SELECT COALESCE(SUM(amount),0) as total FROM loans WHERE status='ACTIVE'");
        const totalRepayments = await query("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='credit' AND title LIKE '%repay%'");
        const membersRes = await query("SELECT id, name, avatar_url, joined_date, total_deposited, trust_score FROM users ORDER BY total_deposited DESC");

        const maxDeposit = Math.max(...membersRes.rows.map(u => parseFloat(u.total_deposited) || 0), 1);
        const members = membersRes.rows.map(u => ({
            ...u,
            contribution_pct: Math.round((parseFloat(u.total_deposited) / maxDeposit) * 100),
            level: u.trust_score >= 800 ? 'Elite' : u.trust_score >= 600 ? 'Active' : 'Member',
            joined_date: u.joined_date || 'Recently',
        }));

        res.json({
            total_members: parseInt(userCount.rows[0].count),
            total_pooled: parseFloat(totalDep.rows[0].total),
            total_loans: parseFloat(totalLoans.rows[0].total),
            total_repayments: parseFloat(totalRepayments.rows[0].total),
            members,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
