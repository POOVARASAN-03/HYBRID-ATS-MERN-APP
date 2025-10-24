const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}` 
      });
    }

    next();
  };
};

// Bot token middleware for internal/cron calls
const botTokenMiddleware = (req, res, next) => {
  const botToken = req.header('X-Bot-Token');
  
  if (!botToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Bot token required for this operation.' 
    });
  }

  if (botToken !== process.env.INTERNAL_BOT_TOKEN) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid bot token.' 
    });
  }

  next();
};

export { roleMiddleware, botTokenMiddleware };
