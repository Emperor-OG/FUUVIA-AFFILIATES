import { useState } from "react";
import axios from "axios";
import "../styles/Apply.css";

const API_BASE = import.meta.env.DEV ? "http://localhost:8080" : "";

export default function Apply() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    socialLink: "",
    applicationNote: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        application_note: [
          form.socialLink ? `Social Link: ${form.socialLink.trim()}` : "",
          form.applicationNote ? form.applicationNote.trim() : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      };

      const { data } = await axios.post(`${API_BASE}/api/affiliates/apply`, payload, {
        withCredentials: true,
      });

      setSuccessMessage(
        data?.message || "Your application has been submitted successfully."
      );

      setForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        socialLink: "",
        applicationNote: "",
      });
    } catch (err) {
      console.error("Affiliate application failed:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      setErrorMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Failed to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="affiliate-apply-page">
      <section className="affiliate-apply-page__hero">
        <div className="affiliate-apply-page__hero-card">
          <p className="affiliate-apply-page__eyebrow">
            FUUVIA Affiliate Application
          </p>

          <h1 className="affiliate-apply-page__title">
            Apply to be considered.
          </h1>

          <p className="affiliate-apply-page__text">
            This is a selective programme. Submitting an application does not
            guarantee acceptance. Many are called, but few are chosen.
          </p>
        </div>
      </section>

      <section className="affiliate-apply-page__content">
        <div className="affiliate-apply-page__form-card">
          <div className="affiliate-apply-page__form-header">
            <h2>Application Form</h2>
            <p>
              Fill in your details below. Your application will be reviewed
              before any referral access is granted.
            </p>
          </div>

          <form className="affiliate-apply-form" onSubmit={handleSubmit}>
            <div className="affiliate-apply-form__grid">
              <div className="affiliate-apply-form__field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  required
                />
              </div>

              <div className="affiliate-apply-form__field">
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

              <div className="affiliate-apply-form__field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>

              <div className="affiliate-apply-form__field">
                <label htmlFor="socialLink">Social Link</label>
                <input
                  id="socialLink"
                  type="text"
                  placeholder="Instagram, TikTok, Facebook or website"
                  value={form.socialLink}
                  onChange={(e) => updateField("socialLink", e.target.value)}
                />
              </div>

              <div className="affiliate-apply-form__field">
                <label htmlFor="password">Create Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </div>

              <div className="affiliate-apply-form__field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="affiliate-apply-form__field affiliate-apply-form__field--full">
              <label htmlFor="applicationNote">
                Why do you want to join the programme?
              </label>
              <textarea
                id="applicationNote"
                placeholder="Tell us why you should be considered for the FUUVIA Affiliate Programme"
                value={form.applicationNote}
                onChange={(e) => updateField("applicationNote", e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="affiliate-apply-form__note">
              By applying, you understand that approval is not automatic and
              that only selected applicants are admitted into the programme.
            </div>

            <button
              className="affiliate-apply-form__submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>

            {successMessage && (
              <p className="affiliate-apply-form__success">{successMessage}</p>
            )}

            {errorMessage && (
              <p
                className="affiliate-apply-form__success"
                style={{ color: "#c62828" }}
              >
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
