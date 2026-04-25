import React from "react";
import "../styles/SuspendedScreen.css";

const LEVEL_CONTEXT = {
  USER: {
    who:     "Your account",
    contact: "your branch admin",
  },
  BRANCH: {
    who:     "Your branch",
    contact: "your park administrator",
  },
  PARK: {
    who:     "Your park",
    contact: "GoTicket support",
  },
  PARK_DELETED: {
    who:     "This park",
    contact: "GoTicket support",
  },
};

export default function SuspendedScreen() {
  const reason = localStorage.getItem("suspensionReason") || "Account suspended. Contact admin.";
  const level  = localStorage.getItem("suspensionLevel")  || "USER";

  const ctx = LEVEL_CONTEXT[level] || LEVEL_CONTEXT.USER;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("suspensionReason");
    localStorage.removeItem("suspensionLevel");
    window.location.href = "/login";
  };

  return (
    <div className="suspended-screen">
      <div className="suspended-card">

        {/* Icon */}
        <div className="suspended-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M15 15L33 33M33 15L15 33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="suspended-title">Access Suspended</h1>

        {/* Reason from backend */}
        <p className="suspended-reason">{reason}</p>

        {/* Contextual contact hint */}
        <p className="suspended-hint">
          To resolve this, please contact {ctx.contact}.
        </p>

        {/* Divider */}
        <div className="suspended-divider" />

        {/* Support line */}
        <p className="suspended-support">
          GoTicket Support &nbsp;·&nbsp; support@goticket.ng
        </p>

        {/* Logout */}
        <button className="suspended-logout" onClick={handleLogout}>
          Sign out
        </button>

      </div>
    </div>
  );
}