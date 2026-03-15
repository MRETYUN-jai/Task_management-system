// routes/users.js
const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser } = require("../controllers/userController");
const protect = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");

// All routes require authentication
router.use(protect);

// GET /api/users - Get all users (admin only)
router.get("/", adminOnly, getAllUsers);

// GET /api/users/:id - Get a single user
router.get("/:id", getUserById);

// PUT /api/users/:id - Update a user profile
router.put("/:id", updateUser);

module.exports = router;
