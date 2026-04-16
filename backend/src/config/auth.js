if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '1h',
  bcryptRounds: 10,
};
