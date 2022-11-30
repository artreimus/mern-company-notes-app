const express = require('express');
const router = express.Router();
const { login, refresh, logout } = require('../controllers/authController');
const loginLimiterMiddleware = require('../middleware/loginLimiter');

router.route('/').post(loginLimiterMiddleware, login);
router.route('/refresh').get(refresh);
router.route('/logout').post(logout);

module.exports = router;
