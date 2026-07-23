import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { adminLocalService } from "../services/adminLocalService";

export function AdminReports() {
  const [reports, setReports] = useState([]);

  function loadReports() {
    adminLocalService.getReports().then(setReports);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function markReviewed(id) {
    await adminLocalService.updateReport(id, { status: "Reviewed" });
    loadReports();
  }

  async function deleteReport(id) {
    const ok = window.confirm("Delete this report?");
    if (!ok) return;

    await adminLocalService.deleteReport(id);
    loadReports();
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Reported Content</h2>
          <p>Review reports submitted by students.</p>
        </div>
      </div>

      <section className="admin-report-grid">
        {reports.map((report) => (
          <Card className="admin-report-card" key={report.id}>
            <div>
              <div className="admin-report-top">
                <span
                  className={`admin-status ${
                    report.status === "Pending" ? "blocked" : "active"
                  }`}
                >
                  {report.status}
                </span>

                <small>{report.createdAt}</small>
              </div>

              <h3>{report.title}</h3>

              <p>{report.reason}</p>

              <small>
                Reported by <strong>{report.reportedBy}</strong>
              </small>
            </div>

            <div className="admin-card-actions">
              <button onClick={() => markReviewed(report.id)}>
                Mark Reviewed
              </button>

              <button
                className="danger-button"
                onClick={() => deleteReport(report.id)}
              >
                Delete Report
              </button>
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
