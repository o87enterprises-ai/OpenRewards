require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const rewardsRoutes = require('./routes/rewards');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ success: true }));
app.use('/api/auth', authRoutes);
app.use('/api/rewards', rewardsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`OpenRewards server listening on :${port}`));
