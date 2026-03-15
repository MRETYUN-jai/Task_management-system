// middleware/auth.js
// ---------------------------------------------------------------------------
// JWT Authentication Middleware
// Protects private routes by verifying the Bearer token in the Authorization header.
// If valid, attaches user info to req.user and calls next().
// ---------------------------------------------------------------------------

const jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = (req, res, next) => {
  // 1. Get the token from the request header
  const authHeader = req.headers["authorization"];

  // 2. Check if the Authorization header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // 3. Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach decoded user data to the request object
    req.user = decoded; // { user_id, email, role }

    next(); // Proceed to the next middleware/controller
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = protect;
