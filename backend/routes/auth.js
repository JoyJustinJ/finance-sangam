const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password)
        return res.status(400).json({ error: 'Phone and password are required' });

    try {
        const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid phone number or password' });

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid phone number or password' });

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: { id: user.id, name: user.name, phone: user.phone, role: user.role, kyc_status: user.kyc_status, joined_date: user.joined_date, trust_score: user.trust_score }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
