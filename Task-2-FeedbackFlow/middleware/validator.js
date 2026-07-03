function validateFeedback(req, res, next) {
  const { name, email, category, rating, message } = req.body;
  const errors = {};

  // 1. Name validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.name = 'Full name is required.';
  }

  // 2. Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  // 3. Category validation
  const validCategories = [
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Complaint',
    'Suggestion'
  ];
  if (!category || !validCategories.includes(category)) {
    errors.category = `Category must be one of: ${validCategories.join(', ')}.`;
  }

  // 4. Rating validation
  const parsedRating = parseInt(rating, 10);
  if (rating === undefined || rating === null || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    errors.rating = 'Rating must be an integer between 1 and 5.';
  }

  // 5. Message validation
  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    errors.message = 'Feedback message must be at least 5 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the errors and try again.',
      errors
    });
  }

  // Attach sanitized and parsed properties to request object
  req.sanitizedFeedback = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: req.body.company ? req.body.company.trim() : '',
    category,
    rating: parsedRating,
    message: message.trim()
  };

  next();
}

module.exports = {
  validateFeedback
};
