import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

export function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSentMessage("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);

      setSentMessage(
        `A password reset email has been sent to ${email}. Please check your inbox.`
      );

      alert(
        `A password reset email has been sent to ${email}.\n\nFor mock demo, use this reset link:\n${response.resetLink}`
      );

      setTimeout(() => {
        navigate(`/reset-password?token=${response.token}`);
      }, 1200);
    } catch (err) {
      setError(err.message || "Unable to send reset email.");
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

        <h1>Reset your password</h1>

        <p>
          Enter your account email and we will send instructions to reset your
          UniLife password securely.
        </p>
      </section>

      <section className="auth-card">
        <h2>Forgot Password</h2>
        <p>Use your registered email to receive a password reset link.</p>

        {error && <div className="form-error">{error}</div>}
        {sentMessage && <div className="success-box">{sentMessage}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="student@college.ca"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button className="btn btn-primary btn-md" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}