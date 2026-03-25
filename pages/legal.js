import Head from "next/head";
import { useState } from "react";

const C = {
  green: "#1a7a4a",
  greenBg: "#edf7f1",
  greenBorder: "#b8e0c8",
  bg: "#f5f3ee",
  bgCard: "#ffffff",
  border: "#e8e3d9",
  text: "#1a1a18",
  textMid: "#5a5850",
  textFaint: "#9a9488",
};

const LAST_UPDATED = "March 2026";

const sections = {
  terms: [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using VisaRun (visarun.pro), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. VisaRun is an independent tool designed to help Working Holiday visa holders track their regional work days and find employer contacts in Australia.`
    },
    {
      title: "2. Description of Service",
      content: `VisaRun provides:
• A free payslip tracker to help estimate eligible regional work days for Australian Working Holiday visas (subclass 417 and 462)
• A database of employer contacts across Australia for regional work
• AI-powered payslip scanning to extract work period information

VisaRun is a practical tool to help you keep a clearer record of your eligible work. It is not affiliated with, endorsed by, or connected to the Australian Department of Home Affairs or any government authority.`
    },
    {
      title: "3. Important Disclaimer",
      content: `VisaRun provides estimates only. The day calculations shown in the app are based on information extracted from your payslips and should not be considered as official confirmation of your visa eligibility.

Always verify your final eligibility with official immigration guidance from the Australian Department of Home Affairs (homeaffairs.gov.au). VisaRun accepts no liability for decisions made based on the information provided by this tool.`
    },
    {
      title: "4. Premium Access",
      content: `Access to full employer contact details requires a one-time payment of $24.90 AUD. This grants lifetime access to the employer database. Payments are processed securely via Stripe. 

Refunds are not available once access has been granted, as the service is immediately delivered upon payment. If you experience any issues with your purchase, please contact us.`
    },
    {
      title: "5. User Responsibilities",
      content: `You agree to:
• Use VisaRun for lawful purposes only
• Not share your paid access with others (though we cannot technically prevent this)
• Review all extracted payslip data before saving — you are responsible for verifying accuracy
• Keep your own official records of hours, dates, and employer details
• Not attempt to reverse engineer, copy, or redistribute the employer database`
    },
    {
      title: "6. Intellectual Property",
      content: `The VisaRun platform, including its design, code, and employer database, is the property of VisaRun. The employer contact information is compiled from publicly available sources. You may use this information to contact employers for work purposes only.`
    },
    {
      title: "7. Limitation of Liability",
      content: `VisaRun is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of this service, including but not limited to visa application outcomes, employment decisions, or data inaccuracies. Use this tool as one resource among many, and always consult official sources for immigration advice.`
    },
    {
      title: "8. Changes to Terms",
      content: `We reserve the right to modify these terms at any time. Continued use of VisaRun after changes constitutes acceptance of the new terms. We will update the "Last Updated" date when changes are made.`
    },
    {
      title: "9. Contact",
      content: `For questions about these terms, email us at visarunpro@gmail.com or reach out via our social media channels.`
    }
  ],
  privacy: [
    {
      title: "1. Information We Collect",
      content: `VisaRun collects minimal personal data:

• Email address — collected when you make a purchase via Stripe, used to grant and verify access
• Payslip data — processed temporarily by our AI to extract work information; we do not permanently store your payslip files or their full contents
• Usage data — anonymous analytics via PostHog (page views, feature usage) to improve the service
• Local storage — your payslip entries are stored locally on your device, not on our servers`
    },
    {
      title: "2. How We Use Your Information",
      content: `Your email address is used solely to:
• Verify your paid access to employer contacts
• Send you a one-time confirmation email after purchase

We do not sell your data. We do not send marketing emails. We do not share your information with third parties except as described below.`
    },
    {
      title: "3. Third-Party Services",
      content: `We use the following services:
• Stripe — payment processing (subject to Stripe's Privacy Policy)
• Supabase — secure database to store verified customer emails
• Resend — transactional email delivery
• PostHog — anonymous usage analytics
• Anthropic Claude AI — payslip text processing (data is not retained by Anthropic for training)

Each of these services has their own privacy policies which govern their use of your data.`
    },
    {
      title: "4. Data Storage & Security",
      content: `Your payslip entries are stored locally on your device using browser localStorage. They never leave your device unless you explicitly upload a payslip for AI scanning, in which case the text is processed and immediately discarded.

Your email address is stored securely in our database (Supabase) and is only used to verify access. We use industry-standard security practices.`
    },
    {
      title: "5. Your Rights",
      content: `You have the right to:
• Access the data we hold about you (your email address)
• Request deletion of your data — contact us and we will remove your email from our database within 30 days
• Opt out of analytics — you can disable JavaScript or use a browser extension to block PostHog

Since payslip data is stored locally on your device, you can delete it at any time by clearing your browser's localStorage.`
    },
    {
      title: "6. Cookies & Local Storage",
      content: `VisaRun uses browser localStorage (not cookies) to store:
• Your payslip entries and work history
• Your visa goal setting (88 or 179 days)
• Your saved employer favourites
• Whether you have paid access (your email)

This data stays on your device and is not transmitted to our servers.`
    },
    {
      title: "7. Children's Privacy",
      content: `VisaRun is not intended for use by anyone under 18 years of age. We do not knowingly collect personal information from minors.`
    },
    {
      title: "8. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. We will update the "Last Updated" date at the top of this page when changes are made.`
    },
    {
      title: "9. Contact",
      content: `For privacy-related requests or questions, email us at visarunpro@gmail.com`
    }
  ]
};

export default function Legal() {
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Head>
        <title>Legal — VisaRun</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Header */}
      <div style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🦘</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.text }}>VisaRun</span>
        </a>
        <span style={{ color: C.textFaint, fontSize: 14 }}>/ Legal</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
            Legal Information
          </h1>
          <p style={{ color: C.textFaint, fontSize: 13, margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, gap: 4, marginBottom: 28, width: "fit-content" }}>
          {[["terms", "Terms of Service"], ["privacy", "Privacy Policy"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                background: activeTab === id ? C.green : "transparent",
                color: activeTab === id ? "#fff" : C.textFaint,
                transition: "all 0.2s"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections[activeTab].map((section, i) => (
            <div
              key={i}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "20px 24px",
              }}
            >
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: C.green,
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}>
                {section.title}
              </h2>
              <p style={{
                color: C.textMid,
                fontSize: 14,
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: "pre-line"
              }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 28, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 12, padding: "16px 20px" }}>
          <p style={{ color: C.green, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            ⚠️ <strong>Important reminder:</strong> VisaRun provides estimates to help you track your progress. Always verify your final visa eligibility with official Australian immigration guidance at{" "}
            <a href="https://homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" style={{ color: C.green, fontWeight: 600 }}>homeaffairs.gov.au</a>
          </p>
        </div>

        {/* Back button */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: C.textFaint, fontSize: 13, textDecoration: "none",
            fontWeight: 500
          }}>
            ← Back to VisaRun
          </a>
        </div>

      </div>
    </div>
  );
}
