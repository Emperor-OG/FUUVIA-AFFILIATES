import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

const API_BASE = import.meta.env.DEV ? "http://localhost:8080" : "";
const MAIN_SITE_URL = "https://www.fuuvia.com";

/* =========================
   BANKS + ACCOUNT TYPES
========================= */
const SOUTH_AFRICAN_BANKS = [
  { label: "Absa", value: "Absa", branch_code: "632005" },
  { label: "Capitec Bank", value: "Capitec Bank", branch_code: "470010" },
  { label: "FNB", value: "FNB", branch_code: "250655" },
  { label: "Nedbank", value: "Nedbank", branch_code: "198765" },
  { label: "Standard Bank", value: "Standard Bank", branch_code: "051001" },
  { label: "TymeBank", value: "TymeBank", branch_code: "678910" },
];

const ACCOUNT_TYPES = [
  "Savings",
  "Cheque",
  "Current",
  "Business",
];

/* =========================
   COMPONENT
========================= */
export default function Dashboard() {
  const navigate = useNavigate();

  const [affiliate, setAffiliate] = useState(null);
  const [totals, setTotals] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [showBankModal, setShowBankModal] = useState(false);

  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);

  /* =========================
     LOAD DASHBOARD
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/affiliates/dashboard`,
          { withCredentials: true }
        );

        setAffiliate(data.affiliate);
        setTotals(data.totals);
        setOrders(data.orders || []);

        setProfileForm({
          phone: data.affiliate.phone || "",
          bank_name: data.affiliate.bank_name || "",
          account_holder: data.affiliate.account_holder || "",
          account_number: data.affiliate.account_number || "",
          account_type: data.affiliate.account_type || "",
          branch_code: data.affiliate.branch_code || "",
        });
      } catch (err) {
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  /* =========================
     REFERRAL LINK
  ========================= */
  const referralLink = useMemo(() => {
    if (!affiliate?.referral_code) return null;
    return `${MAIN_SITE_URL}/REF/${affiliate.referral_code}`;
  }, [affiliate]);

  const getStoreLink = (id) => {
    return `${MAIN_SITE_URL}/REF/${affiliate.referral_code}?next=${encodeURIComponent(
      `/store?id=${id}`
    )}`;
  };

  /* =========================
     STORE SEARCH
  ========================= */
  const loadStores = async (search = "") => {
    try {
      setStoreLoading(true);

      const { data } = await axios.get(
        `${API_BASE}/api/affiliates/stores`,
        {
          withCredentials: true,
          params: { search },
        }
      );

      setStores(data.stores || []);
    } finally {
      setStoreLoading(false);
    }
  };

  /* =========================
     COPY
  ========================= */
  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setProfileMessage("Copied!");
    setTimeout(() => setProfileMessage(""), 2000);
  };

  /* =========================
     PROFILE SAVE
  ========================= */
  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const { data } = await axios.put(
        `${API_BASE}/api/affiliates/profile`,
        profileForm,
        { withCredentials: true }
      );

      setAffiliate(data.affiliate);
      setProfileMessage("Saved!");

      setTimeout(() => {
        setShowBankModal(false);
        setProfileMessage("");
      }, 800);
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================
     BANK AUTO FILL
  ========================= */
  const handleBankChange = (val) => {
    const bank = SOUTH_AFRICAN_BANKS.find((b) => b.value === val);

    setProfileForm((p) => ({
      ...p,
      bank_name: val,
      branch_code: bank?.branch_code || "",
    }));
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) return <div>Loading...</div>;
  if (!affiliate) return null;

  /* =========================
     UI
  ========================= */
  return (
    <>
      <main className="affiliate-dashboard-page">
        {/* HERO */}
        <div className="affiliate-dashboard-page__hero-card">
          <div>
            <h1>Welcome, {affiliate.full_name}</h1>
            <p>Manage your affiliate activity and links.</p>
          </div>

          <button onClick={() => navigate("/signin")}>Logout</button>
        </div>

        {/* GRID */}
        <div className="affiliate-dashboard-page__grid">
          {/* STATUS */}
          <div className="affiliate-dashboard-card">
            <h3>Status</h3>
            <p>{affiliate.status}</p>
          </div>

          {/* REFERRAL */}
          <div className="affiliate-dashboard-card">
            <h3>Referral</h3>

            <div>{affiliate.referral_code}</div>

            {referralLink && (
              <>
                <div className="affiliate-dashboard-page__referral-box">
                  {referralLink}
                </div>

                <button onClick={() => copy(referralLink)}>
                  Copy
                </button>
              </>
            )}

            <button onClick={() => {
              setShowStoreModal(true);
              loadStores();
            }}>
              Store Links
            </button>
          </div>

          {/* BANK */}
          <div className="affiliate-dashboard-card">
            <h3>Bank</h3>
            <p>{affiliate.bank_name || "Not set"}</p>
            <button onClick={() => setShowBankModal(true)}>
              Change
            </button>
          </div>
        </div>

        {/* ORDERS */}
        <div className="affiliate-dashboard-card">
          <h3>Orders</h3>

          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Total</th>
                <th>Earning</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id}>
                  <td>{o.order_reference}</td>
                  <td>R{o.order_total}</td>
                  <td>R{o.earning_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* =========================
         STORE MODAL
      ========================= */}
      {showStoreModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Store Links</h3>

            <input
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder="Search..."
            />

            <button onClick={() => loadStores(storeSearch)}>
              Search
            </button>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Link</th>
                </tr>
              </thead>

              <tbody>
                {stores.map((s) => {
                  const link = getStoreLink(s.id);

                  return (
                    <tr key={s.id}>
                      <td>{s.id}</td>

                      <td>
                        {s.store_name}
                        <div
                          className={
                            s.is_open ? "store-open" : "store-closed"
                          }
                        >
                          {s.is_open ? "Open" : "Closed"}
                        </div>
                      </td>

                      <td>{link}</td>

                      <td>
                        <button onClick={() => copy(link)}>
                          Copy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button onClick={() => setShowStoreModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================
         BANK MODAL
      ========================= */}
      {showBankModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Bank Details</h3>

            <form onSubmit={saveProfile}>
              <select
                value={profileForm.bank_name}
                onChange={(e) => handleBankChange(e.target.value)}
              >
                <option value="">Select Bank</option>
                {SOUTH_AFRICAN_BANKS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>

              <input
                placeholder="Account Holder"
                value={profileForm.account_holder}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, account_holder: e.target.value })
                }
              />

              <input
                placeholder="Account Number"
                value={profileForm.account_number}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, account_number: e.target.value })
                }
              />

              <select
                value={profileForm.account_type}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, account_type: e.target.value })
                }
              >
                <option value="">Type</option>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <input value={profileForm.branch_code} readOnly />

              <button disabled={savingProfile}>
                Save
              </button>
            </form>

            <button onClick={() => setShowBankModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
