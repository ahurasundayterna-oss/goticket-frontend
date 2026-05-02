import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import API    from "../api/api";
import "../styles/globals.css";
import "../styles/Payments.css";

/* ── Helpers ─────────────────────────────────────────────────── */
function fmtCurrency(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
  });
}

/* ══════════════════════════════════════════════
   FUND WALLET MODAL
══════════════════════════════════════════════ */
function FundWalletModal({ onClose, onFunded }) {
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [result,  setResult]  = useState(null);

  const handleFund = async () => {
    const num = Number(amount);
    if (!num || num < 100) return setError("Minimum amount is ₦100");
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/wallet/fund", { amount: num });
      setResult(res.data);
      onFunded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  /* ── Payment details screen ── */
  if (result) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box" style={{ maxWidth: 420 }}>
          <div className="modal-header">
            <div className="modal-title">💳 Transfer Details</div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="fund-transfer-card">
            <p className="fund-transfer-card__label">Transfer to this account</p>
            <p className="fund-transfer-card__bank">{result.bankName}</p>
            <div className="fund-transfer-card__account-row">
              <span className="fund-transfer-card__account-number">
                {result.accountNumber}
              </span>
              <button
                className="fund-transfer-card__copy-btn"
                onClick={() => copyToClipboard(result.accountNumber)}
              >
                Copy
              </button>
            </div>
            <div className="fund-transfer-card__amount-row">
              <span className="fund-transfer-card__amount-label">Amount to transfer</span>
              <span className="fund-transfer-card__amount-value">
                {fmtCurrency(result.amount)}
              </span>
            </div>
          </div>

          <div className="fund-warning">
            ⚠️ Transfer the <strong>exact amount</strong> shown. Your wallet will be
            credited automatically after payment is confirmed.
          </div>

          <p className="fund-reference">
            Reference:{" "}
            <span className="fund-reference__code">{result.reference}</span>
          </p>

          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose} style={{ width: "100%" }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Amount input screen ── */
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <div className="modal-title">Fund Wallet</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <p className="fund-helper-text">
          Enter the amount you want to add to your wallet.
          Minimum: <strong>₦100</strong>.
        </p>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Amount (₦)</label>
          <input
            className="form-control fund-amount-input"
            type="number"
            placeholder="e.g. 5000"
            min="100"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleFund()}
          />
        </div>

        <div className="fund-quick-amounts">
          {[1000, 2000, 5000, 10000].map(amt => (
            <button
              key={amt}
              onClick={() => setAmount(String(amt))}
              className={`fund-quick-btn${amount === String(amt) ? " fund-quick-btn--active" : ""}`}
            >
              {fmtCurrency(amt)}
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleFund} disabled={loading || !amount}>
            {loading ? "Generating..." : "Generate Account →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAYMENTS PAGE
══════════════════════════════════════════════ */
export default function Payments() {
  const [wallet,       setWallet]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [typeFilter,   setTypeFilter]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [txLoading,    setTxLoading]    = useState(false);
  const [error,        setError]        = useState("");
  const [showFund,     setShowFund]     = useState(false);

  const LIMIT = 20;

  const fetchWallet = useCallback(async () => {
    try {
      const res = await API.get("/wallet");
      setWallet(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wallet");
    }
  }, []);

  const fetchTransactions = useCallback(async (p = 1, type = typeFilter) => {
    setTxLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: LIMIT });
      if (type) q.set("type", type);
      const res = await API.get(`/wallet/transactions?${q}`);
      setTransactions(res.data.transactions || []);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch (err) {
      console.error("Transactions fetch error:", err);
    } finally {
      setTxLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    Promise.all([fetchWallet(), fetchTransactions(1)]).finally(() => setLoading(false));
    const interval = setInterval(fetchWallet, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    fetchTransactions(1, type);
  };

  const bookingsRemaining = wallet ? Math.floor((wallet.balance || 0) / 50) : 0;
  const totalPages = Math.ceil(total / LIMIT);

  /* ── Status helpers ── */
  const statusPillClass = wallet?.exhausted
    ? "status-pill--exhausted"
    : wallet?.lowBalance
    ? "status-pill--low"
    : "status-pill--active";

  const statusTextClass = wallet?.exhausted
    ? "wallet-card__status-text--exhausted"
    : wallet?.lowBalance
    ? "wallet-card__status-text--low"
    : "wallet-card__status-text--active";

  const statusLabel = wallet?.exhausted
    ? "🔴 Exhausted"
    : wallet?.lowBalance
    ? "🟡 Low Balance"
    : "🟢 Active";

  const statusMessage = wallet?.exhausted
    ? "Bookings are blocked. Fund wallet to continue."
    : wallet?.lowBalance
    ? "Less than ₦1,000 remaining. Consider topping up."
    : "Wallet is active. Bookings will proceed normally.";

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40 }}>
          <div className="skel" style={{ height: 120, borderRadius: 14, marginBottom: 20 }} />
          <div className="skel" style={{ height: 300, borderRadius: 14 }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ── Header ── */}
      <div className="page-header payments-header animate-in">
        <div>
          <h1 className="page-title">Wallet</h1>
          <p className="page-sub">Manage your branch wallet and transaction history</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowFund(true)}>
          + Fund Wallet
        </button>
      </div>

      {error && <div className="payments-error-banner">⚠️ {error}</div>}

      {/* ── Wallet cards ── */}
      <div className="wallet-cards">

        {/* Balance */}
        <div className="wallet-card wallet-card--balance">
          <div className="wallet-card__eyebrow">Wallet Balance</div>
          <div className="wallet-card__value">{fmtCurrency(wallet?.balance || 0)}</div>
          <div className="wallet-card__sub">Updated {fmtDate(wallet?.updatedAt)}</div>
          {wallet?.lowBalance && (
            <div className="wallet-card__low-alert">⚠️ Low balance — top up soon</div>
          )}
          <div className="wallet-card__deco" />
          <div className="wallet-card__deco-2" />
        </div>

        {/* Bookings remaining */}
        <div className="wallet-card">
          <div className="wallet-card__eyebrow">Bookings Remaining</div>
          <div className={`wallet-card__value${bookingsRemaining < 10 ? " wallet-card__value--danger" : ""}`}>
            {bookingsRemaining.toLocaleString()}
          </div>
          <div className="wallet-card__sub">₦50 deducted per booking</div>
        </div>

        {/* Status */}
        <div className="wallet-card">
          <div className="wallet-card__eyebrow">Wallet Status</div>
          <div className={`status-pill ${statusPillClass}`}>{statusLabel}</div>
          <p className={`wallet-card__status-text ${statusTextClass}`}>{statusMessage}</p>
        </div>

      </div>

      {/* ── Transaction history ── */}
      <div className="tx-section-header">
        <h2 className="tx-section-title">Transaction History</h2>
        <div className="tx-filters">
          {["", "CREDIT", "DEBIT"].map(type => (
            <button
              key={type || "ALL"}
              onClick={() => handleTypeFilter(type)}
              className={`tx-filter-btn${typeFilter === type ? " tx-filter-btn--active" : ""}`}
            >
              {type || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="card animate-in" style={{ overflow: "hidden", padding: 0 }}>
        <table className="gtable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {txLoading ? (
              <tr>
                <td colSpan="6">
                  <div className="tx-loading-cell">Loading…</div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <span className="empty-state-icon">💳</span>
                    No transactions yet
                  </div>
                </td>
              </tr>
            ) : transactions.map(tx => {
              const isCredit = tx.type === "CREDIT";
              const statusKey = tx.status?.toLowerCase();
              return (
                <tr key={tx.id}>
                  <td><span className="tx-date">{fmtDate(tx.createdAt)}</span></td>
                  <td><span className="tx-description">{tx.description || "—"}</span></td>
                  <td>
                    <span className={`tx-type-pill ${isCredit ? "tx-type-pill--credit" : "tx-type-pill--debit"}`}>
                      {isCredit ? "↑ Credit" : "↓ Debit"}
                    </span>
                  </td>
                  <td>
                    <span className={`tx-amount ${isCredit ? "tx-amount--credit" : "tx-amount--debit"}`}>
                      {isCredit ? "+" : "-"}{fmtCurrency(tx.amount)}
                    </span>
                  </td>
                  <td>
                    <span className={`tx-status-pill tx-status-pill--${statusKey}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td><span className="tx-reference">{tx.reference || "—"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="tx-pagination">
            <span>
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="tx-pagination__actions">
              <button
                onClick={() => fetchTransactions(page - 1)}
                disabled={page === 1}
                className="btn btn-ghost btn-sm"
              >
                ← Prev
              </button>
              <button
                onClick={() => fetchTransactions(page + 1)}
                disabled={page >= totalPages}
                className="btn btn-ghost btn-sm"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {showFund && (
        <FundWalletModal
          onClose={() => setShowFund(false)}
          onFunded={fetchWallet}
        />
      )}
    </Layout>
  );
}