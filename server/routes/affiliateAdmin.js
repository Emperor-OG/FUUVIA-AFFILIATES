const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

function generateReferralCode(name = "") {
  const cleaned = String(name)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `FUU${cleaned}${randomPart}`.slice(0, 14);
}

async function getUniqueReferralCode(fullName) {
  for (let i = 0; i < 10; i++) {
    const code = generateReferralCode(fullName);

    const exists = await pool.query(
      `SELECT id FROM affiliates WHERE referral_code = $1 LIMIT 1`,
      [code]
    );

    if (!exists.rows.length) {
      return code;
    }
  }

  throw new Error("Failed to generate unique referral code");
}

router.get("/pending", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, full_name, email, phone, status, application_note, created_at
      FROM affiliates
      WHERE status = 'pending'
      ORDER BY created_at ASC
      `
    );

    return res.json({ applicants: result.rows });
  } catch (err) {
    console.error("Pending affiliates error:", err);
    return res.status(500).json({ error: "Failed to load applicants" });
  }
});

router.post("/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    const affiliateRes = await pool.query(
      `
      SELECT id, full_name, status
      FROM affiliates
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    const affiliate = affiliateRes.rows[0];

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    if (affiliate.status === "active") {
      return res.status(400).json({ error: "Affiliate is already active" });
    }

    const referralCode = await getUniqueReferralCode(affiliate.full_name);

    const result = await pool.query(
      `
      UPDATE affiliates
      SET
        status = 'active',
        referral_code = $2,
        verified_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, full_name, email, status, referral_code, verified_at
      `,
      [id, referralCode]
    );

    return res.json({
      message: "Affiliate approved successfully",
      affiliate: result.rows[0],
    });
  } catch (err) {
    console.error("Approve affiliate error:", err);
    return res.status(500).json({ error: "Failed to approve affiliate" });
  }
});

router.post("/:id/reject", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE affiliates
      SET
        status = 'rejected',
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, full_name, email, status
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    return res.json({
      message: "Affiliate rejected",
      affiliate: result.rows[0],
    });
  } catch (err) {
    console.error("Reject affiliate error:", err);
    return res.status(500).json({ error: "Failed to reject affiliate" });
  }
});

router.post("/:id/suspend", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE affiliates
      SET
        status = 'suspended',
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, full_name, email, status
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    return res.json({
      message: "Affiliate suspended",
      affiliate: result.rows[0],
    });
  } catch (err) {
    console.error("Suspend affiliate error:", err);
    return res.status(500).json({ error: "Failed to suspend affiliate" });
  }
});

module.exports = router;
