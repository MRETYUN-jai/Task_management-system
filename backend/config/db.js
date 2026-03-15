// config/db.js
// ---------------------------------------------------------------------------
// Database Connection Configuration
// Uses mysql2 with a connection pool for efficient query management.
// Connection details are loaded from the .env file.
// ---------------------------------------------------------------------------

const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool (more efficient than a single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,    // Max 10 simultaneous connections
  queueLimit: 0,
});

// Use promise-based API so we can use async/await in controllers
const promisePool = pool.promise();

// Test the connection when the server starts
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ MySQL Database connected successfully!");
    connection.release(); // Release the test connection back to pool
  }
});

module.exports = promisePool;
