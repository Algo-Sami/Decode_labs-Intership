const { stats: loggerStats } = require('../middleware/logger');
const { feedbackList } = require('./feedbackController');

function getStats(req, res) {
  try {
    const totalFeedback = feedbackList.length;

    const sumRatings = feedbackList.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalFeedback > 0 ? parseFloat((sumRatings / totalFeedback).toFixed(1)) : 0.0;

    const today = new Date().toDateString();
    const feedbackToday = feedbackList.filter(item => new Date(item.createdAt).toDateString() === today).length;

    const positiveFeedback = feedbackList.filter(item => item.rating >= 4).length;
    const pendingReviews = feedbackList.filter(item => item.status === 'Pending Review').length;

    const categoryCounts = {
      'Bug Report': 0,
      'Feature Request': 0,
      'General Feedback': 0,
      'Complaint': 0,
      'Suggestion': 0
    };
    feedbackList.forEach(item => {
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category]++;
      }
    });

    let mostPopularCategory = "N/A";
    let maxCount = -1;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostPopularCategory = cat;
      }
    }
    if (totalFeedback === 0) mostPopularCategory = "None";

    const uptimeSeconds = Math.floor((new Date() - loggerStats.bootTime) / 1000);

    res.status(200).json({
      success: true,
      stats: {
        feedbackSummary: {
          total: totalFeedback,
          today: feedbackToday,
          positive: positiveFeedback,
          pending: pendingReviews,
          averageRating: averageRating,
          mostPopularCategory: mostPopularCategory,
          categories: categoryCounts
        },
        serverTelemetry: {
          uptimeSeconds,
          totalRequests: loggerStats.totalRequests,
          methods: loggerStats.methods,
          lastRequest: loggerStats.lastRequest,
          status: "Active",
          cpuLoad: parseFloat((Math.random() * 4 + 1.2).toFixed(1)), // mock CPU load
          memoryUsage: parseFloat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)) // heap usage in MB
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compile server statistics.",
      error: error.message
    });
  }
}

module.exports = {
  getStats
};
