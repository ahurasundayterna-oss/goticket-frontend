import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/sa-globals.css";
import "../styles/SA-Sidebar.css";

const SA_NAV = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard", path: "/sa/dashboard",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="6" height="6" rx="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5"/>
        </svg>,
      },
      {
        name: "Parks", path: "/sa/parks",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 14V7l6-5 6 5v7"/>
          <rect x="5" y="9" width="3" height="5" rx="0.5"/>
          <rect x="8" y="9" width="3" height="5" rx="0.5"/>
        </svg>,
      },
      {
        name: "Admins", path: "/sa/admins",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="5" r="3"/>
          <path d="M1 14c0-2.8 2.2-5 5-5"/>
          <path d="M11 10l1.5 1.5L15 9"/>
        </svg>,
      },
      {
        name: "Analytics", path: "/sa/analytics",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 12l3-4 3 2 3-5 3 3"/>
          <path d="M2 14h12"/>
        </svg>,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Settings", path: "/sa/settings",
        icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="2"/>
          <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/>
        </svg>,
      },
    ],
  },
];

export default function SASidebar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <aside className="sa-sidebar">
      {/* Logo */}
      <div className="sa-sidebar-logo">
        <div className="sa-sidebar-logo-icon">GT</div>
        <div>
          <div className="sa-sidebar-logo-name">GoTicket</div>
          <span className="sa-sidebar-logo-badge">Super Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sa-sidebar-menu">
        {SA_NAV.map((section) => (
          <React.Fragment key={section.label}>
            <div className="sa-sidebar-section">{section.label}</div>
            {section.items.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`sa-sidebar-link ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="sa-sidebar-bar" />
                <span className="sa-sidebar-icon">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* Logout */}
      <div className="sa-sidebar-footer">
        <button className="sa-sidebar-logout" onClick={handleLogout}>
          <svg className="sa-sidebar-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
