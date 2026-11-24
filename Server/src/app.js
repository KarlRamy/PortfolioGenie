const express = require('express');
const cors = require('cors');

const portfolioRoutes = require('./routes/portfolioRoutes');
const githubRoutes = require('./routes/githubRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/portfolios', portfolioRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;