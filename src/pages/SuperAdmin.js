import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "../styles/Trips.css";
import "../styles/SuperAdmin.css";

export default function SuperAdmin() {
  const [parks,    setParks]    = useState([]);
  const [branches, setBranches] = useState([]);

  const [parkName,   setParkName]   = useState("");
  const [branchName, setBranchName] = useState("");

  const [selectedPark,   setSelectedPark]   = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [adminName,     setAdminName]     = useState("");
  const [adminEmail,    setAdminEmail]    = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // unchanged logic
  const fetchParks = async () => {
    try { const res = await API.get("/parks"); setParks(res.data); }
    catch (e) { console.log(e); }
  };

  const fetchBranches = async (parkId) => {
    if (!parkId) return;
    try { const res = await API.get(`/branches/${parkId}`); setBranches(res.data); }
    catch (e) { console.log(e); }
  };

  useEffect(() => { fetchParks(); }, []);

  const createPark = async () => {
    if (!parkName.trim()) return alert("Enter a park name");
    await API.post("/parks", { name: parkName });
    setParkName(""); fetchParks();
  };

  const createBranch = async () => {
    if (!selectedPark) return alert("Select a park first");
    if (!branchName.trim()) return alert("Enter a branch name");
    await API.post("/branches", { name: branchName, parkId: selectedPark });
    setBranchName(""); fetchBranches(selectedPark);
  };

  const createAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post("/users/branch-admin",
        { name: adminName, email: adminEmail, password: adminPassword, branchId: selectedBranch },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminName(""); setAdminEmail(""); setAdminPassword("");
      alert("Branch admin created successfully.");
    } catch (e) {
      alert(e.response?.data?.error || "Error creating admin");
    }
  };

  return (
    <Layout>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Super Admin</h1>
          <p className="page-sub">Manage parks, branches and administrators</p>
        </div>
      </div>

      <div className="sa-cards animate-in">

        {/* Create Park */}
        <div className="sa-card">
          <div className="sa-card-title">🏢 Create Park</div>
          <div className="form-group">
            <label className="form-label">Park Name</label>
            <input className="form-control" placeholder="e.g. GUO Transport" value={parkName} onChange={(e) => setParkName(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width:"100%" }} onClick={createPark}>Create Park</button>
        </div>

        {/* Create Branch */}
        <div className="sa-card">
          <div className="sa-card-title">📍 Create Branch</div>
          <div className="form-group">
            <label className="form-label">Select Park</label>
            <select className="form-control" value={selectedPark} onChange={(e) => { setSelectedPark(e.target.value); fetchBranches(e.target.value); }}>
              <option value="">Choose park...</option>
              {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Branch Name</label>
            <input className="form-control" placeholder="e.g. Lagos Island Terminal" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width:"100%" }} onClick={createBranch}>Create Branch</button>
        </div>

        {/* Create Admin */}
        <div className="sa-card">
          <div className="sa-card-title">👤 Create Branch Admin</div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <select className="form-control" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">Choose branch...</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" placeholder="Admin full name" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="admin@park.ng" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Secure password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width:"100%" }} onClick={createAdmin}>Create Admin</button>
        </div>

      </div>

      {/* Parks Table */}
      <div className="sa-section">
        <div className="section-head">
          <div className="section-title">Parks</div>
          <span className="pill pill-green">{parks.length} total</span>
        </div>
        <table className="gtable">
          <thead><tr><th>#</th><th>Park Name</th></tr></thead>
          <tbody>
            {parks.length === 0
              ? <tr><td colSpan="2"><div className="empty-state"><span className="empty-state-icon">🏢</span>No parks yet.</div></td></tr>
              : parks.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color:"var(--text-tertiary)", fontFamily:"var(--mono)", width:48 }}>{String(i+1).padStart(2,"0")}</td>
                    <td style={{ fontWeight:600 }}>{p.name}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Branches Table */}
      <div className="sa-section">
        <div className="section-head">
          <div className="section-title">Branches</div>
          <span className="pill pill-blue">{branches.length} loaded</span>
        </div>
        <table className="gtable">
          <thead><tr><th>#</th><th>Branch Name</th></tr></thead>
          <tbody>
            {branches.length === 0
              ? <tr><td colSpan="2"><div className="empty-state"><span className="empty-state-icon">📍</span>Select a park above to load its branches.</div></td></tr>
              : branches.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color:"var(--text-tertiary)", fontFamily:"var(--mono)", width:48 }}>{String(i+1).padStart(2,"0")}</td>
                    <td style={{ fontWeight:600 }}>{b.name}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
