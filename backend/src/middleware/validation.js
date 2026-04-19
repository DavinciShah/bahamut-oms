const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isInt({ gt: 0 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateOrder,
  handleValidationErrors
};
