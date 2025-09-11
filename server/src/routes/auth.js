const express = require('express');
const { login, logout, getProfile } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticate, getProfile);

module.exports = router;