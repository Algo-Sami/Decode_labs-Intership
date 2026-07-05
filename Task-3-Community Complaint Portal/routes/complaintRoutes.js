const express = require('express');
const router = express.Router();
const { validateComplaint } = require('../middleware/validator');
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');

// Routes mapping for /api/complaints
router.route('/')
  .post(validateComplaint, createComplaint)
  .get(getAllComplaints);

// Routes mapping for /api/complaints/:id
router.route('/:id')
  .get(getComplaintById)
  .put(validateComplaint, updateComplaint)
  .delete(deleteComplaint);

module.exports = router;
