const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token containing user identity and role
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'homeserve_super_secret_jwt_key_2026_change_in_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

module.exports = {
  generateToken
};
