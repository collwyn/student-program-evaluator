const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and check if still valid
    const user = await User.findOne({ 
      _id: decoded.userId,
      status: 'active'
    }).select('+permissions');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found or inactive' 
      });
    }

    // Check if token is older than password change
    if (user.passwordResetExpires && decoded.iat < user.passwordResetExpires.getTime() / 1000) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired due to password change' 
      });
    }

    // Add user and permission checking to request
    req.user = user;
    req.organizationId = user.organizationId;

    // Permission checking middleware
    req.hasPermission = (resource, action) => {
      if (!user.permissions || !user.permissions[resource]) {
        return false;
      }
      return user.permissions[resource][action] === true;
    };

    // Role-based permission checking
    req.requirePermission = (resource, action) => {
      if (!req.hasPermission(resource, action)) {
        throw new Error('Permission denied');
      }
    };

    // Add organization filtering helper
    req.addOrganizationFilter = (query = {}) => {
      return {
        ...query,
        organizationId: user.organizationId
      };
    };

    // MFA validation if enabled
    if (user.mfaEnabled && !decoded.mfaVerified) {
      return res.status(401).json({ 
        success: false, 
        error: 'MFA verification required',
        requiresMfa: true
      });
    }

    // Rate limiting check
    const apiKey = `api:${user.organizationId}:${user._id}`;
    const rateLimit = await getRateLimit(apiKey);
    
    if (rateLimit.remaining <= 0) {
      return res.status(429).json({ 
        success: false, 
        error: 'Rate limit exceeded',
        resetTime: rateLimit.resetTime
      });
    }

    // Decrement rate limit
    await decrementRateLimit(apiKey);

    // Add subscription plan checking
    req.checkSubscriptionFeature = async (feature) => {
      const organization = await Organization.findById(user.organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const planFeatures = {
        free: ['basic_analytics', 'student_management'],
        basic: ['basic_analytics', 'student_management', 'program_management', 'basic_reports'],
        professional: ['basic_analytics', 'student_management', 'program_management', 'basic_reports', 
                      'advanced_analytics', 'custom_reports', 'api_access'],
        enterprise: ['basic_analytics', 'student_management', 'program_management', 'basic_reports', 
                    'advanced_analytics', 'custom_reports', 'api_access', 'white_label']
      };

      const plan = organization.subscription.plan;
      if (!planFeatures[plan] || !planFeatures[plan].includes(feature)) {
        throw new Error(`Feature '${feature}' not available in current subscription plan`);
      }
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Rate limiting helpers
async function getRateLimit(key) {
  // Implementation would use Redis or similar for production
  // This is a simplified version
  return {
    remaining: 100,
    resetTime: Date.now() + 3600000
  };
}

async function decrementRateLimit(key) {
  // Implementation would use Redis or similar for production
  // This is a placeholder
  return true;
}

module.exports = auth;
