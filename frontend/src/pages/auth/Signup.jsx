import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/layout/Logo";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { getPasswordErrors } from "../../utils/validators";

const collegeCampuses = {
  Sheridan: [
    "Davis Campus",
    "Trafalgar Road Campus",
    "Hazel McCallion Campus",
  ],
  Humber: [
    "North Campus",
    "Lakeshore Campus",
    "International Graduate School",
  ],
  Seneca: [
    "Newnham Campus",
    "King Campus",
    "Seneca@York Campus",
    "Markham Campus",
  ],
  Conestoga: [
    "Doon Campus",
    "Waterloo Campus",
    "Cambridge Campus",
    "Guelph Campus",
    "Brantford Campus",
    "Milton Campus",
  ],
};

export function Signup() {
  const navigate = useNavigate();
  const { verifyEmailSignup } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    college: "",
    campus: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const campuses = useMemo(() => {
    return form.college ? collegeCampuses[form.college] || [] : [];
  }, [form.college]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setVerificationMessage("");

    const passwordErrors = getPasswordErrors(form.password);

    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.college || !form.campus) {
      setError("Please select your college and campus.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        fullName: form.fullName,
        email: form.email,
        college: form.college,
        campus: form.campus,
        program: "Computer Systems Technology",
        password: form.password,
      });

      setVerificationMessage(
        `A verification link has been sent to ${form.email}. Please check your inbox to verify your account.`
      );

      alert(
        `A verification link has been sent to ${form.email}.\n\nFor mock demo, click OK and we will verify it automatically.`
      );

      setTimeout(async () => {
        const verifyResponse = await verifyEmailSignup(response.token);

        if (verifyResponse.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Logo />
        <h1>Create your student account</h1>
        <p>
          Join UniLife using your college email, college name, campus, and secure
          password. Your email must be verified before opening the dashboard.
        </p>
      </section>

      <section className="auth-card">
        <h2>Sign up</h2>
        <p>Join with your college or university details.</p>

        {error && <div className="form-error">{error}</div>}
        {verificationMessage && (
          <div className="success-box">{verificationMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="form-grid two-col-form">
          <label>
            Full Name
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
              placeholder="Student Name"
              required
            />
          </label>

          <label>
            College/University Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="student@college.ca"
              required
            />
          </label>

          <label>
            College
            <select
              value={form.college}
              onChange={(event) =>
                setForm({
                  ...form,
                  college: event.target.value,
                  campus: "",
                })
              }
              required
            >
              <option value="">Select college</option>
              {Object.keys(collegeCampuses).map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </label>

          <label>
            Campus
            <select
              value={form.campus}
              onChange={(event) =>
                setForm({ ...form, campus: event.target.value })
              }
              required
              disabled={!form.college}
            >
              <option value="">
                {form.college ? "Select campus" : "Select college first"}
              </option>

              {campuses.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="Create password"
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
            Confirm Password
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({ ...form, confirmPassword: event.target.value })
                }
                placeholder="Retype password"
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <span className="material-symbols-rounded">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <Button disabled={loading} className="span-2">
            {loading ? "Sending verification..." : "Create Account"}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}