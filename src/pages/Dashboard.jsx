import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

const API_BASE = import.meta.env.DEV ? "http://localhost:8080" : "";
const MAIN_SITE_URL = "https://www.fuuvia.com";

const SOUTH_AFRICAN_BANKS = [
  { label: "Absa", value: "Absa", branch_code: "632005" },
  { label: "African Bank", value: "African Bank", branch_code: "430000" },
  { label: "Bidvest Bank", value: "Bidvest Bank", branch_code: "462005" },
  { label: "Capitec Bank", value: "Capitec Bank", branch_code: "470010" },
  { label: "Discovery Bank", value: "Discovery Bank", branch_code: "679000" },
  { label: "FNB", value: "FNB", branch_code: "250655" },
  { label: "Investec", value: "Investec", branch_code: "580105" },
  { label: "Nedbank", value: "Nedbank", branch_code: "198765" },
  { label: "Old Mutual", value: "Old Mutual", branch_code: "462005" },
  { label: "RMB", value: "RMB", branch_code: "261251" },
  { label: "RMB Private Bank", value: "RMB Private Bank", branch_code: "222026" },
  { label: "Sasfin Bank", value: "Sasfin Bank", branch_code: "683000" },
  { label: "Standard Bank", value: "Standard Bank", branch_code: "051001" },
  { label: "TymeBank", value: "TymeBank", branch_code: "678910" },
];

