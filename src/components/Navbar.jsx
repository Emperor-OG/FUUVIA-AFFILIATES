import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <header className="affiliate-navbar">
      <div className="affiliate-navbar__inner">
        <Link to="/" className="affiliate-navbar__brand">
          FUUVIA Affiliates
        </Link>

        <nav className="affiliate-navbar__nav">
          <Link to="/">Home</Link>
          <Link to="/apply">Apply</Link>
          <Link to="/signin">Sign In</Link>
        </nav>
      </div>
    </header>
  );
}