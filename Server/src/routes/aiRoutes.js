const routes = require('express').Router();
const aiController = require('../controllers/aiController');

routes.post('/optimize-project-description', aiController.projectDescription);

routes.post('/generate-about', aiController.generateAboutSection);

routes.post('/build-portfolio', aiController.buildPortfolioWithAi);

module.exports = routes;