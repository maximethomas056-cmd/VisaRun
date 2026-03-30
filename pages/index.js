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


const FAQ_ITEMS = [
  {
    category: "Free & Paid",
    icon: "🆓",
    questions: [
      {
        q: "Is VisaRun really free?",
        a: "Yes — the payslip tracker, day counter, and visa progress are 100% free, forever. No credit card required. You only pay if you want access to the full employer contact database."
      },
      {
        q: "What do I get with the $24.90 payment?",
        a: "You unlock 2,000+ direct employer contacts across Australia — phone numbers, recruitment emails, and official websites. One-time payment, lifetime access. No subscription, no hidden fees."
      },
      {
        q: "Is it a subscription or one-time?",
        a: "One-time only. Pay once, keep access forever. We'll never charge you again."
      }
    ]
  },
  {
    category: "Payslip scanner",
    icon: "📄",
    questions: [
      {
        q: "Which payslip formats work?",
        a: "PDF and photos (screenshot or camera). Works with Xero, MYOB, Employment Hero, KeyPay, Payroller, QuickBooks and most Australian payroll systems."
      },
      {
        q: "Is my data safe? Where is it stored?",
        a: "Your payslip data never leaves your device — it's stored locally in your browser. We don't store your payslips on our servers. Only your email (if you've paid) is stored securely in our database."
      },
      {
        q: "The AI extracted wrong data — what do I do?",
        a: "You can edit every field before saving — always review the extracted details. Never save without checking. If something looks off, correct it manually."
      }
    ]
  },
  {
    category: "Day calculation",
    icon: "📅",
    questions: [
      {
        q: "How are eligible days calculated?",
        a: "We estimate based on your hours worked and pay period length. The formula follows Australian immigration guidelines for regional work. Always verify your final count with an official migration agent or homeaffairs.gov.au."
      },
      {
        q: "Does VisaRun guarantee my visa eligibility?",
        a: "No — VisaRun provides estimates to help you track your progress. It is not an official immigration tool. Always verify with the Australian Department of Home Affairs before applying for your second or third year visa."
      }
    ]
  },
  {
    category: "Job Finder",
    icon: "🔍",
    questions: [
      {
        q: "Are these employers currently hiring?",
        a: "We can't guarantee current availability — farm and regional hiring changes constantly. The database gives you direct contacts so you can call or email them yourself and get a real answer fast."
      },
      {
        q: "How do I contact employers?",
        a: "Unlock the full database, then call directly — don't just email. Farm managers respond much faster to phone calls. A 2-minute call beats 10 unanswered emails every time."
      }
    ]
  }
];

function FAQ() {
  const [isOpen, setIsOpen] = useState(false);
  const [openQ, setOpenQ] = useState(null);
  const allQuestions = FAQ_ITEMS.flatMap(cat => cat.questions.map(q => ({...q, cat: cat.category, icon: cat.icon})));

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 48px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Tiroir principal */}
      <div style={{ background: "#ffffff", border: `1px solid ${isOpen ? "#b8e0c8" : "#e8e3d9"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
        <button
          onClick={() => setIsOpen(p => !p)}
          style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textAlign: "left" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>❓</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#1a1a18" }}>Frequently asked questions</div>
              <div style={{ fontSize: 12, color: "#9a9488", marginTop: 2 }}>Everything you need to know about VisaRun</div>
            </div>
          </div>
          <span style={{ fontSize: 20, color: isOpen ? "#1a7a4a" : "#9a9488", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s, color 0.2s", flexShrink: 0, lineHeight: 1 }}>+</span>
        </button>
        {isOpen && (
          <div style={{ borderTop: "1px solid #edf7f1", padding: "12px 16px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {allQuestions.map((item, i) => {
                const open = openQ === i;
                return (
                  <div key={i} style={{ background: "#f5f3ee", borderRadius: 10, overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenQ(open ? null : i)}
                      style={{ width: "100%", padding: "11px 14px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left" }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", lineHeight: 1.4 }}>{item.q}</span>
                      <span style={{ fontSize: 16, color: open ? "#1a7a4a" : "#9a9488", transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>+</span>
                    </button>
                    {open && (
                      <div style={{ padding: "0 14px 12px", fontSize: 13, color: "#5a5850", lineHeight: 1.7 }}>{item.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#edf7f1", border: "1px solid #b8e0c8", borderRadius: 10, padding: "12px 16px", textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, color: "#1a7a4a" }}>
                Still have questions?{" "}
                <a href="mailto:visarunpro@gmail.com" style={{ color: "#1a7a4a", fontWeight: 700, textDecoration: "none" }}>visarunpro@gmail.com</a>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
        boxShadow: "0 1px 12px rgba(0,0,0,0.08)",
        transition: "background 0.3s",
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
                  opacity: active ? 1 : 0.5,
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

      {/* ── FAQ ── */}
      <FAQ />

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
