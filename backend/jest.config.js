module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/authController.js',
    'src/controllers/ordersController.js',
    'src/controllers/productsController.js',
    'src/controllers/usersController.js',
    'src/controllers/adminController.js',
    'src/services/authService.js',
    'src/services/ordersService.js',
    'src/services/productsService.js',
    'src/services/usersService.js',
    'src/services/adminService.js',
    'src/middleware/auth.js',
    'src/middleware/roleCheck.js',
    'src/middleware/validation.js',
    'src/middleware/errorHandler.js',
    'src/routes/authRoutes.js',
    'src/routes/ordersRoutes.js',
    'src/routes/productsRoutes.js',
    'src/routes/usersRoutes.js',
    'src/routes/adminRoutes.js',
  ],
  coverageThreshold: {
    global: { lines: 70 }
  }
};
