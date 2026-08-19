import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import adminLocalService from "../services/adminLocalService";
function getStatusText(status) {
  switch (Number(status)) {
    case 2:
      return "Reviewed";

    case 3:
      return "Resolved";

    case 4:
      return "Dismissed";

    default:
      return "Pending";
  }
}

function getReportTypeText(reportType) {
  return Number(reportType) === 2
    ? "User Report"
    : "Listing Report";
}

function getReasonText(reason) {
  switch (Number(reason)) {
    case 1:
      return "Spam";

    case 2:
      return "Scam";

    case 3:
      return "Fake Listing";

    case 4:
      return "Inappropriate Content";

    case 5:
      return "Harassment";

    case 6:
      return "Duplicate Listing";

    case 7:
      return "Other";

    default:
      return "Unknown";
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  return new Date(dateValue).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response =
        await adminReportService.getReports();

      const reportList = Array.isArray(response)
        ? response
        : response?.data ||
          response?.reports ||
          response?.items ||
          [];

      setReports(reportList);
    } catch (loadError) {
      console.error(
        "Could not load admin reports:",
        loadError
      );

      setError(
        loadError?.message ||
          "The reports could not be loaded."
      );

      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateReportStatus(
    reportId,
    newStatus
  ) {
    try {
      setUpdatingId(reportId);
      setError("");

      await adminReportService.updateStatus(
        reportId,
        newStatus
      );

      setReports((currentReports) =>
        currentReports.map((report) => {
          const currentReportId =
            report.reportId ?? report.id;

          return currentReportId === reportId
            ? {
                ...report,
                status: newStatus,
              }
            : report;
        })
      );
    } catch (updateError) {
      console.error(
        "Could not update report:",
        updateError
      );

      setError(
        updateError?.message ||
          "The report status could not be updated."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <section className="admin-report-loading">
        <p>Loading reports...</p>
      </section>
    );
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Admin</span>

          <h2>Reported Content</h2>

          <p>
            Review listing and user reports submitted by
            students.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadReports}
        >
          <span className="material-symbols-rounded">
            refresh
          </span>

          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-report-error">
          <span className="material-symbols-rounded">
            error
          </span>

          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <Card className="admin-reports-empty">
          <span className="material-symbols-rounded">
            verified_user
          </span>

          <h3>No reports found</h3>

          <p>
            Submitted listing and user reports will appear
            here.
          </p>
        </Card>
      ) : (
        <section className="admin-report-grid">
          {reports.map((report) => {
            const reportId =
              report.reportId ?? report.id;

            const statusText = getStatusText(
              report.status
            );

            const reportTypeText =
              getReportTypeText(report.reportType);

            const reasonText = getReasonText(
              report.reason
            );

            const isUpdating =
              updatingId === reportId;

            const targetTitle =
              report.listing?.title ||
              report.reportedUser?.fullName ||
              "Reported content";

            return (
              <Card
                className="admin-report-card"
                key={reportId}
              >
                <div className="admin-report-content">
                  <div className="admin-report-top">
                    <div className="admin-report-badges">
                      <span
                        className={`admin-status admin-report-status-${statusText.toLowerCase()}`}
                      >
                        {statusText}
                      </span>

                      <span className="admin-report-type">
                        {reportTypeText}
                      </span>
                    </div>

                    <small>
                      {formatDate(report.createdAt)}
                    </small>
                  </div>

                  <h3>{targetTitle}</h3>

                  <div className="admin-report-information">
                    <p>
                      <strong>Reason:</strong>{" "}
                      {reasonText}
                    </p>

                    <p>
                      <strong>Description:</strong>{" "}
                      {report.description ||
                        "No additional description was provided."}
                    </p>
                  </div>

                  <div className="admin-report-users">
                    <small>
                      Reported by{" "}
                      <strong>
                        {report.reporter?.fullName ||
                          "Unknown user"}
                      </strong>
                    </small>

                    {report.reporter?.email && (
                      <small>
                        {report.reporter.email}
                      </small>
                    )}
                  </div>

                  {report.listing && (
                    <div className="admin-report-target">
                      <span className="material-symbols-rounded">
                        inventory_2
                      </span>

                      <div>
                        <strong>
                          Listing #{report.listing.listingId}
                        </strong>

                        <span>
                          Owner ID:{" "}
                          {report.listing.ownerId}
                        </span>
                      </div>
                    </div>
                  )}

                  {report.reportedUser && (
                    <div className="admin-report-target">
                      <span className="material-symbols-rounded">
                        person_alert
                      </span>

                      <div>
                        <strong>
                          {report.reportedUser.fullName}
                        </strong>

                        <span>
                          {report.reportedUser.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="admin-card-actions">
                  {Number(report.status) === 1 && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        updateReportStatus(
                          reportId,
                          2
                        )
                      }
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Mark Reviewed"}
                    </button>
                  )}

                  {Number(report.status) !== 3 && (
                    <button
                      type="button"
                      className="admin-resolve-button"
                      disabled={isUpdating}
                      onClick={() =>
                        updateReportStatus(
                          reportId,
                          3
                        )
                      }
                    >
                      Resolve
                    </button>
                  )}

                  {Number(report.status) !== 4 && (
                    <button
                      type="button"
                      className="danger-button"
                      disabled={isUpdating}
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            "Dismiss this report?"
                          );

                        if (confirmed) {
                          updateReportStatus(
                            reportId,
                            4
                          );
                        }
                      }}
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </>
  );
}