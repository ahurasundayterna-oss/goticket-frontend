import React from "react";
import SASidebar from "./SASidebar";
import SAHeader  from "./SAHeader";
import "../styles/sa-globals.css";

export default function SALayout({ children }) {
  return (
    <div className="sa-layout">
      <SASidebar />
      <div className="sa-content">
        <SAHeader />
        <div className="sa-page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
