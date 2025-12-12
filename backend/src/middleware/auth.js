const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user role from database
    const query = 'SELECT id, role FROM users WHERE id = $1';
    const result = await pool.query(query, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user info with role to request
    req.user = {
      userId: decoded.userId,
      role: result.rows[0].role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token is not valid' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
