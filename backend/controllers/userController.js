// controllers/userController.js
// ---------------------------------------------------------------------------
// User Controller
// Handles getting users, getting a single user, and updating profile info.
// ---------------------------------------------------------------------------

const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ── GET /api/users ────────────────────────────────────────────────────────
// Returns all users (admin purpose). Password is excluded for security.
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────────────────
// Returns a single user by ID. Password excluded.
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(users[0]);
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── PUT /api/users/:id ────────────────────────────────────────────────────
// Update user's name and/or password. Only the user themselves can update.
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  // Users can only update their own profile (unless admin)
  if (req.user.user_id != id && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only update your own profile." });
  }

  try {
    // Build update fields dynamically
    let query = "UPDATE users SET ";
    const values = [];
    const updates = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    query += updates.join(", ") + " WHERE user_id = ?";
    values.push(id);

    await db.query(query, values);

    // Return updated user
    const [updated] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      [id]
    );

    res.json({ message: "Profile updated successfully!", user: updated[0] });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getAllUsers, getUserById, updateUser };
