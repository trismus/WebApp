/**
 * Activity Controller
 * Handles activity logs and statistics
 */

const pool = require('../config/database');

/**
 * Get current user's activity logs
 * @route GET /api/activity/me
 * @access Private
 */
const getMyActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        id, action, resource_type, resource_id,
        details, ip_address, user_agent, created_at
      FROM activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM activity_logs
      WHERE user_id = $1
    `;

    const [logsResult, countResult] = await Promise.all([
      pool.query(query, [userId, limit, offset]),
      pool.query(countQuery, [userId])
    ]);

    res.json({
      success: true,
      activities: logsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get my activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity logs'
    });
  }
};

/**
 * Get all activity logs (operator/admin only)
 * @route GET /api/activity/all
 * @access Private (Operator, Administrator)
 */
const getAllActivity = async (req, res) => {
  try {
    const { limit = 100, offset = 0, userId, action } = req.query;

    // Build query dynamically based on filters
    let query = `
      SELECT
        al.id, al.user_id, al.action, al.resource_type,
        al.resource_id, al.details, al.ip_address,
        al.user_agent, al.created_at,
        u.name, u.email, u.role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM activity_logs al
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Add filters
    if (userId) {
      const userFilter = ` AND al.user_id = $${paramCount}`;
      query += userFilter;
      countQuery += userFilter;
      values.push(userId);
      paramCount++;
    }

    if (action) {
      const actionFilter = ` AND al.action = $${paramCount}`;
      query += actionFilter;
      countQuery += actionFilter;
      values.push(action);
      paramCount++;
    }

    // Add ordering and pagination
    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    const queryValues = [...values, limit, offset];

    const [logsResult, countResult] = await Promise.all([
      pool.query(query, queryValues),
      pool.query(countQuery, values)
    ]);

    res.json({
      success: true,
      activities: logsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get all activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity logs'
    });
  }
};

/**
 * Get activity statistics
 * @route GET /api/activity/stats
 * @access Private
 */
const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Different stats based on role
    if (userRole === 'administrator' || userRole === 'operator') {
      // System-wide stats for operators and admins
      const query = `
        SELECT
          COUNT(*) as total_activities,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT CASE WHEN action = 'login' THEN id END) as total_logins,
          COUNT(DISTINCT CASE WHEN action = 'settings_update' THEN id END) as settings_changes,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN user_id END) as active_users_24h,
          COUNT(DISTINCT CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN user_id END) as active_users_7d
        FROM activity_logs
      `;

      const result = await pool.query(query);

      // Get top actions
      const topActionsQuery = `
        SELECT action, COUNT(*) as count
        FROM activity_logs
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `;

      const topActionsResult = await pool.query(topActionsQuery);

      res.json({
        success: true,
        stats: result.rows[0],
        topActions: topActionsResult.rows
      });
    } else {
      // Personal stats for regular users
      const query = `
        SELECT
          COUNT(*) as total_activities,
          COUNT(DISTINCT CASE WHEN action = 'login' THEN id END) as total_logins,
          COUNT(DISTINCT CASE WHEN action = 'settings_update' THEN id END) as settings_changes,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          MAX(created_at) as last_activity_at
        FROM activity_logs
        WHERE user_id = $1
      `;

      const result = await pool.query(query, [userId]);

      // Get recent actions
      const recentActionsQuery = `
        SELECT action, COUNT(*) as count
        FROM activity_logs
        WHERE user_id = $1
        GROUP BY action
        ORDER BY count DESC
        LIMIT 5
      `;

      const recentActionsResult = await pool.query(recentActionsQuery, [userId]);

      res.json({
        success: true,
        stats: result.rows[0],
        recentActions: recentActionsResult.rows
      });
    }
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity statistics'
    });
  }
};

module.exports = {
  getMyActivity,
  getAllActivity,
  getActivityStats
};
