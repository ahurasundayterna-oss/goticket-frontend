import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

/* ── ICONS ─────────────────────────────────────────────────── */
const IconWhatsApp = () => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <path d="M20 10C14.477 10 10 14.477 10 20c0 1.89.525 3.66 1.44 5.17L10 30l4.95-1.42A9.96 9.96 0 0020 30c5.523 0 10-4.477 10-10S25.523 10 20 10z" fill="#1D9E75"/>
    <path d="M17.5 15.5c-.3-.7-1.1-.7-1.4 0l-.6 1.4c-.2.4-.1.9.2 1.2l.6.6c-.3.8-.9 1.9-1.7 2.7l-.6-.6c-.3-.3-.8-.4-1.2-.2l-1.4.6c-.7.3-.7 1.1 0 1.4 1.5.7 3.8.4 5.7-1.5 1.9-1.9 2.2-4.2 1.4-5.6z" fill="#fff"/>
  </svg>
);

const IconDashboard = () => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <rect x="11" y="11" width="8" height="8" rx="2" fill="#1D9E75"/>
    <rect x="21" y="11" width="8" height="8" rx="2" fill="#0F6E56"/>
    <rect x="11" y="21" width="8" height="8" rx="2" fill="#0F6E56"/>
    <rect x="21" y="21" width="8" height="8" rx="2" fill="#1D9E75"/>
  </svg>
);

const IconBooking = () => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <rect x="12" y="13" width="16" height="14" rx="2" fill="#1D9E75"/>
    <path d="M15 18h10M15 22h7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="27" cy="26" r="4" fill="#0F6E56"/>
    <path d="M25 26l1.5 1.5L29 24" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconPayment = () => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <rect x="11" y="15" width="18" height="12" rx="2" fill="#1D9E75"/>
    <rect x="11" y="18" width="18" height="3" fill="#0F6E56"/>
    <rect x="13" y="22" width="5" height="2" rx="1" fill="#fff" opacity="0.7"/>
  </svg>
);

const IconRoutes = () => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <circle cx="13" cy="27" r="3" fill="#1D9E75"/>
    <circle cx="27" cy="13" r="3" fill="#0F6E56"/>
    <path d="M15 25C17 22 22 18 25 15" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#1D9E75"/>
    <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── DASHBOARD MOCKUP ───────────────────────────────────────── */
