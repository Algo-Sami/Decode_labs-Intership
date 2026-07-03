# FeedbackFlow

> **Every Great Product Begins with Listening.**

FeedbackFlow is a production-quality, high-fidelity customer feedback management platform built to look and feel like a modern SaaS application. Designed with the minimalist aesthetics of Stripe, Vercel, and Linear, it pairs a fast, validation-backed Node/Express API with a responsive, glassmorphic Single Page Application.

This repository demonstrates advanced API design, telemetry tracking, sandboxed testing tools, and fluid front-end transitions—free from modern JavaScript framework overhead.

---

## Key Features

- **Minimalist Vercel-Like Interface**: A dark-mode dashboard featuring fluid enter animations, counting stats cards, custom category progress trackers, and glowing element outlines.
- **Single Page Application (SPA)**: Custom client-side navigation hash routing (`#home`, `#dashboard`, `#submit`, `#console`) resulting in instant page switches with transition sweeps.
- **In-Memory Analytics Dashboard**: Real-time KPI summaries computed instantly:
  - Total Submissions
  - Submissions Today
  - Positive Feedback (Rating >= 4)
  - Pending Reviews
  - Category Share Progress Bars
- **Interactive star rating selector**: Tactile star selector supporting mouse hover previews and bounce animations.
- **Developer Mode Telemetry Drawer**: Click the floating developer button in the bottom right corner to slide out a telemetry panel displaying:
  - Server metrics (Uptime, heap memory allocation, mock CPU load)
  - Real-time inbound request tracking (Method, path, duration in milliseconds, response sizes, status codes)
  - A copyable JSON viewer of the last submitted payload
  - REST API endpoint reference cards
- **Embedded Developer Console**: Sandbox console mimicking a mini-Postman, allowing teachers and developers to execute live REST requests (GET/POST) and inspect headers, roundtrip durations, status codes, and syntax-highlighted response payloads.
- **Complete Validation & Sanitization**: Robust client-side validation coupled with Express.js schema checking. Missing or malformed requests output distinct input glowing error states.
- **Canvas Particle Hero**: An interactive canvas-based background for the landing page with connected node lines that shift based on cursor proximity.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla design variables), JavaScript (Vanilla ES6 modules).
- **Backend**: Node.js, Express.js.
- **Middleware**: CORS, Express JSON parsing.
- **Storage**: In-memory JavaScript collection (preloaded with 5 mock reviews).

---

## Folder Structure

```
FeedbackFlow/
├── package.json                   # Project scripts and dependencies
├── server.js                      # Main application bootstrapper
├── test.js                        # Automated API testing suite
├── controllers/
│   ├── feedbackController.js      # CRUD actions and seed-data initialization
│   └── statsController.js         # Telemetry compilation and aggregation
├── middleware/
│   ├── logger.js                  # Global logging telemetry tracker
│   └── validator.js               # Body validation constraints
├── routes/
│   ├── feedback.js                # API mappings for /api/feedback
│   └── stats.js                   # API mappings for /api/stats
└── public/
    ├── index.html                 # Single page application structure
    ├── css/
    │   └── styles.css             # Unified dark mode stylesheet & layout tokens
    └── js/
        ├── app.js                 # Central front-end routing and telemetry script
        └── canvas-particles.js    # Hero interactive particles animation
```

---

## API Endpoints

### 1. Retrieve Feedback
- **Route**: `GET /api/feedback`
- **Description**: Returns all feedback stored in-memory, sorted chronologically by default.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Feedback retrieved successfully.",
  "count": 5,
  "feedback": [
    {
      "id": "fb-1",
      "name": "Sarah Jenkins",
      "email": "sarah.jenkins@acme.co",
      "company": "Acme Corp",
      "category": "Feature Request",
      "rating": 5,
      "message": "We would love to see an integrations panel...",
      "createdAt": "2026-07-01T05:12:45.000Z",
      "status": "Pending Review"
    }
  ]
}
```

### 2. Submit New Feedback
- **Route**: `POST /api/feedback`
- **Description**: Evaluates and stores feedback.
- **Payload Schema**:
  - `name` (String, required)
  - `email` (String, valid format, required)
  - `category` (String, required: `Bug Report`, `Feature Request`, `Suggestion`, `General Feedback`, or `Complaint`)
  - `rating` (Integer 1-5, required)
  - `message` (String, min 5 chars, required)
  - `company` (String, optional)
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Feedback submitted successfully.",
  "feedback": {
    "id": "fb-xyz123",
    "name": "Alex Carter",
    ...
  }
}
```
- **Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Validation failed. Please correct the errors and try again.",
  "errors": {
    "email": "Please provide a valid email address.",
    "rating": "Rating must be an integer between 1 and 5."
  }
}
```

### 3. Server Telemetry & Statistics
- **Route**: `GET /api/stats`
- **Description**: Exposes accumulated request logs, uptime durations, heap sizes, and average customer ratings.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "stats": {
    "feedbackSummary": {
      "total": 6,
      "averageRating": 4.1,
      "categories": { "Bug Report": 1, "Feature Request": 2, ... }
    },
    "serverTelemetry": {
      "uptimeSeconds": 142,
      "totalRequests": 12,
      "cpuLoad": 2.4,
      "memoryUsage": 32.8,
      "lastRequest": {
        "method": "POST",
        "path": "/api/feedback",
        "statusCode": 201,
        "durationMs": 4.2
      }
    }
  }
}
```

---

## Installation & Running

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher recommended).

### 1. Clone the project
Download or clone this workspace folder to your local machine.

### 2. Install dependencies
From the project root folder, install the required packages:
```bash
npm install
```

### 3. Start the application
Run the development server (which will automatically reload using nodemon if you change any files):
```bash
npm run dev
```
Alternatively, for standard production execution:
```bash
npm start
```

Once running, navigate to **`http://localhost:3000`** in your browser.

---

## Automated Verification Suite
To run the automated tests against all API endpoints (boots a mock server, invokes endpoints with assertions, and shuts down):
```bash
node test.js
```

---

## Future Improvements
- **Persistent Storage**: Swapping the in-memory array for SQLite or MongoDB.
- **Authentication**: Implementing JWT tokens for dashboard administration.
- **Webhook Integration**: Broadcasting real-time feedback submissions to Slack or Discord.
- **Exporting Options**: Adding CSV/JSON export tools for feedback logs.
