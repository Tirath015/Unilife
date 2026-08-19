import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
const reportReasons = [
  {
    value: 1,
    label: "Spam",
  },
  {
    value: 2,
    label: "Scam or fraud",
  },
  {
    value: 3,
    label: "Fake listing",
  },
  {
    value: 4,
    label: "Inappropriate content",
  },
  {
    value: 5,
    label: "Harassment",
  },
  {
    value: 6,
    label: "Duplicate listing",
  },
  {
    value: 7,
    label: "Other",
  },
];

export function ReportModal({
  isOpen,
  reportType,
  targetName,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setDescription("");
    }
  }, [isOpen, reportType]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!reason) {
      return;
    }

    onSubmit({
      reason: Number(reason),
      description: description.trim() || null,
    });
  }

  const title =
    reportType === "user"
      ? "Report Seller"
      : "Report Listing";

  return (
    <div
      className="report-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div className="report-modal-header">
          <div>
            <span className="report-modal-eyebrow">
              Marketplace Safety
            </span>

            <h2 id="report-modal-title">
              {title}
            </h2>

            <p>
              Tell us why you are reporting{" "}
              <strong>{targetName}</strong>.
            </p>
          </div>

          <button
            type="button"
            className="report-modal-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close report form"
          >
            <span className="material-symbols-rounded">
              close
            </span>
          </button>
        </div>

        <form
          className="report-modal-form"
          onSubmit={handleSubmit}
        >
          <label className="report-modal-field">
            <span>Reason</span>

            <select
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              disabled={submitting}
              required
            >
              <option value="">
                Select a reason
              </option>

              {reportReasons.map((reportReason) => (
                <option
                  key={reportReason.value}
                  value={reportReason.value}
                >
                  {reportReason.label}
                </option>
              ))}
            </select>
          </label>

          <label className="report-modal-field">
            <span>
              Additional details
              <small> Optional</small>
            </span>

            <textarea
              rows="5"
              maxLength="500"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Provide any information that may help the admin review this report."
              disabled={submitting}
            />

            <small className="report-character-count">
              {description.length}/500
            </small>
          </label>

          {error && (
            <div className="report-modal-error">
              <span className="material-symbols-rounded">
                error
              </span>

              {error}
            </div>
          )}

          <div className="report-modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting || !reason}
            >
              <span className="material-symbols-rounded">
                flag
              </span>

              {submitting
                ? "Submitting..."
                : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}