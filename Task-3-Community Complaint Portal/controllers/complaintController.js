const Complaint = require('../models/Complaint');

/**
 * Create a new complaint
 * POST /api/complaints
 */
const createComplaint = async (req, res, next) => {
  try {
    const complaintData = req.body;
    const newComplaint = await Complaint.create(complaintData);
    
    // Retrieve fresh stats to return along with the confirmation
    const stats = await Complaint.getStats();

    res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully',
      data: newComplaint,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all complaints (with filtering, search, sorting)
 * GET /api/complaints
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { search, status, sort } = req.query;

    const complaints = await Complaint.findAll({ search, status, sort });
    const stats = await Complaint.getStats();

    res.status(200).json({
      success: true,
      count: complaints.length,
      stats,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get complaint by ID
 * GET /api/complaints/:id
 */
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint by ID
 * PUT /api/complaints/:id
 */
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if complaint exists first
    const existing = await Complaint.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Complaint with ID ${id} not found`
      });
    }

    const updatedComplaint = await Complaint.update(id, req.body);
    const stats = await Complaint.getStats();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete complaint by ID
 * DELETE /api/complaints/:id
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if complaint exists first
    const existing = await Complaint.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Complaint with ID ${id} not found`
      });
    }

    await Complaint.delete(id);
    const stats = await Complaint.getStats();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
};
