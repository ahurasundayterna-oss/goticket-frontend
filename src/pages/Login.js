import React, { useState } from "react";
import axios from "axios";
import "../styles/globals.css";
import "../styles/Login.css";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });

      if (!res.data || !res.data.token) {
        setError("Invalid email or password");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);

      // Role-based redirect
      if (res.data.role === "SUPER_ADMIN") {
        window.location.href = "/sa/dashboard";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid" />

      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-icon">GT</div>
          <div>
            <div className="login-logo-name">GoTicket</div>
            <div className="login-logo-sub">Nigeria's Digital Transport Platform</div>
          </div>
        </div>

        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to your dashboard</p>

        {error && (
          <div className="login-error">⚠ {error}</div>
        )}

        <form onSubmit={login}>
          <div className="form-group">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@park.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}