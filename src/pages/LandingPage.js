import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

/* ── SVG ICONS ─────────────────────────────────────────────── */
const IconWhatsApp = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <path d="M20 10C14.477 10 10 14.477 10 20c0 1.89.525 3.66 1.44 5.17L10 30l4.95-1.42A9.96 9.96 0 0020 30c5.523 0 10-4.477 10-10S25.523 10 20 10z" fill="#1D9E75"/>
    <path d="M17.5 15.5c-.3-.7-1.1-.7-1.4 0l-.6 1.4c-.2.4-.1.9.2 1.2l.6.6c-.3.8-.9 1.9-1.7 2.7l-.6-.6c-.3-.3-.8-.4-1.2-.2l-1.4.6c-.7.3-.7 1.1 0 1.4 1.5.7 3.8.4 5.7-1.5 1.9-1.9 2.2-4.2 1.4-5.6z" fill="#fff"/>
  </svg>
);

const IconDashboard = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <rect x="11" y="11" width="8" height="8" rx="2" fill="#1D9E75"/>
    <rect x="21" y="11" width="8" height="8" rx="2" fill="#0F6E56"/>
    <rect x="11" y="21" width="8" height="8" rx="2" fill="#0F6E56"/>
    <rect x="21" y="21" width="8" height="8" rx="2" fill="#1D9E75"/>
  </svg>
);

