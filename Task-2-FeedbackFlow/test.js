const { exec } = require('child_process');
const assert = require('assert').strict;

console.log("Starting API tests against FeedbackFlow...");

// Boot server as child process
const serverProcess = exec('node server.js');

// Give server 1.5 seconds to start listening on port 3000
setTimeout(async () => {
  try {
    console.log("Connecting to API endpoints...");

    // 1. GET /api/feedback
    console.log("Testing GET /api/feedback...");
    const resGet = await fetch('http://127.0.0.1:3000/api/feedback');
    assert.equal(resGet.status, 200, "GET feedback status should be 200");
    const jsonGet = await resGet.json();
    assert.equal(jsonGet.success, true, "GET success should be true");
    assert.ok(Array.isArray(jsonGet.feedback), "GET feedback should return an array");
    assert.ok(jsonGet.feedback.length >= 5, "Seed data should have at least 5 feedback items");
    console.log("✓ GET /api/feedback check passed.");

    // 2. POST /api/feedback (Valid body)
    console.log("Testing POST /api/feedback with valid body...");
    const validFeedback = {
      name: "Test Runner",
      email: "test.runner@automated.com",
      company: "Automation Inc",
      category: "Feature Request",
      rating: 5,
      message: "This is a custom feedback submitted by the test runner script."
    };
    const resPostValid = await fetch('http://127.0.0.1:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validFeedback)
    });
    assert.equal(resPostValid.status, 201, "POST status code should be 201");
    const jsonPostValid = await resPostValid.json();
    assert.equal(jsonPostValid.success, true, "POST success flag should be true");
    assert.ok(jsonPostValid.feedback.id, "Returned feedback should contain a generated ID");
    assert.equal(jsonPostValid.feedback.name, "Test Runner", "Returned name matches input");
    console.log("✓ POST /api/feedback (Valid body) check passed.");

    // 3. POST /api/feedback (Invalid body)
    console.log("Testing POST /api/feedback with invalid/missing body...");
    const invalidFeedback = {
      name: "",
      email: "not-an-email",
      category: "Unknown",
      rating: 10,
      message: "Bad"
    };
    const resPostInvalid = await fetch('http://127.0.0.1:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidFeedback)
    });
    assert.equal(resPostInvalid.status, 400, "POST invalid feedback should return 400 Bad Request");
    const jsonPostInvalid = await resPostInvalid.json();
    assert.equal(jsonPostInvalid.success, false, "POST success flag should be false");
    assert.ok(jsonPostInvalid.errors.name, "Name validation error should be present");
    assert.ok(jsonPostInvalid.errors.email, "Email validation error should be present");
    assert.ok(jsonPostInvalid.errors.category, "Category validation error should be present");
    assert.ok(jsonPostInvalid.errors.rating, "Rating validation error should be present");
    assert.ok(jsonPostInvalid.errors.message, "Message validation error should be present");
    console.log("✓ POST /api/feedback (Invalid body) check passed.");

    // 4. GET /api/stats
    console.log("Testing GET /api/stats...");
    const resStats = await fetch('http://127.0.0.1:3000/api/stats');
    assert.equal(resStats.status, 200, "GET stats status should be 200");
    const jsonStats = await resStats.json();
    assert.equal(jsonStats.success, true, "GET stats success should be true");
    assert.ok(jsonStats.stats.feedbackSummary, "stats summary must be present");
    assert.ok(jsonStats.stats.serverTelemetry, "server telemetry must be present");
    assert.equal(jsonStats.stats.feedbackSummary.total, 6, "Total feedback count should now be 6 (5 seeds + 1 automated test)");
    console.log("✓ GET /api/stats check passed.");

    console.log("\n=================================");
    console.log(" ALL API TESTS COMPLETED SUCCESSFULLY! ");
    console.log("=================================");

  } catch (error) {
    console.error("❌ Test verification failed:", error);
    process.exitCode = 1;
  } finally {
    console.log("Shutting down test server...");
    serverProcess.kill();
    process.exit();
  }
}, 1500);
