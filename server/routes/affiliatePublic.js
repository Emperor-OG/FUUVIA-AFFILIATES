const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

router.post("/apply", async (req, res) => {
  const {
    full_name,
    email,
    phone,
    password,
    application_note,
  } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      error: "Full name, email and password are required",
    });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    const existing = await pool.query(
      `SELECT id, status FROM affiliates WHERE email = $1 LIMIT 1`,
      [cleanEmail]
    );

    if (existing.rows.length) {
      return res.status(400).json({
        error: "An application with this email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO affiliates (
        full_name,
        email,
        phone,
        password_hash,
        application_note,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING id, full_name, email, status, created_at
      `,
      [
        full_name.trim(),
        cleanEmail,
        phone?.trim() || null,
        password_hash,
        application_note?.trim() || null,
      ]
    );

    return res.status(201).json({
      message: "Application submitted successfully",
      affiliate: result.rows[0],
    });
  } catch (err) {
    console.error("Affiliate apply error:", err);
    return res.status(500).json({
      error: "Failed to submit application",
    });
  }
});

module.exports = router;