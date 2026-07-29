import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getPasswordErrors } from "../../utils/validators";

export function UpdatePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const passwordErrors = getPasswordErrors(form.newPassword);

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError("New password cannot be the same as current password.");
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess("Password updated successfully. Please log in again.");

      setTimeout(() => {
        authService.logout();
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="logo">
          <span className="logo-mark material-symbols-rounded">school</span>
          UniLife
        </div>

        <h1>Update your password</h1>

        <p>
          Change your UniLife account password securely from your profile.
          After updating, you will be redirected to the login page.
        </p>
      </section>

      <section className="auth-card">
        <h2>Update Password</h2>
        <p>Enter your current password and choose a new password.</p>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Current Password
            <div className="password-field">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={(event) =>
                  setForm({ ...form, currentPassword: event.target.value })
                }
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowCurrent((current) => !current)}
              >
                <span className="material-symbols-rounded">
                  {showCurrent ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <label>
            New Password
            <div className="password-field">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={(event) =>
                  setForm({ ...form, newPassword: event.target.value })
                }
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowNew((current) => !current)}
              >
                <span className="material-symbols-rounded">
                  {showNew ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <label>
            Confirm New Password
            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({ ...form, confirmPassword: event.target.value })
                }
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowConfirm((current) => !current)}
              >
                <span className="material-symbols-rounded">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <button className="btn btn-primary btn-md" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="auth-switch">
          Back to <Link to="/profile">Profile</Link>
        </p>
      </section>
    </main>
  );
}