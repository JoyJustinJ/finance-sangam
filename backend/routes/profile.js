const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const userRes = await query('SELECT id, name, phone, role, kyc_status, joined_date, trust_score, balance, total_deposited, interest_earned, borrowed_amount, avatar_url, two_factor_enabled FROM users WHERE id = $1', [req.user.id]);
        if (!userRes.rows[0]) return res.status(404).json({ error: 'User not found' });
        const txRes = await query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
        res.json({ user: userRes.rows[0], transactions: txRes.rows });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/', auth, async (req, res) => {
    const { name, currentPassword, newPassword, avatar_url, two_factor_enabled } = req.body;
    try {
        if (name) await query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
        if (avatar_url !== undefined) await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatar_url, req.user.id]);
        if (two_factor_enabled !== undefined) await query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [two_factor_enabled, req.user.id]);

        if (currentPassword && newPassword) {
            const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
            const valid = bcrypt.compareSync(currentPassword, userRes.rows[0].password_hash);
            if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
            const newHash = bcrypt.hashSync(newPassword, 10);
            await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);
        }

        const updated = await query('SELECT id, name, phone, role, kyc_status, joined_date, trust_score, balance, total_deposited, interest_earned, borrowed_amount, avatar_url, two_factor_enabled FROM users WHERE id = $1', [req.user.id]);
        res.json({ message: 'Profile updated successfully', user: updated.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
