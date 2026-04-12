import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

const API_BASE = import.meta.env.DEV ? "http://localhost:8080" : "";
const MAIN_SITE_URL = "https://www.fuuvia.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState(null);
  const [totals, setTotals] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [profileForm, setProfileForm] = useState({
    phone: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    account_type: "",
    branch_code: "",
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/affiliates/dashboard`, {
          withCredentials: true,
        });

        setAffiliate(data.affiliate || null);
        setTotals(data.totals || null);
        setOrders(Array.isArray(data.orders) ? data.orders : []);

        const a = data.affiliate || {};
        setProfileForm({
          phone: a.phone || "",
          bank_name: a.bank_name || "",
          account_holder: a.account_holder || "",
          account_number: a.account_number || "",
          account_type: a.account_type || "",
          branch_code: a.branch_code || "",
        });
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const referralLink = useMemo(() => {
    if (!affiliate?.referral_code) return null;
    return `${MAIN_SITE_URL}/a/${affiliate.referral_code}`;
  }, [affiliate]);

  const updateProfileField = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setProfileMessage("Referral link copied.");
      setTimeout(() => setProfileMessage(""), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      setProfileMessage("Failed to copy referral link.");
      setTimeout(() => setProfileMessage(""), 2500);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");

    try {
      const { data } = await axios.put(
        `${API_BASE}/api/affiliates/profile`,
        profileForm,
        { withCredentials: true }
      );

      setAffiliate(data.affiliate || null);
      setProfileMessage(data?.message || "Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileMessage(
        err?.response?.data?.error || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/affiliates/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/signin");
    }
  };

  if (loading) {
    return (
      <main className="affiliate-dashboard-page">
        <div className="affiliate-dashboard-card">Loading dashboard...</div>
      </main>
    );
  }

  if (!affiliate) return null;

  return (
    <main className="affiliate-dashboard-page">
      <section className="affiliate-dashboard-page__hero">
        <div className="affiliate-dashboard-page__hero-card">
          <div>
            <p className="affiliate-dashboard-page__eyebrow">
              FUUVIA Affiliate Dashboard
            </p>
            <h1 className="affiliate-dashboard-page__title">
              Welcome, {affiliate.full_name}
            </h1>
            <p className="affiliate-dashboard-page__text">
              Track your status, referral access, orders, earnings, and payout progress.
            </p>
          </div>

          <button
            className="affiliate-dashboard-page__logout"
            type="button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </section>

      <section className="affiliate-dashboard-page__grid">
        <div className="affiliate-dashboard-card">
          <h3>Account Status</h3>
          <p><strong>Status:</strong> {affiliate.status}</p>
          <p><strong>Email:</strong> {affiliate.email}</p>
          <p><strong>Phone:</strong> {affiliate.phone || "Not added"}</p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Referral Access</h3>
          <p><strong>Code:</strong> {affiliate.referral_code || "Not assigned yet"}</p>

          {referralLink ? (
            <>
              <div className="affiliate-dashboard-page__referral-box">
                <a
                  href={referralLink}
                  target="_blank"
                  rel="noreferrer"
                  className="affiliate-dashboard-page__referral-link"
                >
                  {referralLink}
                </a>
              </div>

              <div className="affiliate-dashboard-page__referral-actions">
                <button
                  type="button"
                  className="affiliate-dashboard-page__action-btn"
                  onClick={handleCopyLink}
                >
                  Copy Link
                </button>
              </div>
            </>
          ) : (
            <p className="affiliate-dashboard-card__muted">
              Your referral link will appear after approval.
            </p>
          )}
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Banking Snapshot</h3>
          <p><strong>Bank:</strong> {affiliate.bank_name || "Not added"}</p>
          <p><strong>Account Holder:</strong> {affiliate.account_holder || "Not added"}</p>
          <p><strong>Account Type:</strong> {affiliate.account_type || "Not added"}</p>
        </div>
      </section>

      <section className="affiliate-dashboard-page__stats">
        <div className="affiliate-dashboard-card">
          <h3>Tracked</h3>
          <p className="affiliate-dashboard-page__stat">
            R{Number(totals?.tracked_total || 0).toFixed(2)}
          </p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Completed</h3>
          <p className="affiliate-dashboard-page__stat">
            R{Number(totals?.completed_total || 0).toFixed(2)}
          </p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Ready for Payout</h3>
          <p className="affiliate-dashboard-page__stat">
            R{Number(totals?.ready_total || 0).toFixed(2)}
          </p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Paid</h3>
          <p className="affiliate-dashboard-page__stat">
            R{Number(totals?.paid_total || 0).toFixed(2)}
          </p>
        </div>
      </section>

      <section className="affiliate-dashboard-page__status-panel">
        {affiliate.status === "pending" && (
          <div className="affiliate-dashboard-card">
            <h3>Application Under Review</h3>
            <p>Your application is currently being reviewed.</p>
          </div>
        )}

        {affiliate.status === "active" && (
          <div className="affiliate-dashboard-card">
            <h3>Approved</h3>
            <p>Your affiliate account is active and ready to earn.</p>
          </div>
        )}

        {affiliate.status === "rejected" && (
          <div className="affiliate-dashboard-card">
            <h3>Application Not Approved</h3>
            <p>Your application was not approved at this time.</p>
          </div>
        )}

        {affiliate.status === "suspended" && (
          <div className="affiliate-dashboard-card">
            <h3>Account Suspended</h3>
            <p>Your affiliate account is currently suspended.</p>
          </div>
        )}
      </section>

      <section className="affiliate-dashboard-page__profile-section">
        <div className="affiliate-dashboard-card">
          <h3>Update Account Details</h3>

          <form
            className="affiliate-dashboard-page__profile-form"
            onSubmit={handleSaveProfile}
          >
            <div className="affiliate-dashboard-page__form-grid">
              <div className="affiliate-dashboard-page__field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => updateProfileField("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="affiliate-dashboard-page__field">
                <label htmlFor="bank_name">Bank Name</label>
                <input
                  id="bank_name"
                  type="text"
                  value={profileForm.bank_name}
                  onChange={(e) => updateProfileField("bank_name", e.target.value)}
                  placeholder="Enter your bank name"
                />
              </div>

              <div className="affiliate-dashboard-page__field">
                <label htmlFor="account_holder">Account Holder</label>
                <input
                  id="account_holder"
                  type="text"
                  value={profileForm.account_holder}
                  onChange={(e) =>
                    updateProfileField("account_holder", e.target.value)
                  }
                  placeholder="Enter account holder name"
                />
              </div>

              <div className="affiliate-dashboard-page__field">
                <label htmlFor="account_number">Account Number</label>
                <input
                  id="account_number"
                  type="text"
                  value={profileForm.account_number}
                  onChange={(e) =>
                    updateProfileField("account_number", e.target.value)
                  }
                  placeholder="Enter account number"
                />
              </div>

              <div className="affiliate-dashboard-page__field">
                <label htmlFor="account_type">Account Type</label>
                <input
                  id="account_type"
                  type="text"
                  value={profileForm.account_type}
                  onChange={(e) =>
                    updateProfileField("account_type", e.target.value)
                  }
                  placeholder="Savings / Cheque / Current"
                />
              </div>

              <div className="affiliate-dashboard-page__field">
                <label htmlFor="branch_code">Branch Code</label>
                <input
                  id="branch_code"
                  type="text"
                  value={profileForm.branch_code}
                  onChange={(e) =>
                    updateProfileField("branch_code", e.target.value)
                  }
                  placeholder="Enter branch code"
                />
              </div>
            </div>

            <div className="affiliate-dashboard-page__profile-actions">
              <button
                type="submit"
                className="affiliate-dashboard-page__save-btn"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Details"}
              </button>

              {profileMessage ? (
                <p className="affiliate-dashboard-page__profile-message">
                  {profileMessage}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section className="affiliate-dashboard-page__orders">
        <div className="affiliate-dashboard-card">
          <h3>Recent Orders</h3>

          {orders.length === 0 ? (
            <p className="affiliate-dashboard-card__muted">
              No referred orders yet.
            </p>
          ) : (
            <div className="affiliate-dashboard-page__table-wrap">
              <table className="affiliate-dashboard-page__table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Order Total</th>
                    <th>Earning</th>
                    <th>Order Status</th>
                    <th>Earning Status</th>
                    <th>Payout Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_reference || `#${order.order_id}`}</td>
                      <td>
                        <div>{order.customer_name || "-"}</div>
                        <div className="affiliate-dashboard-page__subtext">
                          {order.customer_email || order.customer_phone || ""}
                        </div>
                      </td>
                      <td>{order.item_count}</td>
                      <td>R{Number(order.order_total || 0).toFixed(2)}</td>
                      <td>R{Number(order.earning_amount || 0).toFixed(2)}</td>
                      <td>{order.order_status}</td>
                      <td>{order.earning_status}</td>
                      <td>
                        {order.eligible_for_payout_at
                          ? new Date(order.eligible_for_payout_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
