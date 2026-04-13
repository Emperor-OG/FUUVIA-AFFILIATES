import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <main className="affiliate-landing">
      <section className="affiliate-landing__hero">
        <div className="affiliate-landing__hero-card">
          <p className="affiliate-landing__eyebrow">FUUVIA Affiliate Programme</p>

          <h1 className="affiliate-landing__title">
            Earn R20 for every item sold.
          </h1>

          <p className="affiliate-landing__text">
            Join the FUUVIA Affiliate Programme and earn a fixed R20 commission
            on every item purchased through your affiliate link. There is no
            minimum payout threshold, so you can get paid from your earnings
            without needing to hit a target first.
          </p>

          <div className="affiliate-landing__highlights">
            <div className="affiliate-landing__highlight">
              <span className="affiliate-landing__highlight-label">Commission</span>
              <strong>R20 per item</strong>
            </div>

            <div className="affiliate-landing__highlight">
              <span className="affiliate-landing__highlight-label">Payout threshold</span>
              <strong>No minimum</strong>
            </div>

            <div className="affiliate-landing__highlight">
              <span className="affiliate-landing__highlight-label">Getting started</span>
              <strong>Apply online</strong>
            </div>
          </div>

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
            <h3>Simple Earnings</h3>
            <p>
              Every qualifying item sold through your affiliate link earns you
              a fixed R20 commission. The more items your audience buys, the
              more you earn.
            </p>
          </article>

          <article className="affiliate-landing__card">
            <h3>No Payout Threshold</h3>
            <p>
              You do not need to wait until you reach a certain amount before
              receiving your payout. Your approved earnings can be paid without
              a minimum threshold.
            </p>
          </article>

          <article className="affiliate-landing__card">
            <h3>Track Your Performance</h3>
            <p>
              Approved affiliates can sign in to view their dashboard, monitor
              orders linked to their referrals, and keep track of earnings and
              payout progress.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
