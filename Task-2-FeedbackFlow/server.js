const express = require('express');
const cors = require('cors');
const path = require('path');
const { logger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for development flexibility
app.use(cors());

// Parse incoming request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply logging telemetry middleware
app.use(logger);

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Define API routes
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/stats', require('./routes/stats'));

// Catch-all for API endpoints that don't exist
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// For any non-API routes, fall back to index.html to support single page application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandle Server Error:", err);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Boot server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` FeedbackFlow Server booting up...`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Press Ctrl+C to shut down the server.`);
  console.log(`==================================================`);
});
