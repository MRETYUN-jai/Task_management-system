// controllers/notificationController.js
// ---------------------------------------------------------------------------
// Notification Controller
// Retrieves notifications for a user and allows marking them as read.
// ---------------------------------------------------------------------------

const db = require("../config/db");

// ── GET /api/notifications/:userId ───────────────────────────────────────
// Returns all notifications for a given user, newest first.
const getNotifications = async (req, res) => {
  const { userId } = req.params;

  // Users can only see their own notifications (or admin sees any)
  if (req.user.user_id != userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const [notifications] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── PUT /api/notifications/:id/read ──────────────────────────────────────
// Marks a specific notification as read.
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?",
      [id]
    );
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── PUT /api/notifications/read-all/:userId ───────────────────────────────
// Marks all notifications for a user as read.
const markAllAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
      [userId]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
