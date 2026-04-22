import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/globals.css";

function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`layout ${open ? "sidebar-open" : ""}`}>
      <Sidebar open={open} setOpen={setOpen} />

      <div className="content">
        <Header onMenuClick={() => setOpen(!open)} />

        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;