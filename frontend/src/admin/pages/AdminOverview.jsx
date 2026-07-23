import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { adminLocalService } from "../services/adminLocalService";

export function AdminOverview() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    adminLocalService.getUsers().then(setUsers);
    adminLocalService.getListings().then(setListings);
    adminLocalService.getReports().then(setReports);
  }, []);

  const blockedUsers = users.filter((user) => user.status === "Blocked").length;
  const hiddenListings = listings.filter((listing) => listing.status === "Hidden").length;
  const pendingReports = reports.filter((report) => report.status === "Pending").length;

  return (
    <>
      <section className="admin-hero">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h2>Manage UniLife safely and efficiently.</h2>
          <p>
            Review users, marketplace listings, and reported content. Future
            modules like discussions, events, and resources can be added later.
          </p>
        </div>
      </section>

      <section className="admin-stat-grid">
        <Card>
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </Card>

        <Card>
          <span>Blocked Users</span>
          <strong>{blockedUsers}</strong>
        </Card>

        <Card>
          <span>Total Listings</span>
          <strong>{listings.length}</strong>
        </Card>

        <Card>
          <span>Pending Reports</span>
          <strong>{pendingReports}</strong>
        </Card>
      </section>

      <section className="admin-preview-grid">
        <Card className="admin-preview-card">
          <h3>Marketplace Control</h3>
          <p>
            Admin can review marketplace listings, update listing status, edit
            listing information, and remove inappropriate content.
          </p>
        </Card>

        <Card className="admin-preview-card">
          <h3>User Moderation</h3>
          <p>
            Admin can view students, edit user details, block accounts, unblock
            accounts, and remove users if needed.
          </p>
        </Card>

        <Card className="admin-preview-card">
          <h3>Reported Content</h3>
          <p>
            Admin can review reported listings and mark reports as reviewed or
            remove reports from the system.
          </p>
        </Card>
      </section>
    </>
  );
}
