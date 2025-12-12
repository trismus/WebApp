/**
 * Analytics Controller
 * Handles analytics data and insights
 */

const pool = require('../config/database');

/**
 * Get personal analytics
 * @route GET /api/analytics/me
 * @access Private
 */
const getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user summary from materialized view
    const summaryQuery = `
      SELECT *
      FROM user_analytics_summary
      WHERE user_id = $1
    `;

    const summaryResult = await pool.query(summaryQuery, [userId]);

    // Get login history (last 30 days)
    const loginHistoryQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM activity_logs
      WHERE user_id = $1
        AND action = 'login'
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const loginHistoryResult = await pool.query(loginHistoryQuery, [userId]);

    // Get activity trend (last 7 days)
    const activityTrendQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM activity_logs
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const activityTrendResult = await pool.query(activityTrendQuery, [userId]);

    // Get action breakdown
    const actionBreakdownQuery = `
      SELECT
        action,
        COUNT(*) as count
      FROM activity_logs
      WHERE user_id = $1
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `;

    const actionBreakdownResult = await pool.query(actionBreakdownQuery, [userId]);

    res.json({
      success: true,
      analytics: {
        summary: summaryResult.rows[0] || {},
        loginHistory: loginHistoryResult.rows,
        activityTrend: activityTrendResult.rows,
        actionBreakdown: actionBreakdownResult.rows
      }
    });
  } catch (error) {
    console.error('Get my analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal analytics'
    });
  }
};

/**
 * Get operator analytics overview
 * @route GET /api/analytics/operator
 * @access Private (Operator, Administrator)
 */
const getOperatorAnalytics = async (req, res) => {
  try {
    // Get overall statistics
    const statsQuery = `
      SELECT
        COUNT(DISTINCT user_id) as total_users,
        SUM(total_activities) as total_activities,
        AVG(total_logins) as avg_logins_per_user,
        MAX(last_activity_at) as last_system_activity
      FROM user_analytics_summary
    `;

    const statsResult = await pool.query(statsQuery);

    // Get active users trend (last 30 days)
    const activeUsersTrendQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as active_users
      FROM activity_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const activeUsersTrendResult = await pool.query(activeUsersTrendQuery);

    // Get top active users
    const topUsersQuery = `
      SELECT
        user_id, name, email, role,
        total_activities, total_logins,
        last_activity_at
      FROM user_analytics_summary
      ORDER BY total_activities DESC
      LIMIT 10
    `;

    const topUsersResult = await pool.query(topUsersQuery);

    // Get activity by role
    const activityByRoleQuery = `
      SELECT
        role,
        COUNT(*) as user_count,
        SUM(total_activities) as total_activities
      FROM user_analytics_summary
      GROUP BY role
      ORDER BY total_activities DESC
    `;

    const activityByRoleResult = await pool.query(activityByRoleQuery);

    res.json({
      success: true,
      analytics: {
        stats: statsResult.rows[0],
        activeUsersTrend: activeUsersTrendResult.rows,
        topUsers: topUsersResult.rows,
        activityByRole: activityByRoleResult.rows
      }
    });
  } catch (error) {
    console.error('Get operator analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve operator analytics'
    });
  }
};

/**
 * Get system analytics (admin only)
 * @route GET /api/analytics/system
 * @access Private (Administrator)
 */
const getSystemAnalytics = async (req, res) => {
  try {
    // Get comprehensive system statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'administrator') as admin_count,
        (SELECT COUNT(*) FROM users WHERE role = 'operator') as operator_count,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as user_count,
        (SELECT COUNT(*) FROM activity_logs) as total_activities,
        (SELECT COUNT(*) FROM analytics_events) as total_events,
        (SELECT COUNT(*) FROM user_settings) as users_with_settings,
        (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > NOW() - INTERVAL '24 hours') as active_24h,
        (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > NOW() - INTERVAL '7 days') as active_7d,
        (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > NOW() - INTERVAL '30 days') as active_30d
    `;

    const statsResult = await pool.query(statsQuery);

    // Get daily active users (last 30 days)
    const dauQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as dau
      FROM activity_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const dauResult = await pool.query(dauQuery);

    // Get top actions system-wide
    const topActionsQuery = `
      SELECT
        action,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM activity_logs
      GROUP BY action
      ORDER BY count DESC
      LIMIT 15
    `;

    const topActionsResult = await pool.query(topActionsQuery);

    // Get all user summaries
    const userSummariesQuery = `
      SELECT *
      FROM user_analytics_summary
      ORDER BY total_activities DESC
    `;

    const userSummariesResult = await pool.query(userSummariesQuery);

    // Get hourly activity distribution (last 7 days)
    const hourlyActivityQuery = `
      SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM activity_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `;

    const hourlyActivityResult = await pool.query(hourlyActivityQuery);

    // Get growth metrics
    const growthQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const growthResult = await pool.query(growthQuery);

    res.json({
      success: true,
      analytics: {
        stats: statsResult.rows[0],
        dailyActiveUsers: dauResult.rows,
        topActions: topActionsResult.rows,
        userSummaries: userSummariesResult.rows,
        hourlyActivity: hourlyActivityResult.rows,
        userGrowth: growthResult.rows
      }
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system analytics'
    });
  }
};

/**
 * Refresh analytics materialized view
 * @route POST /api/analytics/refresh
 * @access Private (Administrator)
 */
const refreshAnalytics = async (req, res) => {
  try {
    await pool.query('SELECT refresh_analytics_summary()');

    res.json({
      success: true,
      message: 'Analytics refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh analytics'
    });
  }
};

module.exports = {
  getMyAnalytics,
  getOperatorAnalytics,
  getSystemAnalytics,
  refreshAnalytics
};
