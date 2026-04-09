const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const result = await query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
        res.json({ transactions: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    const { type, title, description, amount, status } = req.body;
    if (!type || !title || !amount) return res.status(400).json({ error: 'type, title and amount are required' });
    try {
        const result = await query(
            'INSERT INTO transactions (user_id, type, title, description, amount, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
            [req.user.id, type, title, description || '', amount, status || 'COMPLETED']
        );
        res.status(201).json({ transaction: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
