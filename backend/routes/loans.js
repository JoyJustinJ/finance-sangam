const express = require('express');
const { query } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const userRes = await query('SELECT trust_score, balance FROM users WHERE id = $1', [req.user.id]);
        const user = userRes.rows[0];
        const maxEligibility = Math.min(user.trust_score * 300, 250000);
        const loans = await query('SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json({ loans: loans.rows, max_eligibility: maxEligibility, trust_score: user.trust_score, interest_rate: 8.5 });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    const { amount, months } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid loan amount' });
    const parsedAmount = parseFloat(amount);
    const parsedMonths = parseInt(months) || 12;
    try {
        const userRes = await query('SELECT trust_score FROM users WHERE id = $1', [req.user.id]);
        const user = userRes.rows[0];
        const maxEligibility = Math.min(user.trust_score * 300, 250000);
        if (parsedAmount > maxEligibility) return res.status(400).json({ error: `Maximum loan eligibility is ₹${maxEligibility.toLocaleString('en-IN')}` });

        const monthlyRate = 8.5 / 12 / 100;
        const emi = (parsedAmount * monthlyRate * Math.pow(1 + monthlyRate, parsedMonths)) / (Math.pow(1 + monthlyRate, parsedMonths) - 1);
        const processingFee = parsedAmount * 0.02;

        const loan = await query(
            "INSERT INTO loans (user_id, amount, interest_rate, months, monthly_installment, status) VALUES ($1,$2,$3,$4,$5,'ACTIVE') RETURNING *",
            [req.user.id, parsedAmount, 8.5, parsedMonths, emi.toFixed(2)]
        );

        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        await query('UPDATE users SET borrowed_amount = borrowed_amount + $1, balance = balance + $1, next_payment_date = $2 WHERE id = $3',
            [parsedAmount, nextPaymentDate.toISOString().split('T')[0], req.user.id]);
        await query(
            "INSERT INTO transactions (user_id, type, title, description, amount, status) VALUES ($1,'debit','Loan Disbursed','Community Loan',$2,'COMPLETED')",
            [req.user.id, parsedAmount]
        );

        res.status(201).json({ message: 'Loan approved and disbursed', loan: loan.rows[0], monthly_installment: Math.round(emi), processing_fee: Math.round(processingFee) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/repay', auth, async (req, res) => {
    const { loanId } = req.body;
    if (!loanId) return res.status(400).json({ error: 'Loan ID required' });

    try {
        const loanRes = await query("SELECT * FROM loans WHERE id = $1 AND user_id = $2 AND status = 'ACTIVE'", [loanId, req.user.id]);
        const loan = loanRes.rows[0];
        if (!loan) return res.status(404).json({ error: 'Active loan not found' });

        const userRes = await query("SELECT balance FROM users WHERE id = $1", [req.user.id]);
        const user = userRes.rows[0];

        const emi = parseFloat(loan.monthly_installment) || 0;
        if (parseFloat(user.balance) < emi) {
            return res.status(400).json({ error: 'Insufficient balance. Please deposit funds first.' });
        }

        // Deduct EMI from balance and borrowed_amount
        await query(
            "UPDATE users SET balance = balance - $1, borrowed_amount = GREATEST(borrowed_amount - $1, 0) WHERE id = $2",
            [emi, req.user.id]
        );

        // Update loan remaining amount and months
        const newLoanAmount = Math.max(parseFloat(loan.amount) - (parseFloat(loan.amount) / parseFloat(loan.months)), 0);
        const newMonths = Math.max(parseInt(loan.months) - 1, 0);
        const newStatus = (newMonths <= 0 || newLoanAmount <= 0) ? 'COMPLETED' : 'ACTIVE';

        await query(
            "UPDATE loans SET amount = $1, months = $2, status = $3 WHERE id = $4",
            [newLoanAmount, newMonths, newStatus, loanId]
        );

        // Record repayment transaction
        await query(
            "INSERT INTO transactions (user_id, type, title, description, amount, status) VALUES ($1, 'credit', 'Loan Repayment', 'EMI Payment', $2, 'COMPLETED')",
            [req.user.id, emi]
        );

        res.json({ message: 'EMI repayment successful', loanId, newStatus, emiPaid: emi });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during repayment' });
    }
});

module.exports = router;
