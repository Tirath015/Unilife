import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/layout/Logo";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({
        email: form.email,
        password: form.password,
      });

      if (response.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Logo />
        <h1>Secure student access</h1>
        <p>
          Log in with your campus email to access Marketplace, notifications,
          campus resources, and other modules.
        </p>
      </section>

      <section className="auth-card">
        <h2>Welcome back</h2>
        <p>Use your campus account to continue.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="student@college.ca"
              required
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Enter your password"
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

          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <Button disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </Button>
        </form>

        <p className="auth-switch">
          New to UniLife? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
