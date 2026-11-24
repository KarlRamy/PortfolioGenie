const express = require('express');
const router = express.Router();
const { createPortfolio, getPortfolioBySlug, updatePortfolio, deletePortfolio } = require('../controllers/portfolioController');

router.post('/', createPortfolio);

router.get('/:slug', getPortfolioBySlug);

router.patch('/:slug', updatePortfolio);

module.exports = router;