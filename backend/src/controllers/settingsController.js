/**
 * Settings Controller
 * Handles user settings and system settings
 */

const pool = require('../config/database');

/**
 * Get user settings
 * @route GET /api/settings
 * @access Private
 */
const getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT
        id, user_id, theme, notifications_enabled,
        email_notifications, language, timezone,
        settings_data, created_at, updated_at
      FROM user_settings
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      const createQuery = `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        RETURNING *
      `;
      const createResult = await pool.query(createQuery, [userId]);
      return res.json({
        success: true,
        settings: createResult.rows[0]
      });
    }

    res.json({
      success: true,
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings'
    });
  }
};

/**
 * Update user settings
 * @route PUT /api/settings
 * @access Private
 */
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      theme,
      notifications_enabled,
      email_notifications,
      language,
      timezone,
      settings_data
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (theme !== undefined) {
      updates.push(`theme = $${paramCount++}`);
      values.push(theme);
    }
    if (notifications_enabled !== undefined) {
      updates.push(`notifications_enabled = $${paramCount++}`);
      values.push(notifications_enabled);
    }
    if (email_notifications !== undefined) {
      updates.push(`email_notifications = $${paramCount++}`);
      values.push(email_notifications);
    }
    if (language !== undefined) {
      updates.push(`language = $${paramCount++}`);
      values.push(language);
    }
    if (timezone !== undefined) {
      updates.push(`timezone = $${paramCount++}`);
      values.push(timezone);
    }
    if (settings_data !== undefined) {
      updates.push(`settings_data = $${paramCount++}`);
      values.push(JSON.stringify(settings_data));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No settings provided to update'
      });
    }

    values.push(userId);
    const query = `
      UPDATE user_settings
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Update settings error:', error);

    // Handle check constraint violations
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Invalid setting value provided'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

/**
 * Get system settings (admin only)
 * @route GET /api/settings/system
 * @access Private (Administrator)
 */
const getSystemSettings = async (req, res) => {
  try {
    // Get system statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'administrator') as admin_count,
        (SELECT COUNT(*) FROM users WHERE role = 'operator') as operator_count,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as user_count,
        (SELECT COUNT(*) FROM activity_logs) as total_activities,
        (SELECT COUNT(*) FROM analytics_events) as total_events,
        (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
        (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > NOW() - INTERVAL '30 days') as active_users_30d
    `;

    const statsResult = await pool.query(statsQuery);

    // Get database info
    const dbInfoQuery = `
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        current_database() as database_name,
        version() as postgres_version
    `;

    const dbInfoResult = await pool.query(dbInfoQuery);

    // Get recent activity summary
    const activityQuery = `
      SELECT
        action,
        COUNT(*) as count
      FROM activity_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `;

    const activityResult = await pool.query(activityQuery);

    res.json({
      success: true,
      system: {
        statistics: statsResult.rows[0],
        database: dbInfoResult.rows[0],
        recentActivity: activityResult.rows
      }
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getSystemSettings
};
