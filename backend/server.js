require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/community', require('./routes/community'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Finance Sangam backend running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database init failed:', err.message);
    process.exit(1);
});
