import React, { useEffect, useState } from "react";
import API from "../api/api";
import SuperAdminLayout from "../components/SuperAdminLayout";
import "../styles/SuperAdmin.css";

const CONFIRM_TYPES = {
  suspend: {
    title: "Suspend Park",
    message: (name) => `Suspend "${name}"? Admins won't be able to log in until reactivated.`,
    confirmLabel: "Suspend",
    accent: "amber",
  },
  activate: {
    title: "Activate Park",
    message: (name) => `Reactivate "${name}"? Admins will regain access immediately.`,
    confirmLabel: "Activate",
    accent: "green",
  },
  delete: {
    title: "Delete Park",
    message: (name) => `Delete "${name}"? This is a soft delete and can be reversed by your database admin.`,
    confirmLabel: "Delete",
    accent: "red",
  },
};

export default function Parks() {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmModal, setConfirmModal] = useState(null); // { type, park }
  const [createModal, setCreateModal] = useState(false);
  const [newParkName, setNewParkName] = useState("");
  const [newParkLocation, setNewParkLocation] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchParks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/super-admin/parks");
      setParks(res.data);
    } catch (e) {
      showToast("Failed to load parks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParks(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSuspend = async (park) => {
    setActionLoading(true);
    try {
      await API.patch(`/super-admin/parks/${park.id}/suspend`);
      await fetchParks();
      showToast(`"${park.name}" has been suspended`);
    } catch (e) {
      showToast(e.response?.data?.error || "Action failed", "error");
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleActivate = async (park) => {
    setActionLoading(true);
    try {
      await API.patch(`/super-admin/parks/${park.id}/activate`);
      await fetchParks();
      showToast(`"${park.name}" has been activated`, "success");
    } catch (e) {
      showToast(e.response?.data?.error || "Action failed", "error");
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleDelete = async (park) => {
    setActionLoading(true);
    try {
      await API.delete(`/super-admin/parks/${park.id}`);
      await fetchParks();
      showToast(`"${park.name}" has been deleted`);
    } catch (e) {
      showToast(e.response?.data?.error || "Delete failed", "error");
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  const handleCreatePark = async () => {
    if (!newParkName.trim()) return showToast("Enter a park name", "error");
    setActionLoading(true);
    try {
      await API.post("/parks", { name: newParkName, location: newParkLocation });
      setNewParkName(""); setNewParkLocation("");
      setCreateModal(false);
      await fetchParks();
      showToast("Park created successfully");
    } catch (e) {
      showToast(e.response?.data?.error || "Create failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAction = () => {
    if (!confirmModal) return;
    if (confirmModal.type === "suspend") handleSuspend(confirmModal.park);
    if (confirmModal.type === "activate") handleActivate(confirmModal.park);
    if (confirmModal.type === "delete") handleDelete(confirmModal.park);
  };

  const filtered = parks.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.location || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const StatusPill = ({ status }) => {
    const map = {
      active:    { cls: "open",     label: "Active" },
      suspended: { cls: "full",     label: "Suspended" },
      deleted:   { cls: "closed",   label: "Deleted" },
    };
    const s = map[status] || map.active;
    return (
      <span className={`pill ${s.cls}`}>
        <span className="pill-dot" />
        {s.label}
      </span>
    );
  };

  const cfg = confirmModal ? CONFIRM_TYPES[confirmModal.type] : null;

  return (
    <SuperAdminLayout activePage="parks">
      {/* Toast */}
      {toast && (
        <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>
      )}

      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Parks</h1>
          <p className="page-sub">
            {parks.length} parks · {parks.filter(p => p.status === "active").length} active ·{" "}
            {parks.filter(p => p.status === "suspended").length} suspended
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
          + Create Park
        </button>
      </div>

      {/* Filter bar */}
      <div className="sa-filter-bar animate-in">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="form-control search-input"
            placeholder="Search parks or locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sa-filter-tabs">
          {["all", "active", "suspended"].map((s) => (
            <button
              key={s}
              className={`tab ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card animate-in">
        <div className="table-wrap">
          {loading ? (
            <div className="sa-loading">
              <div className="sa-spinner" />
              <span>Loading parks…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
              {search ? "No parks match your search." : "No parks yet. Create one above."}
            </div>
          ) : (
            <table className="gtable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Park Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Trips</th>
                  <th>Bookings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-tertiary)", fontFamily: "var(--mono)", width: 48 }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                    </td>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
                      {p.location || "—"}
                    </td>
                    <td><StatusPill status={p.status || "active"} /></td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{p._count?.trips ?? p.totalTrips ?? 0}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{p._count?.bookings ?? p.totalBookings ?? 0}</td>
                    <td>
                      <div className="sa-action-group">
                        {(p.status === "active" || !p.status) && (
                          <button
                            className="sa-action-btn sa-action-amber"
                            onClick={() => setConfirmModal({ type: "suspend", park: p })}
                            title="Suspend park"
                          >
                            ⛔ Suspend
                          </button>
                        )}
                        {p.status === "suspended" && (
                          <button
                            className="sa-action-btn sa-action-green"
                            onClick={() => setConfirmModal({ type: "activate", park: p })}
                            title="Activate park"
                          >
                            ✅ Activate
                          </button>
                        )}
                        <button
                          className="sa-action-btn sa-action-red"
                          onClick={() => setConfirmModal({ type: "delete", park: p })}
                          title="Delete park"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && cfg && (
        <div className="overlay show" onClick={() => !actionLoading && setConfirmModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{cfg.title}</div>
              <button className="close-btn" onClick={() => setConfirmModal(null)} disabled={actionLoading}>✕</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {cfg.message(confirmModal.park.name)}
            </p>
            <div className="modal-footer">
              <button className="btn" onClick={() => setConfirmModal(null)} disabled={actionLoading}>Cancel</button>
              <button
                className={`btn btn-${cfg.accent}`}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing…" : cfg.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Park Modal */}
      {createModal && (
        <div className="overlay show" onClick={() => !actionLoading && setCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🏢 Create New Park</div>
              <button className="close-btn" onClick={() => setCreateModal(false)} disabled={actionLoading}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Park Name</label>
              <input
                className="form-control"
                placeholder="e.g. GUO Transport"
                value={newParkName}
                onChange={(e) => setNewParkName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                placeholder="e.g. Lagos, Nigeria"
                value={newParkLocation}
                onChange={(e) => setNewParkLocation(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setCreateModal(false)} disabled={actionLoading}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreatePark} disabled={actionLoading}>
                {actionLoading ? "Creating…" : "Create Park"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
