import React from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { BrunoWidget } from "./BrunoWidget";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-body">
        <Sidebar />

        <div className="user-main-shell">
          <TopNav />

          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>

      <BrunoWidget />
      <BottomNav />
    </div>
  );
}
