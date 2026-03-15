// routes/auth.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// POST /api/register - Create a new account
router.post("/register", register);

// POST /api/login - Login and receive a JWT token
router.post("/login", login);

module.exports = router;