const DashboardMockup = () => (
  <div className="lp-mockup-wrapper">
    <div className="lp-mockup-browser">
      <div className="lp-mockup-bar">
        <span className="lp-mockup-dot" style={{ background:"#ff5f57" }}/>
        <span className="lp-mockup-dot" style={{ background:"#febc2e" }}/>
        <span className="lp-mockup-dot" style={{ background:"#28c840" }}/>
        <span className="lp-mockup-url">goticket.ng/dashboard</span>
      </div>
      <div className="lp-mockup-content">
        <div className="lp-mock-sidebar">
          <div className="lp-mock-logo">GT</div>
          {["Dashboard","Bookings","Trips","Routes","Staff"].map(item => (
            <div key={item} className={`lp-mock-nav ${item === "Dashboard" ? "active" : ""}`}>
              <span className="lp-mock-nav-dot"/>
              {item}
            </div>
          ))}
        </div>
        <div className="lp-mock-main">
          <div className="lp-mock-header">
            <span className="lp-mock-title">Dashboard</span>
            <span className="lp-mock-branch">Abuja Branch</span>
          </div>
          <div className="lp-mock-stats">
            {[
              { label:"Total Bookings", value:"128",    change:"+12%" },
              { label:"Revenue",        value:"₦384k",  change:"+18%" },
              { label:"Active Trips",   value:"6",      change:"+2"   },
            ].map(s => (
              <div key={s.label} className="lp-mock-stat">
                <div className="lp-mock-stat-label">{s.label}</div>
                <div className="lp-mock-stat-value">{s.value}</div>
                <div className="lp-mock-stat-change">{s.change}</div>
              </div>
            ))}
          </div>
          <div className="lp-mock-chart">
            <div className="lp-mock-chart-label">Booking Overview — This Week</div>
            <svg viewBox="0 0 200 55" className="lp-mock-chart-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.18"/>
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polygon
                points="0,55 0,42 28,36 56,38 84,22 112,28 140,14 168,20 200,8 200,55"
                fill="url(#chartGrad)"
              />
              <polyline
                points="0,42 28,36 56,38 84,22 112,28 140,14 168,20 200,8"
                fill="none" stroke="#1D9E75" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
              {[[0,42],[84,22],[140,14],[200,8]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="#1D9E75"/>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* WhatsApp bubble */}
    <div className="lp-mockup-phone">
      <div className="lp-phone-header">
        <div className="lp-phone-avatar">GT</div>
        <div>
          <div className="lp-phone-name">GoTicket Bot</div>
          <div className="lp-phone-status">● Online</div>
        </div>
      </div>
      <div className="lp-phone-messages">
        <div className="lp-msg lp-msg-bot">Hi! Book a trip on WhatsApp 🎟️</div>
        <div className="lp-msg lp-msg-user">Abuja to Lagos tomorrow</div>
        <div className="lp-msg lp-msg-bot">✅ 3 seats available — ₦7,500 each</div>
        <div className="lp-msg lp-msg-action">Confirm Booking →</div>
      </div>
    </div>
  </div>
);

/* ── MAIN ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lp-root">

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <div className="lp-nav-logo-icon">GT</div>
            <span className="lp-nav-logo-text">GoTicket</span>
          </div>

          <div className={`lp-nav-links ${menuOpen ? "lp-nav-links--open" : ""}`}>
            <button className="lp-nav-link" onClick={() => scrollTo("features")}>Features</button>
            <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
            <button className="lp-nav-link" onClick={() => scrollTo("why")}>Why GoTicket</button>
            <button className="lp-nav-link" onClick={() => scrollTo("contact")}>Contact</button>
            <Link to="/login" className="lp-btn lp-btn-primary lp-nav-cta">
              Sign In →
            </Link>
          </div>

          <button
            className="lp-nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-bg-circle"/>
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-hero-badge">
              <span className="lp-badge-dot"/>
              Built for Nigerian Transport Operators
            </div>
            <h1 className="lp-hero-headline">
              The Complete Booking &amp; Management Platform for{" "}
              <span className="lp-text-green">Transport Operators.</span>
            </h1>
            <p className="lp-hero-sub">
              Let passengers book tickets on WhatsApp. Manage trips, routes, staff
              and payments from one powerful dashboard. No app download needed.
            </p>
            <div className="lp-hero-tagline">
              <span>BOOK</span>
              <span className="lp-tagline-dot">•</span>
              <span>PAY</span>
              <span className="lp-tagline-dot">•</span>
              <span>MANAGE</span>
              <span className="lp-tagline-dot">•</span>
              <span>GROW</span>
            </div>
            <div className="lp-hero-ctas">
              <Link to="/login" className="lp-btn lp-btn-primary lp-btn-lg">
                Sign In to Dashboard →
              </Link>
              <button
                className="lp-btn lp-btn-outline lp-btn-lg"
                onClick={() => scrollTo("how-it-works")}
              >
                <span className="lp-play-icon">▶</span>
                See How It Works
              </button>
            </div>
          </div>
          <div className="lp-hero-visual">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-section-center">
            <div className="lp-section-eyebrow">FEATURES</div>
            <h2 className="lp-section-heading">Everything your operation needs</h2>
            <p className="lp-section-sub">
              From WhatsApp booking to real-time dashboard management — GoTicket covers it all.
            </p>
          </div>
          <div className="lp-features-grid">
            {[
              {
                icon: <IconWhatsApp />,
                title: "WhatsApp Booking",
                desc: "Passengers book tickets by simply messaging your WhatsApp number. No app needed.",
              },
              {
                icon: <IconDashboard />,
                title: "Operations Dashboard",
                desc: "Manage all bookings, trips, routes and staff from one clean dashboard.",
              },
              {
                icon: <IconBooking />,
                title: "Manual Bookings",
                desc: "Staff can create walk-in bookings manually and confirm payment instantly.",
              },
              {
                icon: <IconPayment />,
                title: "Monnify Payments",
                desc: "Auto-generate virtual accounts per booking. Money goes directly to your branch.",
              },
              {
                icon: <IconRoutes />,
                title: "Route Management",
                desc: "Set up routes, assign staff and manage trips across multiple branches.",
              },
            ].map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY GOTICKET ════════════════════════════════════════ */}
      <section className="lp-why" id="why">
        <div className="lp-container lp-why-inner">
          <div className="lp-why-text">
            <div className="lp-section-eyebrow">WHY GOTICKET</div>
            <h2 className="lp-section-heading">
              Run your transport business{" "}
              <span className="lp-text-green">smarter</span> and{" "}
              <span className="lp-text-green">faster.</span>
            </h2>
            <p className="lp-why-sub">
              GoTicket replaces manual record-keeping with a modern digital system
              that saves time, reduces errors and grows your revenue.
            </p>
            <ul className="lp-why-list">
              {[
                "Centralized booking management across branches",
                "Real-time trip and seat tracking",
                "Automatic payment confirmation via Monnify",
                "Multi-branch and staff role management",
                "WhatsApp booking bot included",
                "Passenger manifest and reports",
              ].map(item => (
                <li key={item} className="lp-why-item">
                  <IconCheck />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-why-visual">
            <div className="lp-bus-illustration">
              <svg viewBox="0 0 320 180" fill="none">
                <rect x="0" y="150" width="320" height="30" fill="#e2e8f0"/>
                <rect x="30" y="162" width="30" height="3" fill="#fff"/>
                <rect x="130" y="162" width="30" height="3" fill="#fff"/>
                <rect x="230" y="162" width="30" height="3" fill="#fff"/>
                <rect x="30" y="70" width="260" height="80" rx="12" fill="#1D9E75"/>
                <rect x="50" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="98" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="146" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="194" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="242" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="242" y="113" width="35" height="37" rx="2" fill="#0F6E56"/>
                <rect x="22" y="120" width="12" height="30" rx="3" fill="#0F6E56"/>
                <rect x="286" y="120" width="12" height="30" rx="3" fill="#0F6E56"/>
                <circle cx="80" cy="152" r="18" fill="#0c1220"/>
                <circle cx="80" cy="152" r="10" fill="#475569"/>
                <circle cx="80" cy="152" r="4"  fill="#94a3b8"/>
                <circle cx="240" cy="152" r="18" fill="#0c1220"/>
                <circle cx="240" cy="152" r="10" fill="#475569"/>
                <circle cx="240" cy="152" r="4"  fill="#94a3b8"/>
                <text x="160" y="68" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="DM Sans, sans-serif">GoTicket</text>
                <rect x="290" y="88" width="14" height="8" rx="2" fill="#fbbf24"/>
                <rect x="286" y="96" width="20" height="16" rx="2" fill="#0F6E56"/>
              </svg>
              <div className="lp-stat-float lp-stat-float--1">
                <div className="lp-stat-float-val">100%</div>
                <div className="lp-stat-float-label">Digital Tickets</div>
              </div>
              <div className="lp-stat-float lp-stat-float--2">
                <div className="lp-stat-float-val">WhatsApp</div>
                <div className="lp-stat-float-label">Powered Booking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-center">
            <div className="lp-section-eyebrow">HOW IT WORKS</div>
            <h2 className="lp-section-heading">Simple. Fast. Reliable.</h2>
            <p className="lp-section-sub">
              From WhatsApp message to confirmed ticket in under 3 minutes.
            </p>
          </div>
          <div className="lp-steps">
            {[
              { num:"01", title:"Passenger Sends a Message", desc:"They WhatsApp your GoTicket number with their route and travel date. No app download required." },
              { num:"02", title:"Bot Shows Available Trips",  desc:"GoTicket instantly replies with available trips, seat counts and prices for the route." },
              { num:"03", title:"Booking is Confirmed",       desc:"Passenger selects a trip. Staff or the system confirms the booking and assigns a seat." },
              { num:"04", title:"Payment is Collected",       desc:"A Monnify virtual account is generated. Passenger transfers the exact amount to confirm." },
              { num:"05", title:"Ticket Reference Sent",      desc:"Passenger receives a booking reference on WhatsApp. Admin monitors everything on the dashboard." },
            ].map((step, i) => (
              <div key={step.num} className="lp-step">
                <div className="lp-step-num">{step.num}</div>
                {i < 4 && <div className="lp-step-connector"/>}
                <div className="lp-step-body">
                  <h3 className="lp-step-title">{step.title}</h3>
                  <p className="lp-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHAT'S INCLUDED ════════════════════════════════════ */}
      <section className="lp-included" id="included">
        <div className="lp-container">
          <div className="lp-section-center">
            <div className="lp-section-eyebrow">WHAT'S INCLUDED</div>
            <h2 className="lp-section-heading">One platform. Everything included.</h2>
          </div>
          <div className="lp-included-grid">
            {[
              { emoji:"🤖", title:"WhatsApp Booking Bot",       desc:"AI-powered booking flow via WhatsApp. No extra app." },
              { emoji:"📊", title:"Admin Dashboard",             desc:"Full control over bookings, trips, routes and revenue." },
              { emoji:"👥", title:"Multi-branch & Staff Roles",  desc:"Branch admins, staff roles and permission management." },
              { emoji:"💳", title:"Monnify Payment Integration", desc:"Virtual accounts per booking. Auto-confirmed on transfer." },
              { emoji:"📋", title:"Passenger Manifest",          desc:"Printable manifest for every trip sorted by seat." },
              { emoji:"📈", title:"Reports & Analytics",         desc:"Booking trends, revenue breakdown and route performance." },
              { emoji:"🔔", title:"Real-time Updates",           desc:"Seat counts, trip status and bookings update instantly." },
              { emoji:"🛡️", title:"Secure & Reliable",           desc:"Role-based access, audit logs and data protection." },
            ].map(item => (
              <div key={item.title} className="lp-included-card">
                <div className="lp-included-emoji">{item.emoji}</div>
                <div>
                  <div className="lp-included-title">{item.title}</div>
                  <div className="lp-included-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════ */}
<section className="lp-cta" id="contact">
  <div className="lp-container lp-cta-inner">
    <div className="lp-cta-icon">🚀</div>
    <div className="lp-cta-text">
      <h2 className="lp-cta-heading">
        Ready to modernise your transport operations?
      </h2>
      <p className="lp-cta-sub">
        Contact us to get your park set up on GoTicket.
      </p>
    </div>
    <div className="lp-cta-actions">
      <Link to="/login" className="lp-btn lp-btn-white lp-btn-lg">
        Sign In →
      </Link>

      <a
        href="mailto:support@goticket.ng"
        className="lp-btn lp-btn-outline-white lp-btn-lg"
      >
        Contact Us
      </a>
    </div>
  </div>
</section>

{/* ══ FOOTER ══════════════════════════════════════════════ */}
<footer className="lp-footer">
  <div className="lp-container lp-footer-inner">
    <div className="lp-footer-brand">
      <div className="lp-footer-logo">
        <div className="lp-nav-logo-icon">GT</div>
        <span className="lp-footer-logo-text">GoTicket</span>
      </div>
      <p className="lp-footer-tagline">
        Nigeria's digital transport booking and management platform.
      </p>
      <p className="lp-footer-tagline" style={{ marginTop: 8 }}>
        📧 support@goticket.ng
      </p>
    </div>

    <div className="lp-footer-links">
      <div className="lp-footer-col">
        <div className="lp-footer-col-title">Product</div>
        <button className="lp-footer-link" onClick={() => scrollTo("features")}>
          Features
        </button>
        <button className="lp-footer-link" onClick={() => scrollTo("how-it-works")}>
          How It Works
        </button>
        <button className="lp-footer-link" onClick={() => scrollTo("why")}>
          Why GoTicket
        </button>
        <button className="lp-footer-link" onClick={() => scrollTo("included")}>
          What's Included
        </button>
      </div>

      <div className="lp-footer-col">
        <div className="lp-footer-col-title">Access</div>
        <Link to="/login" className="lp-footer-link">
          Branch Admin Login
        </Link>
        <Link to="/login" className="lp-footer-link">
          Super Admin Login
        </Link>
      </div>

      <div className="lp-footer-col">
        <div className="lp-footer-col-title">Contact</div>
        <a href="mailto:support@goticket.ng" className="lp-footer-link">
          support@goticket.ng
        </a>
        <span className="lp-footer-link">Available Mon–Sat</span>
        <span className="lp-footer-link">6am – 10pm WAT</span>
      </div>
    </div>
  </div>

  <div className="lp-footer-bottom">
    <div className="lp-container">
      <span>© {new Date().getFullYear()} GoTicket. All rights reserved.</span>
      <span>Built for Nigerian transport operators.</span>
    </div>
  </div>
</footer>

</div>
);
}