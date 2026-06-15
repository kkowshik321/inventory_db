import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthAPI from "../api/authApi";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {

    e.preventDefault();
    setErrorMessage("");

    try {

      await AuthAPI.post(
        "/register",
        {
          ...formData,
          roleId: 1,
        }
      );

      alert("Registration successful. You can now log in.");
      navigate("/");

    } catch (error) {

      setErrorMessage(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="hero-card">
          <span className="hero-badge">Join Inventory Pro</span>
          <h1 className="hero-title">Create your account</h1>
          <p className="hero-copy">Get started with a modern dashboard experience built for tracking, approvals, and day-to-day operations.</p>
          <div className="hero-features">
            <div className="feature-pill">Fast onboarding</div>
            <div className="feature-pill">Team-ready</div>
            <div className="feature-pill">Secure auth</div>
          </div>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Create account</p>
          <h1>Get Started</h1>
          <p className="auth-note">
            Create your account and start managing your inventory.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <label className="auth-field">
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </label>

          {errorMessage && (
            <p className="auth-error">{errorMessage}</p>
          )}

          <button type="submit" className="auth-submit wide-button">
            Register
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;