import React, { useState } from "react";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "../styles/Trips.css";
import "../styles/Settings.css";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Park profile and system preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? "✓ Saved" : "Save changes"}
        </button>
      </div>

      <div className="settings-grid animate-in">
        {/* Park Profile */}
        <div className="settings-section">
          <div className="settings-section-title">Park Profile</div>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div className="form-group">
              <label className="form-label">Park name</label>
              <input className="form-control" type="text" defaultValue="GoTicket Transport" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" defaultValue="ops@goticket.ng" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" type="tel" defaultValue="+234 803 123 4567" />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Park address</label>
              <input className="form-control" type="text" defaultValue="33 Ojuelegba Rd, Lagos Island" />
            </div>
          </div>
        </div>

        {/* Booking Config */}
        <div className="settings-section">
          <div className="settings-section-title">Booking Configuration</div>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div className="form-group">
              <label className="form-label">Default seat capacity</label>
              <input className="form-control" type="number" defaultValue="18" />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp number (bot)</label>
              <input className="form-control" type="tel" defaultValue="+234 900 000 0001" />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Departure times available</label>
              <input className="form-control" type="text" defaultValue="06:00, 08:00, 12:00" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section" style={{ gridColumn:"1/-1" }}>
          <div className="settings-section-title" style={{ color:"var(--red)" }}>Danger Zone</div>
          <div className="card" style={{ padding:"22px 24px", border:"1px solid var(--red-light)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontWeight:600, marginBottom:3 }}>Change Password</div>
                <div style={{ fontSize:13, color:"var(--text-secondary)" }}>Update your admin account password</div>
              </div>
              <button className="btn btn-ghost">Change password</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
