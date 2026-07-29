import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/layout/Logo";

export function Landing() {
  const features = [
    [
      "storefront",
      "Student Marketplace",
      "Buy and sell textbooks, electronics, furniture, clothing, and more.",
    ],
    [
      "calendar_month",
      "Campus Events",
      "Discover events and register for activities.",
    ],
    [
      "forum",
      "Student Discussions",
      "A space for student questions and campus topics.",
    ],
    [
      "work",
      "Student Jobs",
      "Future job board for co-op and part-time opportunities.",
    ],
    [
      "local_library",
      "Campus Resources",
      "Find library, advising, IT support, counselling, and tutoring.",
    ],
    [
      "security",
      "Verified & Secure",
      "Built around campus email verification and token-based access.",
    ],
  ];

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Logo />

        <nav>
          <Link to="/login">Log In</Link>
          <Link className="nav-pill" to="/signup">
            Sign Up
          </Link>
        </nav>
      </header>

      <section className="hero-section hero-bg">
        <div className="hero-overlay">
          <div className="hero-copy">
            <span className="badge">For college and university students</span>

            <h1>
              Your campus.
              <br />
              Smarter.
            </h1>

            <p>
              UniLife brings student marketplace listings, campus resources,
              notifications, jobs, events, and student support into one secure
              platform.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary btn-md" to="/signup">
                Get Started Free
              </Link>

              <Link className="btn btn-outline btn-md" to="/login">
                Log In
              </Link>
            </div>

            <div className="trust-row">
              <span>✓ Verified campus email</span>
              <span>✓ Secure authentication</span>
              <span>✓ Student-first design</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stats" aria-label="Platform statistics">
        <div>
          <strong>4,200+</strong>
          <span>Active students</span>
        </div>

        <div>
          <strong>890+</strong>
          <span>Listings posted</span>
        </div>

        <div>
          <strong>120+</strong>
          <span>Campus events</span>
        </div>

        <div>
          <strong>4.9★</strong>
          <span>Avg. seller rating</span>
        </div>
      </section>

      <section className="landing-features">
        {features.map(([icon, title, body]) => (
          <article className="feature-card" key={title}>
            <span className="material-symbols-rounded">{icon}</span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="landing-footer">
        <Logo />
        <span>College & university student platform</span>
        <span>© 2026 UniLife</span>
      </footer>
    </div>
  );
}