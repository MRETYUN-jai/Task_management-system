// routes/tasks.js
const express = require("express");
const router = express.Router();
const {
  createTask, getAllTasks, getTaskById, updateTask, deleteTask,
} = require("../controllers/taskController");
const protect = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");

// All routes require authentication
router.use(protect);

// POST /api/tasks - Create a task (admin only)
router.post("/", adminOnly, createTask);

// GET /api/tasks - Get all tasks (with optional filters)
router.get("/", getAllTasks);

// GET /api/tasks/:id - Get single task details
router.get("/:id", getTaskById);

// PUT /api/tasks/:id - Update task details (admin only)
router.put("/:id", adminOnly, updateTask);

// DELETE /api/tasks/:id - Delete a task (admin only)
router.delete("/:id", adminOnly, deleteTask);

module.exports = router;
