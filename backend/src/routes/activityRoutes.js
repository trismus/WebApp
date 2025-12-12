/**
 * Activity Routes
 * Routes for activity logs and statistics
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
  getMyActivity,
  getAllActivity,
  getActivityStats
} = require('../controllers/activityController');

// @route   GET /api/activity/me
// @desc    Get current user's activity logs
// @access  Private
router.get('/me', authMiddleware, getMyActivity);

// @route   GET /api/activity/stats
// @desc    Get activity statistics
// @access  Private
router.get('/stats', authMiddleware, getActivityStats);

// @route   GET /api/activity/all
// @desc    Get all activity logs (operator/admin only)
// @access  Private (Operator, Administrator)
router.get('/all', authMiddleware, checkRole(['operator', 'administrator']), getAllActivity);

module.exports = router;
