import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SALayout from "../components/SALayout";
import API from "../../api/api";
import "../styles/sa-globals.css";
import "../styles/SA-Parks.css";

// ── Confirm Dialog ──────────────────────────────────────────────
function ConfirmDialog({ action, park, onConfirm, onCancel }) {
  const CONFIG = {
    suspend:  { icon:"⏸️", msg:"This will disable all logins for",  btnClass:"sa-btn sa-btn-warn",    btnLabel:"Suspend"  },
    activate: { icon:"✅", msg:"This will re-enable all logins for", btnClass:"sa-btn sa-btn-success", btnLabel:"Activate" },
    delete:   { icon:"🗑️", msg:"This action cannot be undone. Delete", btnClass:"sa-btn sa-btn-danger", btnLabel:"Delete" },
  };
  const cfg = CONFIG[action];
  return (
    <div className="sa-modal-overlay">
      <div className="sa-modal" style={{ maxWidth: 380 }}>
        <span className="sa-confirm-icon">{cfg.icon}</span>
        <p className="sa-confirm-msg">{cfg.msg}</p>
        <p className="sa-confirm-name">"{park?.name}"?</p>
        <div className="sa-modal-footer" style={{ justifyContent:"center", marginTop:24 }}>
          <button className="sa-btn sa-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={cfg.btnClass} onClick={onConfirm}>{cfg.btnLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Create Park Modal ───────────────────────────────────────────
// Shows a success screen after creation that guides you to add
// a branch + admin before anyone can log in.
function CreateParkModal({ onClose, onCreated }) {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: "", location: "" });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [created, setCreated] = useState(null); // park object after success

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name.trim()) return setError("Park name is required.");
    setSaving(true); setError("");
    try {
      const res = await API.post("/super/parks", { name: form.name, location: form.location });
      setCreated(res.data);
      onCreated(); // refresh parks list in background
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create park.");
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ──
  if (created) {
    return (
      <div className="sa-modal-overlay">
        <div className="sa-modal" style={{ maxWidth: 420, textAlign:"center" }}>
          <span style={{ fontSize:40, display:"block", marginBottom:12 }}>🎉</span>
          <div className="sa-modal-title" style={{ justifyContent:"center", marginBottom:6 }}>
            Park Created!
          </div>
          <p style={{ fontSize:14, color:"var(--sa-text-secondary)", marginBottom:24 }}>
            <strong>{created.name}</strong> is registered. But nobody can log in yet —
            you still need to add at least one branch and assign it a branch admin.
          </p>

          <div className="sa-next-steps">
            <div className="sa-next-step">
              <span className="sa-next-num">1</span>
              <div>
                <div className="sa-next-label">✅ Park created</div>
                <div className="sa-next-desc">{created.name}</div>
              </div>
            </div>
            <div className="sa-next-arrow">↓</div>
            <div className="sa-next-step sa-next-step--pending">
              <span className="sa-next-num sa-next-num--pending">2</span>
              <div>
                <div className="sa-next-label">Add a Branch</div>
                <div className="sa-next-desc">e.g. Makurdi Branch, Abuja Branch</div>
              </div>
            </div>
            <div className="sa-next-arrow">↓</div>
            <div className="sa-next-step sa-next-step--pending">
              <span className="sa-next-num sa-next-num--pending">3</span>
              <div>
                <div className="sa-next-label">Assign Branch Admin</div>
                <div className="sa-next-desc">Creates the login account</div>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:24 }}>
            <button className="sa-btn sa-btn-ghost" onClick={onClose}>
              Do this later
            </button>
            <button
              className="sa-btn sa-btn-primary"
              onClick={() => { onClose(); navigate("/sa/admins"); }}
            >
              Add Branch + Admin →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Create form ──
  return (
    <div className="sa-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sa-modal" style={{ maxWidth: 400 }}>
        <div className="sa-modal-header">
          <div className="sa-modal-title">Create New Park</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="sa-form-error">{error}</div>}

        <div className="sa-form-group">
          <label className="sa-form-label">Park Name *</label>
          <input
            className="sa-form-control"
            name="name"
            placeholder="e.g. ABC Motors"
            value={form.name}
            onChange={handle}
          />
        </div>
        <div className="sa-form-group">
          <label className="sa-form-label">Headquarters Location</label>
          <input
            className="sa-form-control"
            name="location"
            placeholder="e.g. Makurdi"
            value={form.location}
            onChange={handle}
          />
        </div>

        <div className="sa-info-note">
          💡 After creating the park you'll be guided to add branches and assign admins before anyone can log in.
        </div>

        <div className="sa-modal-footer">
          <button className="sa-btn sa-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="sa-btn sa-btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Park →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Parks Page ─────────────────────────────────────────────
export default function SAParks() {
  const [parks,       setParks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("ALL");
  const [showCreate,  setShowCreate]  = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const fetchParks = useCallback(async () => {
    try {
      const res = await API.get("/super/parks");
      setParks(res.data);
    } catch (err) {
      console.error("Parks fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchParks(); }, [fetchParks]);

  const doAction = async () => {
    const { action, park } = confirmData;
    try {
      if (action === "suspend")  await API.patch(`/super/parks/${park.id}/suspend`);
      if (action === "activate") await API.patch(`/super/parks/${park.id}/activate`);
      if (action === "delete")   await API.delete(`/super/parks/${park.id}`);
      setConfirmData(null);
      fetchParks();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} park.`);
    }
  };

  const filtered = parks.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.location || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || p.status === filter;
    return matchSearch && matchFilter;
  });

  // Parks that have no branches = nobody can log in for them yet
  const incompleteCount = parks.filter(p =>
    p.status === "ACTIVE" && (p._count?.branches === 0 || p._count?.branches == null)
  ).length;

  const STATUS_PILL = {
    ACTIVE:    <span className="sa-pill sa-pill-active">Active</span>,
    SUSPENDED: <span className="sa-pill sa-pill-suspended">Suspended</span>,
    DELETED:   <span className="sa-pill sa-pill-deleted">Deleted</span>,
  };

  const FILTERS = ["ALL", "ACTIVE", "SUSPENDED"];

  return (
    <SALayout>
      {/* Page header */}
      <div className="sa-page-header sa-animate-in">
        <div>
          <h1 className="sa-page-title">Parks</h1>
          <p className="sa-page-sub">Manage all registered transport parks on the platform</p>
        </div>
        <button className="sa-btn sa-btn-primary" onClick={() => setShowCreate(true)}>
          + New Park
        </button>
      </div>

      {/* Warning: parks with no branches */}
      {incompleteCount > 0 && (
        <div className="sa-setup-warning sa-animate-in">
          <span>⚠️</span>
          <span>
            <strong>{incompleteCount} park{incompleteCount > 1 ? "s have" : " has"} no branches</strong> — their admins cannot log in yet.
            Go to the <a href="/sa/admins" style={{ color:"inherit", fontWeight:700 }}>Admins tab</a> to add branches and assign admins.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="sa-parks-toolbar sa-animate-in">
        <div className="sa-search-wrap" style={{ flex:1 }}>
          <span className="sa-search-icon">⌕</span>
          <input
            className="sa-form-control sa-search"
            type="text"
            placeholder="Search parks by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sa-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`sa-filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              <span className="sa-filter-count">
                {f === "ALL" ? parks.length : parks.filter(p => p.status === f).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="sa-skel" style={{ height:300 }} />
      ) : (
        <div className="sa-card sa-animate-in" style={{ overflow:"hidden" }}>
          <table className="sa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Park Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Branches</th>
                <th>Trips</th>
                <th>Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="sa-empty">
                    <span className="sa-empty-icon">🏢</span>
                    {search ? "No parks match your search." : "No parks yet. Create one to get started."}
                  </div>
                </td></tr>
              ) : filtered.map((park, i) => {
                const branchCount = park._count?.branches ?? 0;
                const noBranches  = park.status === "ACTIVE" && branchCount === 0;

                return (
                  <tr key={park.id}>
                    <td style={{ color:"var(--sa-text-tertiary)", fontFamily:"var(--sa-mono)", width:40 }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td>
                      <div className="sa-park-name">{park.name}</div>
                      {noBranches && (
                        <div className="sa-park-warning">⚠ No branches — login not possible</div>
                      )}
                    </td>
                    <td style={{ color:"var(--sa-text-secondary)" }}>{park.location || "—"}</td>
                    <td>{STATUS_PILL[park.status] || STATUS_PILL.ACTIVE}</td>
                    <td>
                      <span style={{
                        fontFamily:"var(--sa-mono)", fontWeight:600,
                        color: noBranches ? "var(--sa-amber)" : "var(--sa-text-primary)"
                      }}>
                        {branchCount}
                      </span>
                    </td>
                    <td style={{ fontFamily:"var(--sa-mono)", fontWeight:600 }}>
                      {park._count?.trips ?? 0}
                    </td>
                    <td style={{ fontFamily:"var(--sa-mono)", fontWeight:600 }}>
                      {park._count?.bookings ?? 0}
                    </td>
                    <td>
                      <div className="sa-action-group">
                        {park.status !== "SUSPENDED" && park.status !== "DELETED" && (
                          <button className="sa-btn sa-btn-warn sa-btn-sm"
                            onClick={() => setConfirmData({ action:"suspend", park })}>
                            Suspend
                          </button>
                        )}
                        {park.status === "SUSPENDED" && (
                          <button className="sa-btn sa-btn-success sa-btn-sm"
                            onClick={() => setConfirmData({ action:"activate", park })}>
                            Activate
                          </button>
                        )}
                        {park.status !== "DELETED" && (
                          <button className="sa-btn sa-btn-danger sa-btn-sm"
                            onClick={() => setConfirmData({ action:"delete", park })}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateParkModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchParks}
        />
      )}

      {confirmData && (
        <ConfirmDialog
          action={confirmData.action}
          park={confirmData.park}
          onConfirm={doAction}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </SALayout>
  );
}