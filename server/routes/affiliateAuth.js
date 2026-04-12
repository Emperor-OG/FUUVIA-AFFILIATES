const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, full_name, email, password_hash, status, referral_code
      FROM affiliates
      WHERE email = $1
      LIMIT 1
      `,
      [email.trim().toLowerCase()]
    );

    const affiliate = result.rows[0];

    if (!affiliate) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      affiliate.password_hash || ""
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    req.session.affiliate = {
      id: affiliate.id,
      email: affiliate.email,
    };

    return res.json({
      message: "Login successful",
      affiliate: {
        id: affiliate.id,
        full_name: affiliate.full_name,
        email: affiliate.email,
        status: affiliate.status,
        referral_code: affiliate.referral_code || null,
      },
    });
  } catch (err) {
    console.error("Affiliate login error:", err);
    return res.status(500).json({
      error: "Login failed",
    });
  }
});

router.get("/me", async (req, res) => {
  if (!req.session?.affiliate?.id) {
    return res.json({ authenticated: false });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, full_name, email, status, referral_code
      FROM affiliates
      WHERE id = $1
      LIMIT 1
      `,
      [req.session.affiliate.id]
    );

    const affiliate = result.rows[0];

    if (!affiliate) {
      return res.json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      affiliate,
    });
  } catch (err) {
    console.error("Affiliate me error:", err);
    return res.status(500).json({
      error: "Failed to fetch affiliate session",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Affiliate logout error:", err);
      return res.status(500).json({
        error: "Failed to log out",
      });
    }

    res.clearCookie("connect.sid");

    return res.json({
      message: "Logged out successfully",
    });
  });
});

module.exports = router;