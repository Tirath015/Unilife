import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/formatters";
import { Logo } from "./Logo";

export function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const formattedDate = dateTime.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="user-topbar">
      <div>
        <h1 className="eyebrow">Student Area</h1>
      </div>

      <div className="user-topbar-actions">
        <div className="user-date-pill">
          <span className="material-symbols-rounded">calendar_month</span>
          <span>{formattedDate}</span>
        </div>

        <Link
          className="user-notification-button"
          to="/notifications"
          aria-label="Notifications"
        >
          <span className="material-symbols-rounded">notifications</span>
          <span className="notification-dot">3</span>
        </Link>

        <div className="user-profile-menu">
          <button
            type="button"
            className="user-profile-trigger"
            onClick={() => setProfileOpen((current) => !current)}
          >
            <span className="user-profile-avatar">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt="Profile"
                  className="user-profile-avatar-img"
                />
              ) : (
                getInitials(user?.fullName || "Student")
              )}
            </span>

            <span className="user-profile-text">
              <strong>{user?.fullName || "Student"}</strong>
              <small>{user?.email || "student@college.ca"}</small>
            </span>

            <span className="material-symbols-rounded user-profile-arrow">
              expand_more
            </span>
          </button>

          {profileOpen && (
            <div className="user-profile-dropdown">
              <div className="user-dropdown-header">
                <strong>{user?.fullName || "Student"}</strong>
                <span>{user?.email || "student@college.ca"}</span>
              </div>

              <div className="user-dropdown-divider" />

              <Link
                to="/profile"
                className="user-dropdown-link"
                onClick={() => setProfileOpen(false)}
              >
                <span className="material-symbols-rounded">person</span>
                Profile
              </Link>

              <Link
                to="/notifications"
                className="user-dropdown-link"
                onClick={() => setProfileOpen(false)}
              >
                <span className="material-symbols-rounded">notifications</span>
                Notifications
              </Link>

              <div className="user-dropdown-divider" />

              <button
                type="button"
                className="beautiful-logout-button"
                onClick={handleLogout}
              >
                <span className="material-symbols-rounded">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
