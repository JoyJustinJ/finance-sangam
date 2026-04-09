const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const deposits = await query('SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const userRes = await query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    res.json({ deposits: deposits.rows, available_balance: userRes.rows[0].balance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { amount, method } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid deposit amount' });
  const parsedAmount = parseFloat(amount);
  try {
    const deposit = await query(
      "INSERT INTO deposits (user_id, amount, method, status) VALUES ($1,$2,$3,'PENDING') RETURNING *",
      [req.user.id, parsedAmount, method || 'UPI']
    );
    // REMOVED: Auto balance update. This must be done via Admin Approval route.
    await query(
      "INSERT INTO transactions (user_id, type, title, description, amount, status) VALUES ($1,'credit','Deposit Request',$2,$3,'PENDING')",
      [req.user.id, `${method || 'UPI'} Deposit Request`, parsedAmount]
    );
    res.status(201).json({
      message: 'Deposit request submitted. Waiting for admin approval.',
      deposit: deposit.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
