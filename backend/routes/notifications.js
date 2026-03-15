// routes/notifications.js
const express = require("express");
const router = express.Router();
const {
  getNotifications, markAsRead, markAllAsRead,
} = require("../controllers/notificationController");
const protect = require("../middleware/auth");

router.use(protect);

// GET /api/notifications/:userId - Get all notifications for a user
router.get("/:userId", getNotifications);

// PUT /api/notifications/:id/read - Mark one notification as read
router.put("/:id/read", markAsRead);

// PUT /api/notifications/read-all/:userId - Mark all as read
router.put("/read-all/:userId", markAllAsRead);

module.exports = router;
