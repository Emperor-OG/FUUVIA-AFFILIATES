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

/* ✅ FIXED ROUTE */
router.get("/stores", requireAffiliate, async (req, res) => {
  try {
    const affiliateId = req.session.affiliate.id;
    const search = String(req.query.search || "").trim();

    const affiliateRes = await pool.query(
      `
      SELECT id, referral_code
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

    const params = [];
    let whereSql = `WHERE 1=1`; // 🔥 NO FILTERING

    if (search) {
      params.push(`%${search}%`);
      whereSql += ` AND s.store_name ILIKE $${params.length}`;
    }

    const storesRes = await pool.query(
      `
      SELECT
        s.id,
        s.store_name,
        s.city,
        s.province,
        s.is_open
      FROM stores s
      ${whereSql}
      ORDER BY s.store_name ASC
      LIMIT 50
      `,
      params
    );

    return res.json({
      referral_code: affiliate.referral_code || null,
      stores: storesRes.rows,
    });
  } catch (err) {
    console.error("Affiliate stores error:", err);
    return res.status(500).json({ error: "Failed to load stores" });
  }
});

router.put("/profile", requireAffiliate, async (req, res) => {
  try {
    const affiliateId = req.session.affiliate.id;

    const {
      phone,
      bank_name,
      account_holder,
      account_number,
      account_type,
      branch_code,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE affiliates
      SET
        phone = $2,
        bank_name = $3,
        account_holder = $4,
        account_number = $5,
        account_type = $6,
        branch_code = $7,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [
        affiliateId,
        phone?.trim() || null,
        bank_name?.trim() || null,
        account_holder?.trim() || null,
        account_number?.trim() || null,
        account_type?.trim() || null,
        branch_code?.trim() || null,
      ]
    );

    return res.json({
      message: "Profile updated successfully",
      affiliate: result.rows[0],
    });
  } catch (err) {
    console.error("Affiliate profile update error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
