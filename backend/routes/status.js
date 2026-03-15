// routes/status.js
const express = require("express");
const router = express.Router();
const { updateStatus } = require("../controllers/statusController");
const protect = require("../middleware/auth");

router.use(protect);

// PUT /api/status/update - Update task status (any logged-in user)
router.put("/update", updateStatus);

module.exports = router;
