import React, { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { Logo } from "../../components/layout/Logo";
import { authService } from "../../services/authService";
import { getPasswordErrors } from "../../utils/validators";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";
  const tokenFromUrl = searchParams.get("token") || "";

  const [form, setForm] = useState({
    email: emailFromUrl,
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email = form.email.trim();

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!tokenFromUrl) {
      setError("Invalid or missing reset token.");
      return;
    }

    const passwordErrors = getPasswordErrors(
      form.newPassword
    );

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    if (form.newPassword.length < 6) {
      setError(
        "The new password must contain at least 6 characters."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        token: tokenFromUrl,
        newPassword: form.newPassword,
      });

      setSuccess(
        response?.message ||
          "Password reset successfully. Redirecting to login..."
      );

      setForm((currentForm) => ({
        ...currentForm,
        newPassword: "",
        confirmPassword: "",
      }));

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Logo />

        <h1>Create a new password</h1>

        <p>
          Enter a secure password for your UniLife account.
          After resetting it, you can sign in using the new
          password.
        </p>
      </section>

      <section className="auth-card">
        <h2>Reset Password</h2>

        <p>
          Confirm your account email and enter your new password.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-box" role="status">
            {success}
          </div>
        )}

        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Email Address

            <input
              type="email"
              placeholder="student@example.com"
              value={form.email}
              onChange={(event) =>
                updateForm("email", event.target.value)
              }
              autoComplete="email"
              disabled={loading}
              required
            />
          </label>

          <label>
            New Password

            <div className="password-field">
              <input
                type={
                  showPassword ? "text" : "password"
                }
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={(event) =>
                  updateForm(
                    "newPassword",
                    event.target.value
                  )
                }
                autoComplete="new-password"
                disabled={loading}
                minLength={6}
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() =>
                  setShowPassword(
                    (currentValue) => !currentValue
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                <span className="material-symbols-rounded">
                  {showPassword
                    ? "visibility_off"
                    : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <label>
            Confirm New Password

            <div className="password-field">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateForm(
                    "confirmPassword",
                    event.target.value
                  )
                }
                autoComplete="new-password"
                disabled={loading}
                minLength={6}
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() =>
                  setShowConfirmPassword(
                    (currentValue) => !currentValue
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                <span className="material-symbols-rounded">
                  {showConfirmPassword
                    ? "visibility_off"
                    : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <button
            className="btn btn-primary btn-md"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        <p className="auth-switch">
          Back to <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}