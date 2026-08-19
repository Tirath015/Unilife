import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Logo } from "../../components/layout/Logo";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { getPasswordErrors } from "../../utils/validators";

export function Signup() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phoneNumber = form.phoneNumber.trim();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const passwordErrors = getPasswordErrors(form.password);

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        fullName,
        email,
        password: form.password,
        phoneNumber: phoneNumber || null,
      });

      setSuccessMessage(
        response?.message ||
          "Registration successful. Please check your email and verify your account before logging in."
      );

      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err?.message ||
          "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Logo />

        <h1>Create your UniLife account</h1>

        <p>
          Register using your name, email address, phone number, and
          password. You must verify your email before logging in.
        </p>
      </section>

      <section className="auth-card">
        <h2>Create account</h2>

        <p>Enter your details to register.</p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-box" role="status">
            <p>{successMessage}</p>

            <p>
              After verifying your email,{" "}
              <Link to="/login">continue to login</Link>.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="form-grid two-col-form"
        >
          <label className="span-2">
            Full Name

            <input
              type="text"
              value={form.fullName}
              onChange={(event) =>
                updateForm("fullName", event.target.value)
              }
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={loading}
              required
            />
          </label>

          <label className="span-2">
            Email Address

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateForm("email", event.target.value)
              }
              placeholder="student@example.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </label>

          <label className="span-2">
            Phone Number

            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(event) =>
                updateForm("phoneNumber", event.target.value)
              }
              placeholder="Optional phone number"
              autoComplete="tel"
              disabled={loading}
            />
          </label>

          <label>
            Password

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  updateForm("password", event.target.value)
                }
                placeholder="Create password"
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
            Confirm Password

            <div className="password-field">
              <input
                type={
                  showConfirmPassword ? "text" : "password"
                }
                value={form.confirmPassword}
                onChange={(event) =>
                  updateForm(
                    "confirmPassword",
                    event.target.value
                  )
                }
                placeholder="Retype password"
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
                    ? "Hide confirm password"
                    : "Show confirm password"
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

          <Button
            type="submit"
            disabled={loading}
            className="span-2"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}