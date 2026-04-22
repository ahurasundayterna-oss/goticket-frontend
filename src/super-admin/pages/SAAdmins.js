import React, { useEffect, useState, useCallback } from "react";
import SALayout from "../components/SALayout";
import API from "../../api/api";
import "../styles/sa-globals.css";
import "../styles/SA-Admins.css";

const AVATAR_COLORS = [
  { bg: "#EEF0FD", fg: "#3a228f" }, { bg: "#E1F5EE", fg: "#085041" },
  { bg: "#E6F1FB", fg: "#0f3d6e" }, { bg: "#FAEEDA", fg: "#7a4f0e" },
  { bg: "#FCEBEB", fg: "#7a1a1a" },
];

/* ── Create Branch Modal ─────────────────────────────────────── */
function CreateBranchModal({ parks, onClose, onCreated }) {
  const [form,   setForm]   = useState({ parkId: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.parkId || !form.name.trim()) return setError("Select a park and enter a branch name.");
    setSaving(true); setError("");
    try {
      await API.post("/super/branches", { name: form.name, parkId: form.parkId });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create branch.");
    } finally { setSaving(false); }
  };

  return (
    <div className="sa-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sa-modal" style={{ maxWidth: 400 }}>
        <div className="sa-modal-header">
          <div className="sa-modal-title">Create Branch</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="sa-form-error">{error}</div>}

        <div className="sa-form-group">
          <label className="sa-form-label">Park *</label>
          <select className="sa-form-control" name="parkId" value={form.parkId} onChange={handle}>
            <option value="">Select park...</option>
            {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="sa-form-group">
          <label className="sa-form-label">Branch Name *</label>
          <input
            className="sa-form-control"
            name="name"
            placeholder="e.g. Makurdi Branch"
            value={form.name}
            onChange={handle}
          />
        </div>

        <div className="sa-modal-footer">
          <button className="sa-btn sa-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="sa-btn sa-btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create Branch Admin Modal ───────────────────────────────── */
function CreateAdminModal({ parks, onClose, onCreated }) {
  const [branches, setBranches] = useState([]);
  const [form,     setForm]     = useState({ parkId: "", branchId: "", name: "", email: "", password: "" });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectPark = async (parkId) => {
    setForm(f => ({ ...f, parkId, branchId: "" }));
    setBranches([]);
    if (!parkId) return;
    try {
      const res = await API.get(`/super/branches/${parkId}`);
      setBranches(res.data);
    } catch { setBranches([]); }
  };

  const submit = async () => {
    if (!form.branchId || !form.name || !form.email || !form.password) {
      return setError("All fields are required.");
    }
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setSaving(true); setError("");
    try {
      await API.post("/super/branch-admin", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        branchId: form.branchId,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin.");
    } finally { setSaving(false); }
  };

  return (
    <div className="sa-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sa-modal">
        <div className="sa-modal-header">
          <div className="sa-modal-title">Create Branch Admin</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="sa-form-error">{error}</div>}

        <p className="sa-modal-section-label">Assign to Branch</p>
        <div className="sa-form-row">
          <div className="sa-form-group">
            <label className="sa-form-label">Park *</label>
            <select
              className="sa-form-control"
              name="parkId"
              value={form.parkId}
              onChange={(e) => selectPark(e.target.value)}
            >
              <option value="">Select park...</option>
              {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sa-form-group">
            <label className="sa-form-label">Branch *</label>
            <select
              className="sa-form-control"
              name="branchId"
              value={form.branchId}
              onChange={handle}
              disabled={!form.parkId || branches.length === 0}
            >
              <option value="">
                {!form.parkId ? "Select park first" : branches.length === 0 ? "No branches yet" : "Select branch..."}
              </option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <p className="sa-modal-section-label" style={{ marginTop: 4 }}>Admin Details</p>
        <div className="sa-form-group">
          <label className="sa-form-label">Full Name *</label>
          <input className="sa-form-control" name="name" placeholder="Admin full name" value={form.name} onChange={handle} />
        </div>
        <div className="sa-form-row">
          <div className="sa-form-group">
            <label className="sa-form-label">Email *</label>
            <input className="sa-form-control" type="email" name="email" placeholder="admin@park.ng" value={form.email} onChange={handle} />
          </div>
          <div className="sa-form-group">
            <label className="sa-form-label">Password *</label>
            <input className="sa-form-control" type="password" name="password" placeholder="Min. 8 chars" value={form.password} onChange={handle} />
          </div>
        </div>

        <div className="sa-modal-footer">
          <button className="sa-btn sa-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="sa-btn sa-btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Admins Page ────────────────────────────────────────── */
export default function SAAdmins() {
  const [admins,       setAdmins]       = useState([]);
  const [parks,        setParks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showBranch,   setShowBranch]   = useState(false);
  const [showAdmin,    setShowAdmin]    = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [adminsRes, parksRes] = await Promise.all([
        API.get("/super/admins"),
        API.get("/super/parks"),
      ]);
      setAdmins(adminsRes.data);
      setParks(parksRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = admins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.branch?.park?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.branch?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SALayout>
      <div className="sa-page-header sa-animate-in">
        <div>
          <h1 className="sa-page-title">Admins</h1>
          <p className="sa-page-sub">Branch administrators across all parks</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sa-btn sa-btn-ghost" onClick={() => setShowBranch(true)}>
            + New Branch
          </button>
          <button className="sa-btn sa-btn-primary" onClick={() => setShowAdmin(true)}>
            + New Admin
          </button>
        </div>
      </div>

      {/* How it works strip */}
      <div className="sa-flow-strip sa-animate-in">
        <div className="sa-flow-step">
          <span className="sa-flow-num">1</span>
          <div>
            <div className="sa-flow-label">Create Park</div>
            <div className="sa-flow-desc">e.g. ABC Motors</div>
          </div>
        </div>
        <div className="sa-flow-arrow">→</div>
        <div className="sa-flow-step">
          <span className="sa-flow-num">2</span>
          <div>
            <div className="sa-flow-label">Add Branch</div>
            <div className="sa-flow-desc">e.g. Makurdi, Abuja</div>
          </div>
        </div>
        <div className="sa-flow-arrow">→</div>
        <div className="sa-flow-step">
          <span className="sa-flow-num">3</span>
          <div>
            <div className="sa-flow-label">Assign Admin</div>
            <div className="sa-flow-desc">One admin per branch</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }} className="sa-animate-in">
        <div className="sa-search-wrap">
          <span className="sa-search-icon">⌕</span>
          <input
            className="sa-form-control sa-search"
            type="text"
            placeholder="Search by name, email, park or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="sa-skel" style={{ height: 300 }} />
      ) : (
        <div className="sa-card sa-animate-in" style={{ overflow: "hidden" }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Admin</th>
                <th>Park</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6">
                  <div className="sa-empty">
                    <span className="sa-empty-icon">👤</span>
                    {search ? "No admins match your search." : "No branch admins yet. Create a branch first, then assign an admin."}
                  </div>
                </td></tr>
              ) : filtered.map((a, i) => {
                const col      = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const initials = a.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <tr key={a.id}>
                    <td style={{ color: "var(--sa-text-tertiary)", fontFamily: "var(--sa-mono)", width: 40 }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td>
                      <div className="sa-admin-row">
                        <div className="sa-admin-avatar" style={{ background: col.bg, color: col.fg }}>
                          {initials}
                        </div>
                        <div>
                          <div className="sa-admin-name">{a.name}</div>
                          <div className="sa-admin-email">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.branch?.park?.name || "—"}</td>
                    <td style={{ color: "var(--sa-text-secondary)" }}>{a.branch?.name || "—"}</td>
                    <td>
                      {a.suspended
                        ? <span className="sa-pill sa-pill-suspended">Suspended</span>
                        : <span className="sa-pill sa-pill-active">Active</span>
                      }
                    </td>
                    <td><span className="sa-pill sa-pill-purple">Branch Admin</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showBranch && (
        <CreateBranchModal
          parks={parks}
          onClose={() => setShowBranch(false)}
          onCreated={fetchAll}
        />
      )}

      {showAdmin && (
        <CreateAdminModal
          parks={parks}
          onClose={() => setShowAdmin(false)}
          onCreated={fetchAll}
        />
      )}
    </SALayout>
  );
}
