const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
router.use('/auth', authRoutes);

module.exports = router;
