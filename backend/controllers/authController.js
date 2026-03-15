// controllers/authController.js
// ---------------------------------------------------------------------------
// Authentication Controller
// Handles user registration (signup) and login.
// Passwords are hashed with bcrypt. JWT tokens are issued on login.
// ---------------------------------------------------------------------------

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ── Helper: Generate a JWT token ──────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ── POST /api/register ────────────────────────────────────────────────────
// Registers a new user. Defaults role to 'member' unless specified.
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    // Check if email already exists (UNIQUE constraint backup)
    const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash the password (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role - only 'admin' or 'member' allowed
    const userRole = role === "admin" ? "admin" : "member";

    // Insert new user into database
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, userRole]
    );

    // Fetch the created user to return it
    const [newUser] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      [result.insertId]
    );

    const token = generateToken(newUser[0]);

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: newUser[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ── POST /api/login ───────────────────────────────────────────────────────
// Logs in a user, returns JWT token on success.
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find user by email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = users[0];

    // Compare entered password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: "Login successful!",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = { register, login };
