import { useState, useEffect } from "react";
import Head from "next/head";
import VisaRun from "../components/VisaRun";
import JobFinder from "../components/JobFinder";

const C = {
  green: "#1a7a4a",
  greenBg: "#edf7f1",
  greenBorder: "#b8e0c8",
  border: "#e8e3d9",
  text: "#1a1a18",
  textFaint: "#9a9488",
  bg: "#f5f3ee",
  bgCard: "#ffffff",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("visa");
  const [welcomeBanner, setWelcomeBanner] = useState(false);

  const tabs = [
    { id: "visa",  icon: "🦘", label: "My Visa" },
    { id: "jobs",  icon: "🔍", label: "Find Work" },
  ];

  useEffect(() => {
    // Scroll top au chargement
    window.scrollTo(0, 0);

    // Vérifier si client payant pour afficher le banner
    try {
      const paidEmail = localStorage.getItem("vr_paid_email");
      if (paidEmail) setWelcomeBanner(true);
    } catch {}
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Head>
        <title>VisaRun — Track Your Regional Work & Stay Longer in Australia</title>
        <meta name="description" content="Free payslip tracker for Working Holiday backpackers. Count your days of regional work, find direct employer contacts across Australia. No middleman." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="VisaRun — Track Your Regional Work & Stay Longer in Australia" />
        <meta property="og:description" content="Free payslip tracker for Working Holiday backpackers. Count your regional work days, find direct employer contacts. No middleman." />
        <meta property="og:url" content="https://www.visarun.pro" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.visarun.pro/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VisaRun — Track Your Regional Work & Stay Longer in Australia" />
        <meta name="twitter:description" content="Free payslip tracker for Working Holiday backpackers. Count your regional work days, find direct employer contacts. No middleman." />
        <meta name="twitter:image" content="https://www.visarun.pro/og-image.png" />
      </Head>

      {/* ── Welcome banner pour clients payants ── */}
      {welcomeBanner && (
        <div style={{
          background: C.greenBg,
          borderBottom: `1px solid ${C.greenBorder}`,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔓</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: C.green }}>
              Full access unlocked — tap Find Work to contact employers directly
            </span>
          </div>
          <button
            onClick={() => setWelcomeBanner(false)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textFaint, fontSize: 16, padding: 0, lineHeight: 1 }}
          >✕</button>
        </div>
      )}

      {/* ── Sticky top tabs ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          display: "flex",
          maxWidth: 600,
          margin: "0 auto",
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "13px 0 11px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                <span style={{
                  fontSize: 20,
                  lineHeight: 1,
                  filter: active ? "none" : "grayscale(50%)",
                  opacity: active ? 1 : 0.55,
                  transition: "all 0.2s",
                  transform: active ? "scale(1.08)" : "scale(1)",
                }}>{tab.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: active ? C.green : C.textFaint,
                  fontFamily: "'DM Sans',sans-serif",
                  transition: "color 0.2s",
                }}>{tab.label.toUpperCase()}</span>

                {/* Active underline */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: active ? 36 : 0,
                  height: 2.5,
                  background: C.green,
                  borderRadius: "2px 2px 0 0",
                  transition: "width 0.25s cubic-bezier(.34,1.56,.64,1)",
                }}/>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div>
        {activeTab === "visa" && <VisaRun onSwitchTab={setActiveTab}/>}
        {activeTab === "jobs" && <JobFinder onSwitchTab={setActiveTab}/>}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        background: C.bgCard,
        padding: "16px 20px",
        textAlign: "center",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 12,
          color: C.textFaint,
        }}>
          <span>🦘 VisaRun · Made for WHV backpackers</span>
          <span style={{ color: C.border }}>·</span>
          <a href="/legal" style={{ color: C.textFaint, textDecoration: "none" }}>Terms & Privacy</a>
          <span style={{ color: C.border }}>·</span>
          <a href="mailto:visarunpro@gmail.com" style={{ color: C.textFaint, textDecoration: "none" }}>visarunpro@gmail.com</a>
        </div>
      </div>

    </div>
  );
}
