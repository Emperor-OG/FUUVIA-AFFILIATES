import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SignIn.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function SignIn() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post(
        `${API_BASE}/api/affiliates/login`,
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.error || err?.message || "Failed to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="affiliate-signin-page">
      <section className="affiliate-signin-page__hero">
        <div className="affiliate-signin-page__hero-card">
          <p className="affiliate-signin-page__eyebrow">
            FUUVIA Affiliate Access
          </p>

          <h1 className="affiliate-signin-page__title">Sign in to continue.</h1>

          <p className="affiliate-signin-page__text">
            Access your application status, affiliate dashboard, and earnings
            once your account has been approved.
          </p>
        </div>
      </section>

      <section className="affiliate-signin-page__content">
        <div className="affiliate-signin-page__form-card">
          <div className="affiliate-signin-page__form-header">
            <h2>Affiliate Sign In</h2>
            <p>Enter your credentials below.</p>
          </div>

          <form className="affiliate-signin-form" onSubmit={handleSubmit}>
            <div className="affiliate-signin-form__field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div className="affiliate-signin-form__field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
            </div>

            <button
              className="affiliate-signin-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {errorMessage && (
              <p className="affiliate-signin-form__error">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}