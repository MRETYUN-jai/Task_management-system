// routes/reports.js
const express = require("express");
const router = express.Router();
const {
  completedReport, pendingReport, userPerformanceReport, dashboardStats,
} = require("../controllers/reportController");
const protect = require("../middleware/auth");

router.use(protect);

// GET /api/reports/dashboard - Quick dashboard stats
router.get("/dashboard", dashboardStats);

// GET /api/reports/completed - All completed tasks
router.get("/completed", completedReport);

// GET /api/reports/pending - All pending/in-progress tasks
router.get("/pending", pendingReport);

// GET /api/reports/user-performance - Productivity per user
router.get("/user-performance", userPerformanceReport);

module.exports = router;
