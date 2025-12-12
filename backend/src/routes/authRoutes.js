const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../utils/validators');
const { logLogin, logRegister } = require('../middleware/activityLogger');

// Public routes
router.post('/register', registerValidation, logRegister, authController.register);
router.post('/login', loginValidation, logLogin, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
