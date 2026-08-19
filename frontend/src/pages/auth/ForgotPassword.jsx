import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Logo } from "../../components/layout/Logo";
import { authService } from "../../services/authService";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSentMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(
        normalizedEmail
      );

      setSentMessage(
        response?.message ||
          "If the email exists, a reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to send the password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Logo />

        <h1>Reset your password</h1>

        <p>
          Enter the email connected to your UniLife account. We will
          send you a password reset link if the account exists.
        </p>
      </section>

      <section className="auth-card">
        <h2>Forgot Password</h2>

        <p>
          Use your registered email address to receive a password
          reset link.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {sentMessage && (
          <div className="success-box" role="status">
            {sentMessage}
          </div>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email Address

            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
          </label>

          <button
            className="btn btn-primary btn-md"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}