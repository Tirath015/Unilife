import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import { getPasswordErrors } from "../../utils/validators";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    const passwordErrors = getPasswordErrors(form.newPassword);

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        newPassword: form.newPassword,
      });

      setSuccess("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
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

        <h1>Create new password</h1>

        <p>
          Choose a secure password for your UniLife account. After updating it,
          you can log in using your new password.
        </p>
      </section>

      <section className="auth-card">
        <h2>Reset Password</h2>
        <p>Enter and confirm your new password.</p>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            New Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
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
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-rounded">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <label>
            Confirm New Password
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
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
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                <span className="material-symbols-rounded">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <button className="btn btn-primary btn-md" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="auth-switch">
          Back to <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}