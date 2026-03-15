// server.js
// ---------------------------------------------------------------------------
// Main Entry Point for the Backend Server
// Sets up Express, loads middleware, mounts all routes, and starts listening.
// ---------------------------------------------------------------------------

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import all route files
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
const assignmentRoutes = require("./routes/assignments");
const statusRoutes = require("./routes/status");
const notificationRoutes = require("./routes/notifications");
const reportRoutes = require("./routes/reports");

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────────

// Allow requests from frontend — both local dev and Vercel production URL
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // Set this to your Vercel URL on Railway
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// Parse incoming JSON request bodies
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api", authRoutes);               // POST /api/register, /api/login
app.use("/api/users", userRoutes);         // GET/PUT /api/users, /api/users/:id
app.use("/api/tasks", taskRoutes);         // CRUD /api/tasks
app.use("/api", assignmentRoutes);         // POST /api/assign, GET /api/assigned/:userId
app.use("/api/status", statusRoutes);      // PUT /api/status/update
app.use("/api/notifications", notificationRoutes); // GET/PUT /api/notifications
app.use("/api/reports", reportRoutes);     // GET /api/reports/*

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running! 🚀" });
});

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Task Manager Backend running at http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}\n`);
});
