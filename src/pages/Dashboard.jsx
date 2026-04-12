import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

const API_BASE = import.meta.env.DEV ? "http://localhost:8080" : "";
const MAIN_SITE_URL = "https://fuuvia.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState(null);
  const [totals, setTotals] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/affiliates/dashboard`, {
          withCredentials: true,
        });

        setAffiliate(data.affiliate || null);
        setTotals(data.totals || null);
        setOrders(Array.isArray(data.orders) ? data.orders : []);
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
          <p><strong>Phone:</strong> {affiliate.phone || "Not provided"}</p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Referral Access</h3>
          <p><strong>Code:</strong> {affiliate.referral_code || "Not assigned yet"}</p>
          {referralLink ? (
            <div className="affiliate-dashboard-page__referral-box">
              {referralLink}
            </div>
          ) : (
            <p className="affiliate-dashboard-card__muted">
              Your referral link will appear after approval.
            </p>
          )}
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Banking</h3>
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
                    <th>Earnings</th>
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
                        {order.customer_name || "N/A"}
                        <div className="affiliate-dashboard-page__subtext">
                          {order.customer_email || order.customer_phone || ""}
                        </div>
                      </td>
                      <td>{order.item_count}</td>
                      <td>R{Number(order.earning_amount || 0).toFixed(2)}</td>
                      <td>{order.order_status}</td>
                      <td>{order.earning_status}</td>
                      <td>
                        {order.eligible_for_payout_at
                          ? new Date(order.eligible_for_payout_at).toLocaleDateString()
                          : "Not ready"}
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
