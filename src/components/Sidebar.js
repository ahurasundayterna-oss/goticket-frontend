import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/globals.css";
import "../styles/Sidebar.css";

// Decode role from JWT
function getRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return null;
  }
}

// Nav config per role
const NAV_BRANCH_ADMIN = [
  {
    label: "Operations",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="6" height="6" rx="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" />
          </svg>
        ),
      },
      {
        name: "Trips",
        path: "/trips",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="11" rx="2" />
            <path d="M5 3V1M11 3V1M1 7h14" />
          </svg>
        ),
      },
      {
        name: "Bookings",
        path: "/bookings",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 2H5a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z" />
            <path d="M5.5 7h5M5.5 10h3" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Routes",
        path: "/routes-mgmt",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="3" cy="13" r="2" />
            <circle cx="13" cy="3" r="2" />
            <path d="M4.5 11.5C6 10 10 6 11.5 4.5" />
          </svg>
        ),
      },
      {
        name: "Staff",
        path: "/staff",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="5" r="3" />
            <path d="M1 14c0-2.8 2.2-5 5-5" />
            <path d="M11 10l1.5 1.5L15 9" />
          </svg>
        ),
      },
      {
        name: "Settings",
        path: "/settings",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="2" />
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
          </svg>
        ),
      },
    ],
  },
];

const NAV_STAFF = [
  {
    label: "My Work",
    items: [
      {
        name: "Trips",
        path: "/trips",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="11" rx="2" />
            <path d="M5 3V1M11 3V1M1 7h14" />
          </svg>
        ),
      },
      {
        name: "Bookings",
        path: "/bookings",
        icon: (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 2H5a2 2 0 00-2 2v9a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z" />
            <path d="M5.5 7h5M5.5 10h3" />
          </svg>
        ),
      },
    ],
  },
];

// Flatten nav items for mobile
function getBottomNavItems(nav) {
  return nav.flatMap(section => section.items).slice(0, 4);
}

export default function Sidebar() {
  const location = useLocation();
  const role = getRole();
  const isAdmin = role === "BRANCH_ADMIN";
  const NAV = isAdmin ? NAV_BRANCH_ADMIN : NAV_STAFF;
  const bottomItems = getBottomNavItems(NAV);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">GT</div>
          <div>
            <span className="sidebar-logo-name">GoTicket</span>
            {role && (
              <div className="sidebar-role-badge">
                {isAdmin ? "Branch Admin" : "Staff"}
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-menu">
          {NAV.map((section) => (
            <React.Fragment key={section.label}>
              <div className="sidebar-section">{section.label}</div>
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
                >
                  <span className="sidebar-link-bar" />
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">

          {bottomItems.map((item) => (
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
            <span className="mobile-tab-label">Logout</span>
          </button>

        </div>
      </nav>
    </>
  );
}