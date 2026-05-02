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

/* ══════════════════════════════════════════════
   NIGERIAN BANKS LIST
   Matches the BANK_CODE_MAP in monnify.js
══════════════════════════════════════════════ */
const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank",
  "FCMB",
  "GTBank",
  "Heritage Bank",
  "Keystone Bank",
  "Moniepoint",
  "Opay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC",
  "Standard Chartered",
  "Sterling Bank",
  "Taj Bank",
  "Titan Trust Bank",
  "Union Bank",
  "UBA",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Kuda Bank",
  "Carbon",
  "Rubies Bank",
];

/* ══════════════════════════════════════════════
   CREATE BRANCH MODAL
   ──────────────────────────────────────────────
   Collects bank details so Monnify sub-account
   is created automatically on branch creation.
══════════════════════════════════════════════ */
function CreateBranchModal({ parks, onClose, onCreated }) {
  const [form, setForm] = useState({
    parkId:        "",
    name:          "",
    accountNumber: "",
    bankName:      "",
    accountName:   "",
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(null); // branch response

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.parkId || !form.name.trim()) {
      return setError("Select a park and enter a branch name.");
    }

    // Validate account number format if provided
    if (form.accountNumber && !/^\d{10}$/.test(form.accountNumber.trim())) {
      return setError("Account number must be exactly 10 digits.");
    }

    // If any bank field is filled, all must be filled
    const hasBankDetails = form.accountNumber || form.bankName || form.accountName;
    if (hasBankDetails && (!form.accountNumber || !form.bankName || !form.accountName)) {
      return setError("Please fill in all bank details (account number, bank name, account holder name).");
    }

    setSaving(true);
    setError("");

    try {
      const res = await API.post("/super/branches", {
        name:          form.name.trim(),
        parkId:        form.parkId,
        accountNumber: form.accountNumber.trim()  || undefined,
        bankName:      form.bankName.trim()        || undefined,
        accountName:   form.accountName.trim()     || undefined,
      });

      setSuccess(res.data);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create branch.");
      setSaving(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="sa-modal-overlay">
        <div className="sa-modal" style={{ maxWidth: 400, textAlign: "center" }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>✅</span>
          <div className="sa-modal-title" style={{ justifyContent: "center", marginBottom: 8 }}>
            Branch Created!
          </div>

          <div style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 10, padding: "16px 20px",
            textAlign: "left", marginBottom: 16, fontSize: 13,
          }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>Branch</div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{success.name}</div>
            </div>

            {success.monnifySubAccountCode ? (
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 8, padding: "10px 14px", marginTop: 10,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: 4 }}>
                  ✅ Monnify Sub-Account Created
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#166534", fontWeight: 600 }}>
                  {success.monnifySubAccountCode}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  Payments will route directly to this branch's bank account.
                </div>
              </div>
            ) : success.accountNumber ? (
              <div style={{
                background: "#fef3c7", border: "1px solid #fde68a",
                borderRadius: 8, padding: "10px 14px", marginTop: 10,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
                  ⚠️ Monnify Sub-Account Pending
                </div>
                <div style={{ fontSize: 11, color: "#92400e" }}>
                  Bank details were saved but Monnify registration failed.
                  Use the retry option or check server logs.
                </div>
              </div>
            ) : (
              <div style={{
                background: "#f1f5f9", border: "1px solid #e2e8f0",
                borderRadius: 8, padding: "10px 14px", marginTop: 10,
              }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  No bank details provided — payment routing not configured.
                  Edit the branch later to add bank details.
                </div>
              </div>
            )}
          </div>

          <button
            className="sa-btn sa-btn-primary"
            onClick={onClose}
            style={{ width: "100%" }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  /* ── Create form ── */
  return (
    <div className="sa-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sa-modal" style={{ maxWidth: 440 }}>
        <div className="sa-modal-header">
          <div className="sa-modal-title">Create Branch</div>
          <button className="sa-modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="sa-form-error">{error}</div>}

        {/* ── Branch basics ── */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
        }}>
          Branch Details
        </div>

        <div className="sa-form-group">
          <label className="sa-form-label">Park *</label>
          <select
            className="sa-form-control"
            name="parkId"
            value={form.parkId}
            onChange={handle}
          >
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

        {/* ── Bank details ── */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.06em",
          margin: "20px 0 10px",
        }}>
          Bank Details
          <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11, marginLeft: 6, color: "#94a3b8" }}>
            (for automatic Monnify payment routing)
          </span>
        </div>

        <div className="sa-form-group">
          <label className="sa-form-label">Bank Name</label>
          <select
            className="sa-form-control"
            name="bankName"
            value={form.bankName}
            onChange={handle}
          >
            <option value="">Select bank...</option>
            {NIGERIAN_BANKS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="sa-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="sa-form-group" style={{ margin: 0 }}>
            <label className="sa-form-label">Account Number</label>
            <input
              className="sa-form-control"
              name="accountNumber"
              placeholder="10 digits"
              maxLength={10}
              value={form.accountNumber}
              onChange={handle}
            />
          </div>
          <div className="sa-form-group" style={{ margin: 0 }}>
            <label className="sa-form-label">Account Holder Name</label>
            <input
              className="sa-form-control"
              name="accountName"
              placeholder="Name on account"
              value={form.accountName}
              onChange={handle}
            />
          </div>
        </div>

        {/* Info note */}
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 8, padding: "10px 14px", marginTop: 16,
          fontSize: 12, color: "#166534", lineHeight: 1.5,
        }}>
          💡 When bank details are provided, a Monnify sub-account is created automatically
          so passenger payments go directly to this branch's bank account.
        </div>

        <div className="sa-modal-footer" style={{ marginTop: 20 }}>
          <button className="sa-btn sa-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="sa-btn sa-btn-primary"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CREATE BRANCH ADMIN MODAL — unchanged
══════════════════════════════════════════════ */
function CreateAdminModal({ parks, onClose, onCreated }) {
  const [branches, setBranches] = useState([]);
  const [form,     setForm]     = useState({
    parkId: "", branchId: "", name: "", email: "", password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

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
    <div className="sa-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
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
              onChange={e => selectPark(e.target.value)}
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
                {!form.parkId
                  ? "Select park first"
                  : branches.length === 0
                  ? "No branches yet"
                  : "Select branch..."}
              </option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <p className="sa-modal-section-label" style={{ marginTop: 4 }}>Admin Details</p>
        <div className="sa-form-group">
          <label className="sa-form-label">Full Name *</label>
          <input
            className="sa-form-control"
            name="name"
            placeholder="Admin full name"
            value={form.name}
            onChange={handle}
          />
        </div>
        <div className="sa-form-row">
          <div className="sa-form-group">
            <label className="sa-form-label">Email *</label>
            <input
              className="sa-form-control"
              type="email"
              name="email"
              placeholder="admin@park.ng"
              value={form.email}
              onChange={handle}
            />
          </div>
          <div className="sa-form-group">
            <label className="sa-form-label">Password *</label>
            <input
              className="sa-form-control"
              type="password"
              name="password"
              placeholder="Min. 8 chars"
              value={form.password}
              onChange={handle}
            />
          </div>
        </div>

        <div className="sa-modal-footer">
          <button className="sa-btn sa-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="sa-btn sa-btn-primary"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ADMINS PAGE
══════════════════════════════════════════════ */
export default function SAAdmins() {
  const [admins,     setAdmins]     = useState([]);
  const [parks,      setParks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [showBranch, setShowBranch] = useState(false);
  const [showAdmin,  setShowAdmin]  = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [adminsRes, parksRes] = await Promise.all([
        API.get("/super/admins"),
        API.get("/super/parks"),
      ]);
      setAdmins(adminsRes.data);
      setParks(parksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      {/* Flow strip */}
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
            <div className="sa-flow-desc">With bank details</div>
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
        <div className="sa-flow-arrow">→</div>
        <div className="sa-flow-step">
          <span className="sa-flow-num">4</span>
          <div>
            <div className="sa-flow-label">Payments Route</div>
            <div className="sa-flow-desc">Direct to branch bank</div>
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
            onChange={e => setSearch(e.target.value)}
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
                <th>Monnify</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="sa-empty">
                    <span className="sa-empty-icon">👤</span>
                    {search
                      ? "No admins match your search."
                      : "No branch admins yet. Create a branch first, then assign an admin."}
                  </div>
                </td></tr>
              ) : filtered.map((a, i) => {
                const col      = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const initials = a.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const hasSubAccount = a.branch?.monnifySubAccountCode;

                return (
                  <tr key={a.id}>
                    <td style={{
                      color: "var(--sa-text-tertiary)",
                      fontFamily: "var(--sa-mono)", width: 40,
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td>
                      <div className="sa-admin-row">
                        <div
                          className="sa-admin-avatar"
                          style={{ background: col.bg, color: col.fg }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="sa-admin-name">{a.name}</div>
                          <div className="sa-admin-email">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {a.branch?.park?.name || "—"}
                    </td>
                    <td style={{ color: "var(--sa-text-secondary)" }}>
                      {a.branch?.name || "—"}
                    </td>
                    <td>
                      {hasSubAccount ? (
                        <span
                          className="sa-pill sa-pill-active"
                          title={a.branch.monnifySubAccountCode}
                        >
                          ✓ Configured
                        </span>
                      ) : (
                        <span className="sa-pill sa-pill-suspended">
                          Not set
                        </span>
                      )}
                    </td>
                    <td>
                      {a.suspended
                        ? <span className="sa-pill sa-pill-suspended">Suspended</span>
                        : <span className="sa-pill sa-pill-active">Active</span>
                      }
                    </td>
                    <td>
                      <span className="sa-pill sa-pill-purple">Branch Admin</span>
                    </td>
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