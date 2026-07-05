const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating complaints
const validateComplaint = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isNumeric()
    .withMessage('Phone number must contain only numbers')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Garbage Collection',
      'Road Damage',
      'Water Leakage',
      'Street Light',
      'Drainage',
      'Electricity',
      'Tree Fallen',
      'Other'
    ])
    .withMessage('Please select a valid category from the list'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),

  body('priority')
    .optional()
    .trim()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),

  body('status')
    .optional()
    .trim()
    .isIn(['Pending', 'In Progress', 'Resolved'])
    .withMessage('Status must be one of: Pending, In Progress, Resolved'),

  // Validation response handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = {
  validateComplaint
};