const ACCOUNT_TYPES = [
  { label: "Savings", value: "Savings" },
  { label: "Cheque", value: "Cheque" },
  { label: "Current", value: "Current" },
  { label: "Business", value: "Business" },
  { label: "Transmission", value: "Transmission" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState(null);
  const [totals, setTotals] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [showBankingModal, setShowBankingModal] = useState(false);

  const [showStoreLinksModal, setShowStoreLinksModal] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [storeLinksLoading, setStoreLinksLoading] = useState(false);
  const [storeLinksError, setStoreLinksError] = useState("");
  const [stores, setStores] = useState([]);

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
    return `${MAIN_SITE_URL}/REF/${affiliate.referral_code}`;
  }, [affiliate]);

  const updateProfileField = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBankChange = (value) => {
    const selectedBank = SOUTH_AFRICAN_BANKS.find((bank) => bank.value === value);

    setProfileForm((prev) => ({
      ...prev,
      bank_name: value,
      branch_code: selectedBank?.branch_code || "",
    }));
  };

  const handleCopyText = async (text, successText = "Copied.") => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setProfileMessage(successText);
      setTimeout(() => setProfileMessage(""), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      setProfileMessage("Failed to copy.");
      setTimeout(() => setProfileMessage(""), 2500);
    }
  };

  const handleOpenBankingModal = () => {
    const a = affiliate || {};
    setProfileForm({
      phone: a.phone || "",
      bank_name: a.bank_name || "",
      account_holder: a.account_holder || "",
      account_number: a.account_number || "",
      account_type: a.account_type || "",
      branch_code: a.branch_code || "",
    });
    setProfileMessage("");
    setShowBankingModal(true);
  };

  const handleCloseBankingModal = () => {
    if (savingProfile) return;
    setShowBankingModal(false);
    setProfileMessage("");
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

      setTimeout(() => {
        setShowBankingModal(false);
        setProfileMessage("");
      }, 900);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileMessage(
        err?.response?.data?.error || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const loadStoreLinks = async (searchValue = "") => {
    try {
      setStoreLinksLoading(true);
      setStoreLinksError("");

      const { data } = await axios.get(`${API_BASE}/api/affiliates/stores`, {
        withCredentials: true,
        params: { search: searchValue },
      });

      setStores(Array.isArray(data?.stores) ? data.stores : []);
    } catch (err) {
      console.error("Failed to load stores:", err);
      setStoreLinksError(
        err?.response?.data?.error || "Failed to load store links."
      );
    } finally {
      setStoreLinksLoading(false);
    }
  };

  const handleOpenStoreLinksModal = () => {
    setShowStoreLinksModal(true);
    setStoreSearch("");
    setStores([]);
    setStoreLinksError("");
    loadStoreLinks("");
  };

  const handleCloseStoreLinksModal = () => {
    if (storeLinksLoading) return;
    setShowStoreLinksModal(false);
    setStoreSearch("");
    setStores([]);
    setStoreLinksError("");
  };

  const handleStoreSearchSubmit = (e) => {
    e.preventDefault();
    loadStoreLinks(storeSearch);
  };

  const getStoreReferralLink = (storeId) => {
    if (!affiliate?.referral_code || !storeId) return "";
    const nextPath = `/store?id=${storeId}`;
    return `${MAIN_SITE_URL}/REF/${affiliate.referral_code}?next=${encodeURIComponent(nextPath)}`;
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
    <>
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
                Track your status, referral access, orders, earnings, payout progress, and store-specific links.
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
            <div className="affiliate-dashboard-page__card-top">
              <h3>Referral Access</h3>
              <button
                type="button"
                className="affiliate-dashboard-page__action-btn"
                onClick={handleOpenStoreLinksModal}
              >
                Store Links
              </button>
            </div>

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
                    onClick={() => handleCopyText(referralLink, "Referral link copied.")}
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
            <div className="affiliate-dashboard-page__card-top">
              <h3>Banking Snapshot</h3>
              <button
                type="button"
                className="affiliate-dashboard-page__action-btn"
                onClick={handleOpenBankingModal}
              >
                Change
              </button>
            </div>

            <p><strong>Bank:</strong> {affiliate.bank_name || "Not added"}</p>
            <p><strong>Account Holder:</strong> {affiliate.account_holder || "Not added"}</p>
            <p><strong>Account Number:</strong> {affiliate.account_number || "Not added"}</p>
            <p><strong>Account Type:</strong> {affiliate.account_type || "Not added"}</p>
            <p><strong>Branch Code:</strong> {affiliate.branch_code || "Not added"}</p>
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

      {showBankingModal && (
        <div
          className="affiliate-dashboard-page__modal-overlay"
          onClick={handleCloseBankingModal}
        >
          <div
            className="affiliate-dashboard-page__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="affiliate-dashboard-page__modal-header">
              <div>
                <h3>Update Account Details</h3>
                <p>Edit your payout and contact details below.</p>
              </div>

              <button
                type="button"
                className="affiliate-dashboard-page__modal-close"
                onClick={handleCloseBankingModal}
              >
                ×
              </button>
            </div>

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
                  <select
                    id="bank_name"
                    value={profileForm.bank_name}
                    onChange={(e) => handleBankChange(e.target.value)}
                  >
                    <option value="">Select a bank</option>
                    {SOUTH_AFRICAN_BANKS.map((bank) => (
                      <option key={bank.value} value={bank.value}>
                        {bank.label}
                      </option>
                    ))}
                  </select>
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
                  <select
                    id="account_type"
                    value={profileForm.account_type}
                    onChange={(e) =>
                      updateProfileField("account_type", e.target.value)
                    }
                  >
                    <option value="">Select account type</option>
                    {ACCOUNT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="affiliate-dashboard-page__field">
                  <label htmlFor="branch_code">Branch Code</label>
                  <input
                    id="branch_code"
                    type="text"
                    value={profileForm.branch_code}
                    readOnly
                    placeholder="Auto-filled from bank selection"
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
        </div>
      )}

      {showStoreLinksModal && (
        <div
          className="affiliate-dashboard-page__modal-overlay"
          onClick={handleCloseStoreLinksModal}
        >
          <div
            className="affiliate-dashboard-page__modal affiliate-dashboard-page__modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="affiliate-dashboard-page__modal-header">
              <div>
                <h3>Store Referral Links</h3>
                <p>Search for a store and copy a direct referral link for that specific store.</p>
              </div>

              <button
                type="button"
                className="affiliate-dashboard-page__modal-close"
                onClick={handleCloseStoreLinksModal}
              >
                ×
              </button>
            </div>

            <form
              className="affiliate-dashboard-page__store-search"
              onSubmit={handleStoreSearchSubmit}
            >
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search by store name"
              />
              <button
                type="submit"
                className="affiliate-dashboard-page__save-btn"
                disabled={storeLinksLoading}
              >
                {storeLinksLoading ? "Searching..." : "Search"}
              </button>
            </form>

            {storeLinksError ? (
              <p className="affiliate-dashboard-page__profile-message">
                {storeLinksError}
              </p>
            ) : null}

            <div className="affiliate-dashboard-page__table-wrap">
              <table className="affiliate-dashboard-page__table">
                <thead>
                  <tr>
                    <th>Store ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!storeLinksLoading && stores.length === 0 ? (
                    <tr>
                      <td colSpan="5">No stores found.</td>
                    </tr>
                  ) : (
                    stores.map((store) => {
                      const storeLink = getStoreReferralLink(store.id);

                      return (
                        <tr key={store.id}>
                          <td>{store.id}</td>
                          <td>{store.store_name}</td>
                          <td>
                            {[store.city, store.province].filter(Boolean).join(" • ") || "-"}
                          </td>
                          <td>
                            <div className="affiliate-dashboard-page__store-link-cell">
                              {storeLink}
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="affiliate-dashboard-page__action-btn"
                              onClick={() =>
                                handleCopyText(storeLink, "Store referral link copied.")
                              }
                            >
                              Copy
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
