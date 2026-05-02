import React, { useState } from "react";
import { login as saveLogin } from "../auth";
import "../styles/globals.css";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://goticket-api.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ use centralized login
      saveLogin(data.token, data.role);

      // ✅ role-based redirect
      if (data.role === "SUPER_ADMIN") {
        window.location.href = "/sa/dashboard";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid" />

      <div className="login-box"><a href="/" className="login-back">← Back to GoTicket</a>
        <div className="login-logo">
          <div className="login-logo-icon">GT</div>
          <div>
            <div className="login-logo-name">GoTicket</div>
            <div className="login-logo-sub">
              Nigeria's Digital Transport Platform
            </div>
          </div>
        </div>

        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to your dashboard</p>

        {error && <div className="login-error">⚠ {error}</div>}

        <form onSubmit={login}>
          <div className="form-group">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
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