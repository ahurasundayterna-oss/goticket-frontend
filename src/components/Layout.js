import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/globals.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Header />
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
