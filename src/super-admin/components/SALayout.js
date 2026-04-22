import React, { useState } from "react";
import SASidebar from "./SASidebar";
import SAHeader  from "./SAHeader";

export default function SALayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sa-layout">
      <SASidebar open={open} setOpen={setOpen} />

      <div className="sa-content">
        <SAHeader onMenuClick={() => setOpen(!open)} />

        <div className="sa-page-body">
          {children}
        </div>
      </div>
    </div>
  );
}