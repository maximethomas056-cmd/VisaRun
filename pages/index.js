import { useState } from "react";
import VisaRun from "../components/VisaRun";
import JobFinder from "../components/JobFinder";

export default function App() {
  const [activeTab, setActiveTab] = useState("visa");

  const tabs = [
    { id: "visa",  icon: "🦘", label: "My Visa" },
    { id: "jobs",  icon: "🔍", label: "Find a Job" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ee" }}>
      <div style={{ paddingBottom: 72 }}>
        {activeTab === "visa" && <VisaRun />}
        {activeTab === "jobs" && <JobFinder />}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.97)",
        borderTop: "1px solid #e8e3d9",
        display: "flex",
        zIndex: 1000,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.08)",
        backdropFilter: "blur(12px)",
      }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px 0 13px",
                border: "none",
                cursor: "pointer",
                background: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                position: "relative",
              }}
            >
              {/* Active indicator */}
              <div style={{
                position: "absolute",
                top: 0, left: "50%",
                transform: "translateX(-50%)",
                width: active ? 32 : 0,
                height: 2,
                background: "#1a7a4a",
                borderRadius: "0 0 2px 2px",
                transition: "width 0.25s cubic-bezier(.34,1.56,.64,1)",
              }}/>
              <span style={{
                fontSize: 22,
                filter: active ? "none" : "grayscale(40%)",
                opacity: active ? 1 : 0.6,
                transition: "all 0.2s",
                transform: active ? "scale(1.1)" : "scale(1)",
              }}>{tab.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: active ? "#1a7a4a" : "#9a9488",
                fontFamily: "'DM Sans',sans-serif",
                transition: "color 0.2s",
              }}>{tab.label.toUpperCase()}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
