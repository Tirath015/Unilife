import React from "react";
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', icon: 'dashboard', label: 'Home' },
  { to: '/marketplace', icon: 'storefront', label: 'Market' },
  { to: '/wishlist', icon: 'favorite', label: 'Saved' },
  { to: '/notifications', icon: 'notifications', label: 'Alerts' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to}>
          <span className="material-symbols-rounded">{item.icon}</span>
          <small>{item.label}</small>
        </NavLink>
      ))}
    </nav>
  );
}

