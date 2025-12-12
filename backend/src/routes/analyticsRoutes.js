/**
 * Analytics Routes
 * Routes for analytics data and insights
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { checkRole, requireAdmin } = require('../middleware/roleCheck');
const {
  getMyAnalytics,
  getOperatorAnalytics,
  getSystemAnalytics,
  refreshAnalytics
} = require('../controllers/analyticsController');

// @route   GET /api/analytics/me
// @desc    Get personal analytics
// @access  Private
router.get('/me', authMiddleware, getMyAnalytics);

// @route   GET /api/analytics/operator
// @desc    Get operator analytics overview
// @access  Private (Operator, Administrator)
router.get('/operator', authMiddleware, checkRole(['operator', 'administrator']), getOperatorAnalytics);

// @route   GET /api/analytics/system
// @desc    Get system analytics (admin only)
// @access  Private (Administrator)
router.get('/system', authMiddleware, requireAdmin, getSystemAnalytics);

// @route   POST /api/analytics/refresh
// @desc    Refresh analytics materialized view
// @access  Private (Administrator)
router.post('/refresh', authMiddleware, requireAdmin, refreshAnalytics);

module.exports = router;
