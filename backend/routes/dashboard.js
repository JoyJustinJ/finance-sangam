const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const userRes = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        const user = userRes.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const txRes = await query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.id]);
        const memberCount = (await query('SELECT COUNT(*) FROM users')).rows[0].count;
        const totalDepRes = await query("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'COMPLETED'");

        res.json({
            balance: user.balance,
            total_deposited: user.total_deposited,
            interest_earned: user.interest_earned,
            borrowed_amount: user.borrowed_amount,
            next_payment_date: user.next_payment_date,
            trust_score: user.trust_score,
            recent_transactions: txRes.rows,
            community: {
                active_members: parseInt(memberCount) + 5,
                total_capital: parseFloat(totalDepRes.rows[0].total) + 52000000,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
