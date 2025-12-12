/**
 * Activity Logger Middleware
 * Logs user activities to the database asynchronously
 */

const pool = require('../config/database');

/**
 * Log activity to database (async, non-blocking)
 * @param {number} userId - User ID
 * @param {string} action - Action performed
 * @param {object} options - Additional options
 */
const logActivityToDatabase = async (userId, action, options = {}) => {
  try {
    const {
      resourceType = null,
      resourceId = null,
      details = {},
      ipAddress = null,
      userAgent = null
    } = options;

    const query = `
      INSERT INTO activity_logs (
        user_id, action, resource_type, resource_id,
        details, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      userId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(details),
      ipAddress,
      userAgent
    ];

    await pool.query(query, values);
  } catch (error) {
    // Log error but don't throw - we don't want to break the request
    console.error('Activity logging error:', error.message);
  }
};

/**
 * Middleware to log user activities
 * @param {string} action - Action to log
 * @param {object} options - Options for logging
 * @returns {Function} Express middleware
 */
const logActivity = (action, options = {}) => {
  return (req, res, next) => {
    // Store original res.json to intercept it
    const originalJson = res.json.bind(res);

    // Override res.json to log activity after successful response
    res.json = function (data) {
      // Only log if response is successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Get user info from request
        const userId = req.user?.userId;

        if (userId) {
          // Extract details from options or request
          const {
            resourceType = options.resourceType,
            resourceId = options.resourceId || req.params?.id,
            getDetails = options.getDetails,
            includeBody = options.includeBody
          } = options;

          // Build details object
          let details = {};

          if (getDetails && typeof getDetails === 'function') {
            details = getDetails(req, res, data);
          } else if (includeBody && req.body) {
            // Include sanitized body (remove sensitive fields)
            const sanitizedBody = { ...req.body };
            delete sanitizedBody.password;
            delete sanitizedBody.token;
            details = { body: sanitizedBody };
          }

          // Add response data if specified
          if (options.includeResponse && data) {
            const sanitizedData = { ...data };
            delete sanitizedData.token;
            details.response = sanitizedData;
          }

          // Get IP address
          const ipAddress = req.ip ||
                          req.headers['x-forwarded-for'] ||
                          req.connection?.remoteAddress;

          // Get user agent
          const userAgent = req.headers['user-agent'];

          // Log activity asynchronously (don't wait for it)
          logActivityToDatabase(userId, action, {
            resourceType,
            resourceId,
            details,
            ipAddress,
            userAgent
          }).catch(err => {
            console.error('Activity logging failed:', err.message);
          });
        }
      }

      // Call original res.json
      return originalJson(data);
    };

    next();
  };
};

/**
 * Shorthand middleware for common actions
 */
const logLogin = logActivity('login', {
  getDetails: (req) => ({
    email: req.body?.email,
    method: 'jwt'
  })
});

const logLogout = logActivity('logout');

const logRegister = logActivity('register', {
  getDetails: (req) => ({
    email: req.body?.email,
    name: req.body?.name
  })
});

const logSettingsUpdate = logActivity('settings_update', {
  resourceType: 'user_settings',
  includeBody: true
});

const logProfileUpdate = logActivity('profile_update', {
  resourceType: 'user',
  includeBody: true
});

const logPasswordChange = logActivity('password_change', {
  resourceType: 'user'
});

/**
 * Utility function to manually log an activity (for use in controllers)
 * @param {object} req - Express request object
 * @param {string} action - Action to log
 * @param {object} options - Additional options
 */
const manualLog = async (req, action, options = {}) => {
  if (!req.user?.userId) {
    return;
  }

  const ipAddress = req.ip ||
                   req.headers['x-forwarded-for'] ||
                   req.connection?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  await logActivityToDatabase(req.user.userId, action, {
    ...options,
    ipAddress,
    userAgent
  });
};

module.exports = {
  logActivity,
  logActivityToDatabase,
  logLogin,
  logLogout,
  logRegister,
  logSettingsUpdate,
  logProfileUpdate,
  logPasswordChange,
  manualLog
};
