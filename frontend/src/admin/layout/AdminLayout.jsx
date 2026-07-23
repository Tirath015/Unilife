import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  function getInitials(name) {
    return (
      name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AD"
    );
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main-shell">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">Admin Area</span>
            <h1>UniLife Control Center</h1>
          </div>

          <div className="admin-profile-menu">
            <button
              type="button"
              className="admin-profile-trigger"
              onClick={() => setProfileOpen((current) => !current)}
            >
              <div className="admin-avatar">
                {getInitials(user?.fullName || "Admin User")}
              </div>

              <div className="admin-profile-text">
                <strong>{user?.fullName || "Admin User"}</strong>
                <span>{user?.email || "admin@college.ca"}</span>
              </div>

              <span className="material-symbols-rounded admin-profile-arrow">
                expand_more
              </span>
            </button>

            {profileOpen && (
              <div className="admin-profile-dropdown">
                <div className="admin-dropdown-user">
                  <strong>{user?.fullName || "Admin User"}</strong>
                  <span>{user?.email || "admin@college.ca"}</span>
                </div>

                <div className="admin-dropdown-divider" />

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
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
