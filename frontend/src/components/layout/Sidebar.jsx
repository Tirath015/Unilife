import React from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";

const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/marketplace", icon: "storefront", label: "Marketplace" },
  { to: "/events", icon: "calendar_month", label: "Campus Events" },
  { to: "/resources", icon: "local_library", label: "Resources" },
  { to: "/discussions", icon: "forum", label: "Discussions" },
  { to: "/jobs", icon: "work", label: "Student Jobs" },
  { to: "/profile", icon: "person", label: "Profile" },
];

export function Sidebar() {
  return (
    <aside className="user-sidebar">
      <div className="user-sidebar-brand">
        <Logo to="/dashboard" />
        <span>Student Workspace</span>
      </div>

      <nav className="user-sidebar-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="user-sidebar-link">
            <span className="material-symbols-rounded">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="user-sidebar-note">
        <strong>UniLife</strong>
        <span>Marketplace, events, resources, jobs, and Bruno AI in one place.</span>
      </div>
    </aside>
  );
}
