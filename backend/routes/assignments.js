// routes/assignments.js
const express = require("express");
const router = express.Router();
const { assignTask, getAssignedTasks } = require("../controllers/assignmentController");
const protect = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");

router.use(protect);

// POST /api/assign - Assign task to user (admin only)
router.post("/assign", adminOnly, assignTask);

// GET /api/assigned/:userId - Get all tasks assigned to a user
router.get("/assigned/:userId", getAssignedTasks);

module.exports = router;
