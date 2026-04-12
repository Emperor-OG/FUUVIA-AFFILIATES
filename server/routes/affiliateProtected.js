const express = require("express");
const pool = require("../db");

const router = express.Router();

function requireAffiliate(req, res, next) {
  if (!req.session?.affiliate?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  next();
}

router.get("/dashboard", requireAffiliate, async (req, res) => {
  try {
    const affiliateId = req.session.affiliate.id;

    const affiliateRes = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        status,
        referral_code,
        bank_name,
        account_holder,
        account_number,
        account_type,
        branch_code,
        created_at,
        verified_at
      FROM affiliates
      WHERE id = $1
      LIMIT 1
      `,
      [affiliateId]
    );

    const affiliate = affiliateRes.rows[0];

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    const totalsRes = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN earning_status = 'tracked' THEN earning_amount ELSE 0 END), 0) AS tracked_total,
        COALESCE(SUM(CASE WHEN earning_status = 'completed' THEN earning_amount ELSE 0 END), 0) AS completed_total,
        COALESCE(SUM(CASE WHEN earning_status = 'ready_for_payout' THEN earning_amount ELSE 0 END), 0) AS ready_total,
        COALESCE(SUM(CASE WHEN earning_status = 'paid' THEN earning_amount ELSE 0 END), 0) AS paid_total,
        COUNT(*) AS total_orders
      FROM affiliate_earnings
      WHERE affiliate_id = $1
      `,
      [affiliateId]
    );

    const ordersRes = await pool.query(
      `
      SELECT
        order_id,
        order_reference,
        customer_name,
        customer_email,
        customer_phone,
        item_count,
        order_total,
        earning_amount,
        order_status,
        earning_status,
        completed_at,
        eligible_for_payout_at,
        paid_at,
        created_at
      FROM affiliate_earnings
      WHERE affiliate_id = $1
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [affiliateId]
    );

    return res.json({
      affiliate,
      totals: totalsRes.rows[0],
      orders: ordersRes.rows,
    });
  } catch (err) {
    console.error("Affiliate dashboard error:", err);
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
});

module.exports = router;
