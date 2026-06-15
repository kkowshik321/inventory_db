import { useState, useContext } from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";

import AuthAPI from "../api/authApi";

import {
  AuthContext
} from "../context/AuthContext";

function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();
    setErrorMessage("");

    try {

      const response = await AuthAPI.post(
        "/login",
        {
          email,
          password,
        }
      );

      login(response.data);

      const roleId =
        response.data.role?.id ||
        response.data.roleId ||
        1;

      if (roleId === 2) {
        navigate("/admin");
      } else {
        navigate("/user");
      }

    } catch (error) {

      setErrorMessage(
        error?.response?.data?.message ||
          "Invalid credentials or user not found."
      );
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="hero-card">
          <span className="hero-badge">Inventory Management</span>
          <h1 className="hero-title">Secure inventory workflows for teams</h1>
          <p className="hero-copy">Login to review submissions, manage stock levels, and keep your operations in sync with modern enterprise processes.</p>
          <div className="hero-features">
            <div className="feature-pill">Approval workflows</div>
            <div className="feature-pill">Glassmorphism UI</div>
            <div className="feature-pill">Live inventory insights</div>
          </div>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Enterprise Login</p>
          <h1>Welcome Back</h1>
          <p className="auth-note">
            Sign in with your email address to access your dashboard.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@inventory.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {errorMessage && (
            <p className="auth-error">{errorMessage}</p>
          )}

          <button type="submit" className="auth-submit wide-button">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New here?{' '}
            <Link to="/register" className="auth-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;