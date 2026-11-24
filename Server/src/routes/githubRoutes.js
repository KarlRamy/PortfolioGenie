const routes = require('express').Router();
const githubController = require('../controllers/githubController');

routes.get('/:username', githubController.getGithubUser);

module.exports = routes;