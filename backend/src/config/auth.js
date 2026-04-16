module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: '1h',
  bcryptRounds: 10,
};
