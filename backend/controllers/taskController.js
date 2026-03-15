// controllers/taskController.js
// ---------------------------------------------------------------------------
// Task Controller
// Handles creating, reading, updating, and deleting tasks.
// Also creates notifications when tasks are created.
// ---------------------------------------------------------------------------

const db = require("../config/db");

// ── POST /api/tasks ───────────────────────────────────────────────────────
// Creates a new task. Only logged-in users (admin preferred) can create.
const createTask = async (req, res) => {
  const { title, description, priority, deadline } = req.body;
  const created_by = req.user.user_id; // From JWT token

  if (!title) {
    return res.status(400).json({ message: "Task title is required." });
  }

  // Validate priority value
  const validPriorities = ["Low", "Medium", "High"];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: "Priority must be Low, Medium, or High." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, priority, deadline, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, priority || "Low", deadline || null, created_by]
    );

    const taskId = result.insertId;

    // Auto-create a Pending status entry for this task
    await db.query(
      `INSERT INTO task_status (task_id, user_id, status) VALUES (?, ?, 'Pending')`,
      [taskId, created_by]
    );

    // Create a notification for the creator
    await db.query(
      `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
      [created_by, `Task "${title}" has been created successfully.`]
    );

    const [newTask] = await db.query("SELECT * FROM tasks WHERE task_id = ?", [taskId]);

    res.status(201).json({ message: "Task created successfully!", task: newTask[0] });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/tasks ────────────────────────────────────────────────────────
// Returns all tasks with creator name and current status.
// Supports filtering by status, priority, and search by title.
const getAllTasks = async (req, res) => {
  const { status, priority, search } = req.query;

  // Use a simple subquery to get the latest status per task efficiently
  let query = `
    SELECT 
      t.task_id, t.title, t.description, t.priority, t.deadline, t.created_at,
      u.name AS created_by_name,
      COALESCE(
        (SELECT ts2.status FROM task_status ts2
         WHERE ts2.task_id = t.task_id
         ORDER BY ts2.updated_at DESC LIMIT 1),
        'Pending'
      ) AS current_status
    FROM tasks t
    LEFT JOIN users u ON t.created_by = u.user_id
    WHERE 1=1
  `;
  const values = [];

  // Apply optional filters
  if (priority) {
    query += " AND t.priority = ?";
    values.push(priority);
  }
  if (search) {
    query += " AND t.title LIKE ?";
    values.push(`%${search}%`);
  }

  query += " ORDER BY t.deadline ASC";

  try {
    let [tasks] = await db.query(query, values);

    // Filter by status in JS (avoids complex correlated subquery in WHERE)
    if (status) {
      tasks = tasks.filter(t => t.current_status === status);
    }

    res.json(tasks);
  } catch (err) {
    console.error("Get all tasks error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/tasks/:id ────────────────────────────────────────────────────
// Returns a single task with full details, assignees, and status history.
const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    // Get task details
    const [tasks] = await db.query(
      `SELECT t.*, u.name AS created_by_name
       FROM tasks t LEFT JOIN users u ON t.created_by = u.user_id
       WHERE t.task_id = ?`,
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Get all users assigned to this task
    const [assignees] = await db.query(
      `SELECT u.user_id, u.name, u.email, a.assigned_date
       FROM assignments a JOIN users u ON a.user_id = u.user_id
       WHERE a.task_id = ?`,
      [id]
    );

    // Get status history
    const [statusHistory] = await db.query(
      `SELECT ts.status, ts.updated_at, u.name AS updated_by
       FROM task_status ts JOIN users u ON ts.user_id = u.user_id
       WHERE ts.task_id = ? ORDER BY ts.updated_at DESC`,
      [id]
    );

    res.json({ ...tasks[0], assignees, statusHistory });
  } catch (err) {
    console.error("Get task by ID error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────
// Updates task details (title, description, priority, deadline).
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, deadline } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM tasks WHERE task_id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    await db.query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        deadline = COALESCE(?, deadline)
       WHERE task_id = ?`,
      [title, description, priority, deadline, id]
    );

    const [updated] = await db.query("SELECT * FROM tasks WHERE task_id = ?", [id]);
    res.json({ message: "Task updated successfully!", task: updated[0] });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────
// Deletes a task and all related records (CASCADE handles DB side).
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query("SELECT * FROM tasks WHERE task_id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    await db.query("DELETE FROM tasks WHERE task_id = ?", [id]);
    res.json({ message: "Task deleted successfully!" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
