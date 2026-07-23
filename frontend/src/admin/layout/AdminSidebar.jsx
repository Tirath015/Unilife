import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  {
    to: "/admin",
    icon: "dashboard",
    label: "Overview",
    end: true,
  },
  {
    to: "/admin/users",
    icon: "group",
    label: "Users",
  },
  {
    to: "/admin/listings",
    icon: "storefront",
    label: "Marketplace Listings",
  },
  {
    to: "/admin/reports",
    icon: "flag",
    label: "Reports",
  },
  {
    to: "/admin/prototypes",
    icon: "construction",
    label: "Future Modules",
  },
];

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <span className="material-symbols-rounded">admin_panel_settings</span>
        </div>

        <div>
          <strong>UniLife</strong>
          <span>Admin</span>
        </div>
      </div>

      <nav className="admin-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            <span className="material-symbols-rounded">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
