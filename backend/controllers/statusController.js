// controllers/statusController.js
// ---------------------------------------------------------------------------
// Status Controller
// Allows users to update the status of their assigned tasks.
// Uses INSERT ... ON DUPLICATE KEY UPDATE (upsert) for TASK_STATUS table.
// ---------------------------------------------------------------------------

const db = require("../config/db");

// ── PUT /api/status/update ────────────────────────────────────────────────
// Updates (or inserts) the status of a task for a user.
const updateStatus = async (req, res) => {
  const { task_id, status } = req.body;
  const user_id = req.user.user_id; // From JWT

  const validStatuses = ["Pending", "In Progress", "Completed"];
  if (!task_id || !status) {
    return res.status(400).json({ message: "task_id and status are required." });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Status must be Pending, In Progress, or Completed." });
  }

  try {
    // Upsert: insert if not exists, update if exists
    await db.query(
      `INSERT INTO task_status (task_id, user_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [task_id, user_id, status]
    );

    // Fetch task title for notification message
    const [task] = await db.query("SELECT title FROM tasks WHERE task_id = ?", [task_id]);

    if (task.length > 0) {
      // Notify the task creator
      const [taskRow] = await db.query("SELECT created_by FROM tasks WHERE task_id = ?", [task_id]);
      if (taskRow.length > 0 && taskRow[0].created_by !== user_id) {
        await db.query(
          `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
          [
            taskRow[0].created_by,
            `Task "${task[0].title}" status updated to "${status}" by user #${user_id}.`,
          ]
        );
      }
    }

    res.json({ message: `Status updated to "${status}" successfully!` });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { updateStatus };
