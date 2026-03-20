import { useState } from "react";
import VisaRun from "../components/VisaRun";
import JobFinder from "../components/JobFinder";

export default function App() {
  const [activeTab, setActiveTab] = useState("visa");

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ paddingBottom: 70 }}>
        {activeTab === "visa" && <VisaRun />}
        {activeTab === "jobs" && <JobFinder />}
      </div>

      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#ffffff", borderTop: "1px solid #e8e3d9",
        display: "flex", zIndex: 1000,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.07)",
      }}>
        {[
          { id: "visa", icon: "🦘", label: "Mon Visa" },
          { id: "jobs", icon: "🔍", label: "Trouver un job" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px 0 12px", border: "none", cursor: "pointer",
            background: "transparent", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3,
            borderTop: `2px solid ${activeTab === tab.id ? "#1a7a4a" : "transparent"}`,
          }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
              color: activeTab === tab.id ? "#1a7a4a" : "#9a9488",
              fontFamily: "'DM Sans',sans-serif",
            }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
