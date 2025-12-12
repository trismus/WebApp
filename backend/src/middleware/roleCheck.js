/**
 * Role Check Middleware
 * Provides hierarchical role-based access control
 * Hierarchy: administrator > operator > user
 */

// Role hierarchy levels (higher number = more privileges)
const ROLE_HIERARCHY = {
  user: 1,
  operator: 2,
  administrator: 3
};

/**
 * Check if user has required role or higher
 * @param {string|string[]} requiredRole - Required role(s)
 * @returns {Function} Express middleware
 */
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const userLevel = ROLE_HIERARCHY[userRole] || 0;

      // Handle array of required roles
      if (Array.isArray(requiredRole)) {
        const hasRequiredRole = requiredRole.some(role => {
          const requiredLevel = ROLE_HIERARCHY[role] || 0;
          return userLevel >= requiredLevel;
        });

        if (!hasRequiredRole) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
            required: requiredRole,
            current: userRole
          });
        }
      } else {
        // Handle single required role
        const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

        if (userLevel < requiredLevel) {
          return res.status(403).json({
            success: false,
            message: 'Insufficient permissions',
            required: requiredRole,
            current: userRole
          });
        }
      }

      // User has required role or higher
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

/**
 * Require administrator role
 */
const requireAdmin = checkRole('administrator');

/**
 * Require operator role or higher (operator or administrator)
 */
const requireOperator = checkRole('operator');

/**
 * Require authenticated user (any role)
 */
const requireUser = checkRole('user');

/**
 * Check if user has specific role (exact match, not hierarchical)
 * @param {string} exactRole - Exact role required
 */
const requireExactRole = (exactRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== exactRole) {
      return res.status(403).json({
        success: false,
        message: 'Specific role required',
        required: exactRole,
        current: req.user?.role || 'none'
      });
    }
    next();
  };
};

/**
 * Utility function to check if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
const isValidRole = (role) => {
  return role in ROLE_HIERARCHY;
};

/**
 * Utility function to get role level
 * @param {string} role - Role name
 * @returns {number} Role level (0 if invalid)
 */
const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Check if role1 has higher or equal privileges than role2
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean}
 */
const hasHigherOrEqualRole = (role1, role2) => {
  return getRoleLevel(role1) >= getRoleLevel(role2);
};

module.exports = {
  checkRole,
  requireAdmin,
  requireOperator,
  requireUser,
  requireExactRole,
  isValidRole,
  getRoleLevel,
  hasHigherOrEqualRole,
  ROLE_HIERARCHY
};
