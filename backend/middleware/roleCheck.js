// middleware/roleCheck.js
// ---------------------------------------------------------------------------
// Role-Based Access Control Middleware
// Only allows users with the 'admin' role to access certain endpoints.
// Must be used AFTER the protect middleware (which sets req.user).
// ---------------------------------------------------------------------------

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User is admin, allow access
  } else {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
};

module.exports = { adminOnly };
