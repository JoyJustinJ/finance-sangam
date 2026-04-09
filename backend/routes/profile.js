const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const userRes = await query('SELECT id, name, phone, role, kyc_status, joined_date, trust_score, balance, total_deposited, interest_earned, borrowed_amount FROM users WHERE id = $1', [req.user.id]);
        if (!userRes.rows[0]) return res.status(404).json({ error: 'User not found' });
        const txRes = await query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
        res.json({ user: userRes.rows[0], transactions: txRes.rows });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/', auth, async (req, res) => {
    const { name } = req.body;
    if (name) await query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
    const userRes = await query('SELECT id, name, phone, role, kyc_status, joined_date, trust_score FROM users WHERE id = $1', [req.user.id]);
    res.json({ user: userRes.rows[0] });
});

module.exports = router;
