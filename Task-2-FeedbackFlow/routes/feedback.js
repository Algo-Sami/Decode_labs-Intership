const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { validateFeedback } = require('../middleware/validator');

router.get('/', feedbackController.getAllFeedback);
router.post('/', validateFeedback, feedbackController.createFeedback);

module.exports = router;
