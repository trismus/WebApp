/**
 * Settings Routes
 * Routes for user settings and system settings
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { logSettingsUpdate } = require('../middleware/activityLogger');
const {
  getSettings,
  updateSettings,
  getSystemSettings
} = require('../controllers/settingsController');

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get('/', authMiddleware, getSettings);

// @route   PUT /api/settings
// @desc    Update user settings
// @access  Private
router.put('/', authMiddleware, logSettingsUpdate, updateSettings);

// @route   GET /api/settings/system
// @desc    Get system settings (admin only)
// @access  Private (Administrator)
router.get('/system', authMiddleware, requireAdmin, getSystemSettings);

module.exports = router;
