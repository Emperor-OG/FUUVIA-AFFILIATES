import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || "https://fuuvia.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAffiliate = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/affiliates/me`, {
          withCredentials: true,
        });

        if (!data?.authenticated || !data?.affiliate) {
          navigate("/signin");
          return;
        }

        setAffiliate(data.affiliate);
      } catch (err) {
        console.error("Dashboard session load failed:", err);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadAffiliate();
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
              View your application status, referral access, and earnings
              progress here.
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
          <p>
            <strong>Status:</strong> {affiliate.status}
          </p>
          <p>
            <strong>Email:</strong> {affiliate.email}
          </p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Referral Code</h3>
          <p>
            <strong>Code:</strong> {affiliate.referral_code || "Not assigned yet"}
          </p>
          <p className="affiliate-dashboard-card__muted">
            A referral code is only assigned once you are approved into the
            programme.
          </p>
        </div>

        <div className="affiliate-dashboard-card affiliate-dashboard-card--wide">
          <h3>Your Referral Link</h3>

          {referralLink ? (
            <>
              <div className="affiliate-dashboard-page__referral-box">
                {referralLink}
              </div>
              <p className="affiliate-dashboard-card__muted">
                Share this link to send customers to FUUVIA through your
                affiliate access.
              </p>
            </>
          ) : (
            <p className="affiliate-dashboard-card__muted">
              Your referral link will appear here after your application has
              been approved and a referral code has been assigned.
            </p>
          )}
        </div>
      </section>

      <section className="affiliate-dashboard-page__status-panel">
        {affiliate.status === "pending" && (
          <div className="affiliate-dashboard-card">
            <h3>Application Under Review</h3>
            <p>
              Your application has been received and is currently being reviewed.
              Many are called, but few are chosen.
            </p>
          </div>
        )}

        {affiliate.status === "active" && (
          <div className="affiliate-dashboard-card">
            <h3>Approved</h3>
            <p>
              Your affiliate account is active. You can now use your referral
              link and participate in the programme.
            </p>
          </div>
        )}

        {affiliate.status === "rejected" && (
          <div className="affiliate-dashboard-card">
            <h3>Application Not Approved</h3>
            <p>
              Your application was not approved for the programme at this time.
            </p>
          </div>
        )}

        {affiliate.status === "suspended" && (
          <div className="affiliate-dashboard-card">
            <h3>Account Suspended</h3>
            <p>
              Your affiliate account is currently suspended. Referral activity
              and payouts are paused.
            </p>
          </div>
        )}
      </section>

      <section className="affiliate-dashboard-page__placeholder-grid">
        <div className="affiliate-dashboard-card">
          <h3>Orders</h3>
          <p className="affiliate-dashboard-card__muted">
            Orders brought in through your referral link will appear here.
          </p>
        </div>

        <div className="affiliate-dashboard-card">
          <h3>Earnings</h3>
          <p className="affiliate-dashboard-card__muted">
            Your tracked, completed, ready-for-payout, and paid earnings will
            appear here.
          </p>
        </div>
      </section>
    </main>
  );
}