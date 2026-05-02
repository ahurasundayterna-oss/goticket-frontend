import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/globals.css";
import "../styles/Sidebar.css";

function getRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch { return null; }
}

const NAV_BRANCH_ADMIN = [
  {
    label: "Operations",
    items: [
      {
        name: "Dashboard", path: "/dashboard",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="6" height="6" rx="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5"/>
        </svg>,
      },
      {
        name: "Trips", path: "/trips",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="14" height="11" rx="2"/>
          <path d="M5 3V1M11 3V1M1 7h14"/>
        </svg>,
      },
      {
        name: "Bookings", path: "/bookings",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 2H5a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z"/>
          <path d="M5.5 7h5M5.5 10h3"/>
        </svg>,
      },
      {
        name: "Payments", path: "/payments",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="4" width="14" height="10" rx="1.5"/>
          <path d="M1 7h14"/>
          <path d="M4 11h2M9 11h3"/>
        </svg>,
      },
      {
        name: "Reports", path: "/reports",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="1" width="12" height="14" rx="1.5"/>
          <path d="M5 5h6M5 8h6M5 11h4"/>
        </svg>,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Routes", path: "/routes-mgmt",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="3" cy="13" r="2"/>
          <circle cx="13" cy="3" r="2"/>
          <path d="M4.5 11.5C6 10 10 6 11.5 4.5"/>
        </svg>,
      },
      {
        name: "Staff", path: "/staff",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="5" r="3"/>
          <path d="M1 14c0-2.8 2.2-5 5-5"/>
          <path d="M11 10l1.5 1.5L15 9"/>
        </svg>,
      },
      {
        name: "Settings", path: "/settings",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="2"/>
          <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/>
        </svg>,
      },
    ],
  },
];

const NAV_STAFF = [
  {
    label: "My Work",
    items: [
      {
        name: "Trips", path: "/trips",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="14" height="11" rx="2"/>
          <path d="M5 3V1M11 3V1M1 7h14"/>
        </svg>,
      },
      {
        name: "Bookings", path: "/bookings",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 2H5a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z"/>
          <path d="M5.5 7h5M5.5 10h3"/>
        </svg>,
      },
      {
        name: "Reports", path: "/reports",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="1" width="12" height="14" rx="1.5"/>
          <path d="M5 5h6M5 8h6M5 11h4"/>
        </svg>,
      },
    ],
  },
];

function getBottomNavItems(nav) {
  return nav.flatMap(s => s.items).slice(0, 4);
}

export default function Sidebar() {
  const location = useLocation();
  const role     = getRole();
  const isAdmin  = role === "BRANCH_ADMIN";
  const NAV      = isAdmin ? NAV_BRANCH_ADMIN : NAV_STAFF;
  const bottomItems = getBottomNavItems(NAV);

  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <aside className={`sidebar ${expanded ? "sidebar--expanded" : "sidebar--collapsed"}`}>

        <button
          className="sidebar-toggle"
          onClick={() => setExpanded(prev => !prev)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            {expanded
              ? <path d="M10 3L6 8l4 5"/>
              : <path d="M6 3l4 5-4 5"/>
            }
          </svg>
        </button>

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">GT</div>
          {expanded && (
            <div>
              <span className="sidebar-logo-name">GoTicket</span>
              {role && (
                <div className="sidebar-role-badge">
                  {isAdmin ? "Branch Admin" : "Staff"}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="sidebar-menu">
          {NAV.map(section => (
            <React.Fragment key={section.label}>
              {expanded && <div className="sidebar-section">{section.label}</div>}
              {section.items.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                  title={!expanded ? item.name : undefined}
                >
                  <span className="sidebar-link-bar" />
                  <span className="sidebar-icon">{item.icon}</span>
                  {expanded && <span className="sidebar-link-label">{item.name}</span>}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title={!expanded ? "Logout" : undefined}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
            </svg>
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ──────────────────────────────────── */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {bottomItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`mobile-tab ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="mobile-tab-icon">{item.icon}</span>
              <span className="mobile-tab-label">{item.name}</span>
            </Link>
          ))}
          <button className="mobile-tab" onClick={handleLogout}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
            </svg>
            <span className="mobile-tab-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}