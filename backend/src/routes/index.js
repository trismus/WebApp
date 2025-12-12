const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const settingsRoutes = require('./settingsRoutes');
const activityRoutes = require('./activityRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/activity', activityRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