const IconBooking = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <rect x="12" y="13" width="16" height="14" rx="2" fill="#1D9E75"/>
    <path d="M15 18h10M15 22h7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="27" cy="26" r="4" fill="#0F6E56"/>
    <path d="M25 26l1.5 1.5L29 24" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconPayment = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <rect x="11" y="15" width="18" height="12" rx="2" fill="#1D9E75"/>
    <rect x="11" y="18" width="18" height="3" fill="#0F6E56"/>
    <rect x="13" y="22" width="5" height="2" rx="1" fill="#fff" opacity="0.7"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#E1F5EE"/>
    <path d="M20 11l8 3.5v5c0 4.5-3.5 8.5-8 9.5-4.5-1-8-5-8-9.5v-5L20 11z" fill="#1D9E75"/>
    <path d="M17 20l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        {/* Sidebar */}
        <div className="lp-mock-sidebar">
          <div className="lp-mock-logo">GT</div>
          {["Dashboard","Bookings","Trips","Routes","Staff","Settings"].map(item => (
            <div key={item} className={`lp-mock-nav ${item === "Dashboard" ? "active" : ""}`}>
              <span className="lp-mock-nav-dot"/>
              {item}
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="lp-mock-main">
          <div className="lp-mock-header">
            <span className="lp-mock-title">Dashboard</span>
            <span className="lp-mock-branch">Lagos Branch</span>
          </div>
          <div className="lp-mock-stats">
            {[
              { label:"Total Bookings", value:"2,350", change:"+15.6%" },
              { label:"Total Revenue",  value:"₦8.75M", change:"+23.4%" },
              { label:"Active Trips",   value:"45",     change:"+5" },
            ].map(s => (
              <div key={s.label} className="lp-mock-stat">
                <div className="lp-mock-stat-label">{s.label}</div>
                <div className="lp-mock-stat-value">{s.value}</div>
                <div className="lp-mock-stat-change">{s.change}</div>
              </div>
            ))}
          </div>
          <div className="lp-mock-chart">
            <div className="lp-mock-chart-label">Booking Overview</div>
            <svg viewBox="0 0 200 60" className="lp-mock-chart-svg">
              <polyline
                points="0,50 30,40 60,45 90,20 120,30 150,15 180,25 200,10"
                fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <polyline
                points="0,50 30,40 60,45 90,20 120,30 150,15 180,25 200,10"
                fill="url(#chartGrad)" stroke="none"
              />
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
    {/* Floating WhatsApp bubble */}
    <div className="lp-mockup-phone">
      <div className="lp-phone-header">
        <div className="lp-phone-avatar">GT</div>
        <div>
          <div className="lp-phone-name">GoTicket AI</div>
          <div className="lp-phone-status">● Online</div>
        </div>
      </div>
      <div className="lp-phone-messages">
        <div className="lp-msg lp-msg-bot">👋 Hello! I'm GoTicket AI. How can I help you today?</div>
        <div className="lp-msg lp-msg-user">I want to book a ticket</div>
        <div className="lp-msg lp-msg-bot">Great! Where would you like to travel from?</div>
        <div className="lp-msg lp-msg-user">Lagos</div>
        <div className="lp-msg lp-msg-bot">Here are available trips for Lagos → Abuja</div>
        <div className="lp-msg lp-msg-action">View Trips →</div>
      </div>
    </div>
  </div>
);

/* ── MAIN COMPONENT ────────────────────────────────────────── */
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
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  };

  return (
    <div className="lp-root">

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <img
              src="/goticket-logo.png"
              alt="GoTicket"
              className="lp-nav-logo-img"
              onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
            />
            <div className="lp-nav-logo-fallback">
              <div className="lp-nav-logo-icon">GT</div>
              <span className="lp-nav-logo-text">GoTicket</span>
            </div>
          </div>

          <div className={`lp-nav-links ${menuOpen ? "lp-nav-links--open" : ""}`}>
            <button className="lp-nav-link" onClick={() => scrollTo("features")}>Features</button>
            <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
            <button className="lp-nav-link" onClick={() => scrollTo("why")}>Why GoTicket</button>
            <button className="lp-nav-link" onClick={() => scrollTo("contact")}>Contact</button>
            <Link to="/login" className="lp-btn lp-btn-primary lp-nav-cta">
              Get Started →
            </Link>
          </div>

          <button className="lp-nav-hamburger" onClick={() => setMenuOpen(o => !o)}>
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
              Built for Transport Operators
            </div>
            <h1 className="lp-hero-headline">
              The Complete Ticketing and Management Platform for{" "}
              <span className="lp-text-green">Transport Operators.</span>
            </h1>
            <p className="lp-hero-sub">
              Manage bookings, payments, routes, staff and operations from one powerful platform.
            </p>
            <div className="lp-hero-tagline">
              <span>PAY</span>
              <span className="lp-tagline-dot">•</span>
              <span>BOOK</span>
              <span className="lp-tagline-dot">•</span>
              <span>MANAGE</span>
              <span className="lp-tagline-dot">•</span>
              <span>GROW</span>
            </div>
            <div className="lp-hero-ctas">
              <Link to="/login" className="lp-btn lp-btn-primary lp-btn-lg">
                Get Started Free →
              </Link>
              <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => scrollTo("how-it-works")}>
                <span className="lp-play-icon">▶</span>
                Watch How It Works
              </button>
            </div>
          </div>
          <div className="lp-hero-visual">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ROW ════════════════════════════════════════ */}
      <section className="lp-features" id="features">
        <div className="lp-container">
          <div className="lp-features-grid">
            {[
              {
                icon: <IconWhatsApp />,
                title: "Book on WhatsApp",
                desc: "Customers book tickets easily through WhatsApp with our smart AI assistant.",
              },
              {
                icon: <IconDashboard />,
                title: "Operator Dashboard",
                desc: "Manage all bookings, buses, routes, staff and payments from one dashboard.",
              },
              {
                icon: <IconBooking />,
                title: "Manual Bookings",
                desc: "Operators create and manage bookings manually with ease.",
              },
              {
                icon: <IconPayment />,
                title: "Secure Payments",
                desc: "Accept payments securely and get auto-confirmation with webhooks.",
              },
              {
                icon: <IconShield />,
                title: "Safe & Reliable Bookings",
                desc: "Ensure accurate bookings and reliable operations every single time.",
              },
            ].map((f) => (
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
            <div className="lp-section-eyebrow">WHY GOTICKET?</div>
            <h2 className="lp-section-heading">
              Everything you need to run your transport business{" "}
              <span className="lp-text-green">smarter</span> and{" "}
              <span className="lp-text-green">better.</span>
            </h2>
            <p className="lp-why-sub">
              GoTicket helps transport operators streamline operations, increase efficiency,
              boost revenue and deliver a better experience for their customers.
            </p>
            <ul className="lp-why-list">
              {[
                "Centralized booking management",
                "Real-time reports and analytics",
                "Route, bus and staff management",
                "Multi-branch and role management",
                "Increase revenue and business growth",
                "24/7 support and system reliability",
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
              <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Road */}
                <rect x="0" y="150" width="320" height="30" fill="#e2e8f0"/>
                <rect x="0" y="162" width="320" height="3" fill="#cbd5e1"/>
                <rect x="30" y="162" width="30" height="3" fill="#fff"/>
                <rect x="130" y="162" width="30" height="3" fill="#fff"/>
                <rect x="230" y="162" width="30" height="3" fill="#fff"/>
                {/* Bus body */}
                <rect x="30" y="70" width="260" height="80" rx="12" fill="#1D9E75"/>
                {/* Windows */}
                <rect x="50" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="98" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="146" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="194" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                <rect x="242" y="85" width="35" height="28" rx="4" fill="#E1F5EE" opacity="0.9"/>
                {/* Door */}
                <rect x="242" y="113" width="35" height="37" rx="2" fill="#0F6E56"/>
                {/* Bumpers */}
                <rect x="22" y="120" width="12" height="30" rx="3" fill="#0F6E56"/>
                <rect x="286" y="120" width="12" height="30" rx="3" fill="#0F6E56"/>
                {/* Wheels */}
                <circle cx="80" cy="152" r="18" fill="#0c1220"/>
                <circle cx="80" cy="152" r="10" fill="#475569"/>
                <circle cx="80" cy="152" r="4" fill="#94a3b8"/>
                <circle cx="240" cy="152" r="18" fill="#0c1220"/>
                <circle cx="240" cy="152" r="10" fill="#475569"/>
                <circle cx="240" cy="152" r="4" fill="#94a3b8"/>
                {/* GoTicket text on bus */}
                <text x="160" y="68" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="DM Sans, sans-serif">GoTicket</text>
                {/* Headlights */}
                <rect x="290" y="88" width="14" height="8" rx="2" fill="#fbbf24"/>
                <rect x="290" y="112" width="14" height="6" rx="2" fill="#f97316" opacity="0.8"/>
                {/* Front grill */}
                <rect x="286" y="96" width="20" height="16" rx="2" fill="#0F6E56"/>
                <line x1="286" y1="104" x2="306" y2="104" stroke="#1D9E75" strokeWidth="1"/>
                <line x1="296" y1="96" x2="296" y2="112" stroke="#1D9E75" strokeWidth="1"/>
              </svg>
              {/* Stats floating cards */}
              <div className="lp-stat-float lp-stat-float--1">
                <div className="lp-stat-float-val">2,350+</div>
                <div className="lp-stat-float-label">Daily Bookings</div>
              </div>
              <div className="lp-stat-float lp-stat-float--2">
                <div className="lp-stat-float-val">500+</div>
                <div className="lp-stat-float-label">Operators</div>
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
              From WhatsApp message to confirmed ticket in minutes.
            </p>
          </div>
          <div className="lp-steps">
            {[
              { num:"01", title:"Customer Sends Request", desc:"Passenger messages GoTicket on WhatsApp with their route and travel date." },
              { num:"02", title:"Operator Creates Booking", desc:"Staff sees the request on the dashboard and creates the booking instantly." },
              { num:"03", title:"Payment Confirmed", desc:"Payment is collected at the park or processed online securely." },
              { num:"04", title:"Ticket Generated", desc:"A reference code is sent to the passenger via WhatsApp automatically." },
              { num:"05", title:"Trip Managed in Dashboard", desc:"Admin monitors seat fill, departure status and all bookings in real time." },
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

      {/* ══ STATS STRIP ═════════════════════════════════════════ */}
      <section className="lp-stats">
        <div className="lp-container">
          <div className="lp-section-center" style={{ marginBottom:"0.5rem" }}>
            <h3 className="lp-stats-title">
              Trusted by <span className="lp-text-green">Transport Operators</span> Nationwide
            </h3>
            <p className="lp-stats-sub">Powering operations. Connecting people. Driving growth.</p>
          </div>
          <div className="lp-stats-grid">
            {[
              { icon:"👥", value:"500+",   label:"Transport Operators" },
              { icon:"🚌", value:"10,000+", label:"Daily Bookings" },
              { icon:"🎟️", value:"1M+",    label:"Tickets Issued" },
              { icon:"📈", value:"98%",    label:"Customer Satisfaction" },
            ].map(s => (
              <div key={s.label} className="lp-stat-item">
                <div className="lp-stat-icon">{s.icon}</div>
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════ */}
      <section className="lp-cta" id="contact">
        <div className="lp-container lp-cta-inner">
          <div className="lp-cta-icon">🚀</div>
          <div className="lp-cta-text">
            <h2 className="lp-cta-heading">Ready to grow your transport business?</h2>
            <p className="lp-cta-sub">Join hundreds of transport operators already using GoTicket.</p>
          </div>
          <Link to="/login" className="lp-btn lp-btn-white lp-btn-lg">
            Get Started Free →
          </Link>
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
              Nigeria's digital transport booking platform.
            </p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Product</div>
              <button className="lp-footer-link" onClick={() => scrollTo("features")}>Features</button>
              <button className="lp-footer-link" onClick={() => scrollTo("how-it-works")}>How It Works</button>
              <button className="lp-footer-link" onClick={() => scrollTo("why")}>Why GoTicket</button>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Platform</div>
              <Link to="/login" className="lp-footer-link">Branch Admin Login</Link>
              <Link to="/sa/dashboard" className="lp-footer-link">Super Admin</Link>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Contact</div>
              <span className="lp-footer-link">support@goticket.ng</span>
              <span className="lp-footer-link">+234 800 000 0000</span>
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
