import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../styles/globals.css";
import "../styles/Header.css";

const PAGE_LABELS = {
  "/dashboard":   "Dashboard",
  "/trips":       "Trips",
  "/bookings":    "Bookings",
  "/routes":      "Routes",
  "/settings":    "Settings",
  "/super-admin": "Super Admin",
};

// Decode JWT without a library — we only need the payload display fields
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

export default function Header() {
  const location = useLocation();
  const pageTitle = PAGE_LABELS[location.pathname] || "GoTicket";

  const { parkName, branchName, initials } = useMemo(() => {
    const token = localStorage.getItem("token") || "";
    const decoded = decodeToken(token);

    const park   = decoded.parkName   || "GoTicket";
    const branch = decoded.branchName || "Branch";

    // Build initials from park name
    const words = park.split(" ").filter(Boolean);
    const init  = words.length >= 2
      ? words[0][0] + words[1][0]
      : park.slice(0, 2);

    return { parkName: park, branchName: branch, initials: init.toUpperCase() };
  }, []);

  return (
    <header className="header">

      <button className="menu-btn" onClick={onMenuClick}>☰</button>
      
      <span className="header-breadcrumb">GoTicket</span>
      <span className="header-sep">/</span>
      <span className="header-page">{pageTitle}</span>

      <div className="header-right">
        <div className="header-dot" title="System online" />

        <div className="header-park-info">
          <div className="header-park-name">{parkName}</div>
          <div className="header-branch-name">{branchName}</div>
        </div>

        <div className="header-avatar">{initials}</div>
      </div>
    </header>
  );
}
