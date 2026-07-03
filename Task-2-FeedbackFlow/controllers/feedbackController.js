let feedbackList = [
  {
    id: "fb-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@acme.co",
    company: "Acme Corp",
    category: "Feature Request",
    rating: 5,
    message: "We would love to see an integrations panel with Slack and Microsoft Teams. This would streamline our daily alerts and keep the design team synced!",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    status: "Pending Review"
  },
  {
    id: "fb-2",
    name: "David Miller",
    email: "d.miller@techflow.io",
    company: "TechFlow",
    category: "Bug Report",
    rating: 2,
    message: "The settings page crashes when I attempt to toggle the team access permission switch. Console shows 'TypeError: cannot read properties of undefined'. Please fix this as it blocks our onboarding.",
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(), // 10 hours ago
    status: "Investigating"
  },
  {
    id: "fb-3",
    name: "Elena Rostova",
    email: "elena@designsystem.net",
    company: "DesignSystem",
    category: "Suggestion",
    rating: 4,
    message: "The typography on the dashboard view could use slightly higher contrast. It is currently a bit faint on standard dark displays, but overall the UX is excellent!",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    status: "Reviewed"
  },
  {
    id: "fb-4",
    name: "Marcus Chen",
    email: "marcus@cloudops.dev",
    company: "CloudOps",
    category: "General Feedback",
    rating: 5,
    message: "Stellar performance! The new API endpoints are consistently responding in under 50ms, and the Developer Console documentation is exceptionally clean and detailed.",
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(), // 1.5 days ago
    status: "Reviewed"
  },
  {
    id: "fb-5",
    name: "Chloe DuPont",
    email: "chloe.dupont@retailhub.fr",
    company: "RetailHub",
    category: "Complaint",
    rating: 3,
    message: "We received multiple duplicate alert emails yesterday during your database failover. Please implement email throttling to avoid spamming team mailboxes.",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
    status: "Pending Review"
  }
];

// Helper to generate a simple UUID-like id
function generateId() {
  return 'fb-' + Math.random().toString(36).substr(2, 9);
}

// GET /api/feedback
function getAllFeedback(req, res) {
  try {
    // Sort feedback by creation date descending
    const sortedList = [...feedbackList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully.",
      count: sortedList.length,
      feedback: sortedList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error while retrieving feedback.",
      error: error.message
    });
  }
}

// POST /api/feedback
function createFeedback(req, res) {
  try {
    const { name, email, company, category, rating, message } = req.sanitizedFeedback;

    const newFeedback = {
      id: generateId(),
      name,
      email,
      company,
      category,
      rating,
      message,
      createdAt: new Date().toISOString(),
      status: "Pending Review"
    };

    feedbackList.push(newFeedback);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback: newFeedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error while submitting feedback.",
      error: error.message
    });
  }
}

module.exports = {
  getAllFeedback,
  createFeedback,
  feedbackList // Export raw list for stats computations
};
