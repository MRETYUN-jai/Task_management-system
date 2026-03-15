// controllers/assignmentController.js
// ---------------------------------------------------------------------------
// Assignment Controller
// Handles assigning tasks to users and viewing assigned tasks.
// Demonstrates Many-to-Many relationship via ASSIGNMENTS table.
// ---------------------------------------------------------------------------

const db = require("../config/db");

// ── POST /api/assign ──────────────────────────────────────────────────────
// Assigns a task to a user. Admin only.
const assignTask = async (req, res) => {
  const { task_id, user_id } = req.body;

  if (!task_id || !user_id) {
    return res.status(400).json({ message: "task_id and user_id are required." });
  }

  try {
    // Check task exists
    const [task] = await db.query("SELECT * FROM tasks WHERE task_id = ?", [task_id]);
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Check user exists
    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if already assigned (prevent duplicates)
    const [existing] = await db.query(
      "SELECT * FROM assignments WHERE task_id = ? AND user_id = ?",
      [task_id, user_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "User is already assigned to this task." });
    }

    // Insert assignment
    await db.query(
      "INSERT INTO assignments (task_id, user_id) VALUES (?, ?)",
      [task_id, user_id]
    );

    // Also create/update task_status for this user
    await db.query(
      `INSERT INTO task_status (task_id, user_id, status) VALUES (?, ?, 'Pending')
       ON DUPLICATE KEY UPDATE status = status`,
      [task_id, user_id]
    );

    // Send notification to the assigned user
    await db.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [user_id, `You have been assigned to task: "${task[0].title}"`]
    );

    res.status(201).json({ message: `Task assigned to ${user[0].name} successfully!` });
  } catch (err) {
    console.error("Assign task error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/assigned/:userId ─────────────────────────────────────────────
// Returns all tasks assigned to a specific user with current status.
const getAssignedTasks = async (req, res) => {
  const { userId } = req.params;

  try {
    const [tasks] = await db.query(
      `SELECT 
         t.task_id, t.title, t.description, t.priority, t.deadline, t.created_at,
         u.name AS created_by_name,
         a.assigned_date,
         COALESCE(ts.status, 'Pending') AS current_status
       FROM assignments a
       JOIN tasks t ON a.task_id = t.task_id
       JOIN users u ON t.created_by = u.user_id
       LEFT JOIN task_status ts ON ts.task_id = t.task_id AND ts.user_id = a.user_id
       WHERE a.user_id = ?
       ORDER BY t.deadline ASC`,
      [userId]
    );

    res.json(tasks);
  } catch (err) {
    console.error("Get assigned tasks error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { assignTask, getAssignedTasks };
