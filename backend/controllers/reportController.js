// controllers/reportController.js
// ---------------------------------------------------------------------------
// Report Controller
// Generates reports and statistics about tasks and user performance.
// Demonstrates complex SELECT queries with GROUP BY and aggregations.
// ---------------------------------------------------------------------------

const db = require("../config/db");

// ── GET /api/reports/completed ────────────────────────────────────────────
// Returns all tasks that have been marked as Completed.
const completedReport = async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT 
         t.task_id, t.title, t.priority, t.deadline,
         u.name AS created_by,
         ts.updated_at AS completed_at
       FROM tasks t
       JOIN task_status ts ON t.task_id = ts.task_id
       JOIN users u ON t.created_by = u.user_id
       WHERE ts.status = 'Completed'
       ORDER BY ts.updated_at DESC`
    );

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    console.error("Completed report error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/reports/pending ──────────────────────────────────────────────
// Returns all Pending or In Progress tasks, highlighting overdue ones.
const pendingReport = async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT 
         t.task_id, t.title, t.priority, t.deadline,
         u.name AS created_by,
         COALESCE(ts.status, 'Pending') AS status,
         CASE 
           WHEN t.deadline < CURDATE() AND COALESCE(ts.status, 'Pending') != 'Completed' 
           THEN TRUE ELSE FALSE 
         END AS is_overdue
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.user_id
       LEFT JOIN task_status ts ON t.task_id = ts.task_id
       WHERE COALESCE(ts.status, 'Pending') != 'Completed'
       ORDER BY t.deadline ASC`
    );

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    console.error("Pending report error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/reports/user-performance ─────────────────────────────────────
// Returns productivity stats per user: total assigned, completed, pending.
const userPerformanceReport = async (req, res) => {
  try {
    const [performance] = await db.query(
      `SELECT 
         u.user_id, u.name, u.email, u.role,
         COUNT(a.task_id) AS total_assigned,
         SUM(CASE WHEN ts.status = 'Completed' THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN ts.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN ts.status = 'Pending' OR ts.status IS NULL THEN 1 ELSE 0 END) AS pending
       FROM users u
       LEFT JOIN assignments a ON u.user_id = a.user_id
       LEFT JOIN task_status ts ON a.task_id = ts.task_id AND a.user_id = ts.user_id
       GROUP BY u.user_id, u.name, u.email, u.role
       ORDER BY completed DESC`
    );

    res.json(performance);
  } catch (err) {
    console.error("User performance report error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/reports/dashboard-stats ──────────────────────────────────────
// Quick summary stats for the Dashboard page.
const dashboardStats = async (req, res) => {
  try {
    const [[total]] = await db.query("SELECT COUNT(*) AS count FROM tasks");

    // For each task, get its latest (most recent) overall status
    const [statusRows] = await db.query(`
      SELECT t.task_id,
        COALESCE(
          (SELECT ts.status FROM task_status ts
           WHERE ts.task_id = t.task_id
           ORDER BY ts.updated_at DESC LIMIT 1),
          'Pending'
        ) AS latest_status,
        t.deadline
      FROM tasks t
    `);

    const completed = statusRows.filter(r => r.latest_status === 'Completed').length;
    const inProgress = statusRows.filter(r => r.latest_status === 'In Progress').length;
    const pending = statusRows.filter(r => r.latest_status === 'Pending').length;
    const overdue = statusRows.filter(r =>
      r.latest_status !== 'Completed' &&
      r.deadline &&
      new Date(r.deadline) < new Date()
    ).length;

    res.json({
      total: total.count,
      completed,
      in_progress: inProgress,
      pending,
      overdue,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { completedReport, pendingReport, userPerformanceReport, dashboardStats };
