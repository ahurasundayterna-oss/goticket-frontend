import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/sa-globals.css";
import "../styles/SA-Header.css";

const PAGE_LABELS = {
  "/sa/dashboard": "Dashboard",
  "/sa/parks":     "Parks",
  "/sa/admins":    "Admins",
  "/sa/analytics": "Analytics",
  "/sa/settings":  "Settings",
};

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return {}; }
}

export default function SAHeader({ onMenuClick }) {
  const location = useLocation();
  const title    = PAGE_LABELS[location.pathname] || "Super Admin";
  const decoded  = decodeToken(localStorage.getItem("token") || "");
  const name     = decoded.name || "Super Admin";
  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sa-header">
      <div className="sa-header-left">
        {/* ✅ MENU BUTTON (mobile) */}
        <button className="sa-menu-btn" onClick={onMenuClick}>
          ☰
        </button>

        <span className="sa-header-crumb">GoTicket</span>
        <span className="sa-header-sep">/</span>
        <span className="sa-header-page">{title}</span>
      </div>

      <div className="sa-header-right">
        <div className="sa-header-dot" title="System online" />

        <div className="sa-header-info">
          <div className="sa-header-name">{name}</div>
          <div className="sa-header-role">Super Administrator</div>
        </div>

        <div className="sa-header-avatar">{initials}</div>
      </div>
    </header>
  );
}