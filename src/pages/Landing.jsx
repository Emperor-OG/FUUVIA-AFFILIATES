import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <main className="affiliate-landing">
      <section className="affiliate-landing__hero">
        <div className="affiliate-landing__hero-card">
          <p className="affiliate-landing__eyebrow">FUUVIA Affiliate Programme</p>

          <h1 className="affiliate-landing__title">
            Many are called, but few are chosen.
          </h1>

          <p className="affiliate-landing__text">
            Apply to join the FUUVIA Affiliate Programme. Every application is
            reviewed carefully, and only selected applicants are approved to
            represent the brand and earn through the programme.
          </p>

          <div className="affiliate-landing__actions">
            <Link to="/apply" className="affiliate-btn affiliate-btn--primary">
              Apply Now
            </Link>

            <Link to="/signin" className="affiliate-btn affiliate-btn--secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="affiliate-landing__info">
        <div className="affiliate-landing__grid">
          <article className="affiliate-landing__card">
            <h3>Selective Entry</h3>
            <p>
              Not everyone who applies will be accepted. The programme is
              intentionally selective so that FUUVIA works with the right people.
            </p>
          </article>

          <article className="affiliate-landing__card">
            <h3>Earn From Real Orders</h3>
            <p>
              Approved affiliates will be able to track orders they bring in,
              see their earnings, and monitor payout progress from their
              dashboard.
            </p>
          </article>

          <article className="affiliate-landing__card">
            <h3>Built For Growth</h3>
            <p>
              The programme starts with manual payouts and careful review, then
              expands as the system becomes more automated over time.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}