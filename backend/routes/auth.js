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

        if (user.two_factor_enabled) {
            return res.json({
                two_factor_required: true,
                phone: user.phone,
                temp_token: jwt.sign({ id: user.id, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' })
            });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: { id: user.id, name: user.name, phone: user.phone, role: user.role, kyc_status: user.kyc_status, joined_date: user.joined_date, trust_score: user.trust_score, avatar_url: user.avatar_url, two_factor_enabled: user.two_factor_enabled }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password)
        return res.status(400).json({ error: 'All fields are required' });

    try {
        const existing = await query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (existing.rows.length > 0)
            return res.status(400).json({ error: 'Phone number already registered' });

        const hash = bcrypt.hashSync(password, 10);
        const joined_date = new Date().toISOString().split('T')[0];

        const result = await query(`
            INSERT INTO users (name, phone, password_hash, role, kyc_status, joined_date, trust_score, balance)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, phone, role
        `, [name, phone, hash, 'member', 'pending', joined_date, 750, 0]);

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { ...user, kyc_status: 'pending' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

router.post('/verify-2fa', async (req, res) => {
    const { phone, code, temp_token } = req.body;
    try {
        // Verify temp token
        const decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
        if (!decoded.temp) return res.status(401).json({ error: 'Invalid session' });

        // MOCK: In production, check against Redis/DB for real OTP
        if (code !== '123456') return res.status(400).json({ error: 'Invalid 2FA code. Hint: use 123456 for demo.' });

        const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, phone: user.phone, role: user.role, kyc_status: user.kyc_status, joined_date: user.joined_date, trust_score: user.trust_score, avatar_url: user.avatar_url, two_factor_enabled: user.two_factor_enabled }
        });
    } catch (err) {
        res.status(401).json({ error: 'Session expired. Please login again.' });
    }
});

module.exports = router;
