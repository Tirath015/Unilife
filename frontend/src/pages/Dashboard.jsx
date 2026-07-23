import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const moduleCards = [
  {
    to: "/marketplace",
    icon: "storefront",
    title: "Marketplace",
    body: "Search, sell, wishlist, and contact student sellers.",
  },
  {
    to: "/events",
    icon: "calendar_month",
    title: "Campus Events",
    body: "Browse upcoming campus activities and workshops.",
  },
  {
    to: "/resources",
    icon: "local_library",
    title: "Campus Resources",
    body: "Find library, advising, IT, counselling, and tutoring.",
  },
  {
    to: "/discussions",
    icon: "forum",
    title: "Student Discussions",
    body: "Future community area for student questions.",
  },
  {
    to: "/jobs",
    icon: "work",
    title: "Student Jobs",
    body: "Future job board for co-op and part-time opportunities.",
  },
  {
    to: "/notifications",
    icon: "notifications",
    title: "Notifications",
    body: "Marketplace updates, seller messages, and reminders.",
  },
];

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "Student";

  return (
    <>
      <section className="dashboard-hero-card">
        <div>
          <span className="dashboard-badge">Welcome to UniLife</span>

          <h1>Welcome, {firstName}</h1>

          <p>
            Your campus marketplace, events, resources, jobs, discussions, and
            Bruno AI assistant are all connected in one secure student-friendly
            platform.
          </p>
        </div>

        <div className="dashboard-hero-art">
          <span className="floating-chip chip-one">Marketplace</span>
          <span className="floating-chip chip-two">Events</span>
          <span className="floating-chip chip-three">Bruno AI</span>

          <div className="hero-circle">
            <span>🎓</span>
          </div>
        </div>
      </section>

      <section id="unilife-features" className="dashboard-section">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Campus Hub</span>
            <h2>What would you like to do today?</h2>
          </div>
        </div>

        <div className="module-grid">
          {moduleCards.map((module) => (
            <Link className="module-card pretty-module-card" to={module.to} key={module.title}>
              <span className="material-symbols-rounded">{module.icon}</span>

              <div>
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="creative-dashboard-grid">
        <Card className="campus-journey-card">
          <div>
            <span className="eyebrow">Student Journey</span>
            <h2>Start with Marketplace, then explore the campus community.</h2>
            <p>
              UniLife helps students save money, find support, discover events,
              and stay connected throughout the semester.
            </p>
          </div>

          <div className="journey-steps">
            <div>
              <strong>1</strong>
              <span>Create or browse listings</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Save items to wishlist</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Contact sellers safely</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Ask Bruno for quick help</span>
            </div>
          </div>
        </Card>

        <Card className="bruno-dashboard-card">
          <img
            src="/images/bruno-cutout.png"
            alt="Bruno AI"
            className="bruno-dashboard-image"
          />
          <span className="eyebrow">Bruno AI</span>
          <h2>Need help finding something?</h2>
          <p>
            Ask Bruno about marketplace items, campus resources, events, or
            student support.
          </p>
          <button type="button" className="bruno-card-button" onClick={() => window.dispatchEvent(new Event("open-bruno-widget"))}
>
  Ask Bruno
</button>
        </Card>
        
      </section>

    </>
  );
}
