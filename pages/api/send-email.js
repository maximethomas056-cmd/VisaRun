// Ce fichier envoie un email de confirmation après paiement via Resend
// Protégé par un token interne — seul webhook.js peut l'appeler

// ── Mettre à jour ces valeurs quand la DB grandit via Apify ──────────────
const EMPLOYER_COUNT = "2,000+";
const DB_LAST_UPDATED = "April 2026";
// ─────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vérification du token interne — seul webhook.js connaît ce secret
  const internalToken = req.headers["x-internal-token"];
  if (!internalToken || internalToken !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VisaRun <noreply@visarun.pro>",
        reply_to: "visarunpro@gmail.com",
        to: [normalizedEmail],
        subject: "Your VisaRun access is confirmed",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="background:#1a7a4a;border-radius:16px;padding:36px 24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;line-height:1;margin-bottom:14px;">🦘</div>
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;font-weight:700;letter-spacing:-0.01em;">You're in, mate!</h1>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">Payment confirmed — lifetime access granted</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <p style="color:#1a1a18;font-size:15px;margin:0 0 10px;line-height:1.6;">Hey 👋</p>
      <p style="color:#1a1a18;font-size:15px;margin:0;line-height:1.6;">
        You now have access to <strong>${EMPLOYER_COUNT} direct employer contacts</strong> across Australia — phone numbers, emails, Instagram and Facebook.<br/><br/>
        Call them directly, skip the agencies and start working faster.
      </p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <h2 style="color:#1a1a18;font-size:13px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em;">Access your contacts in 3 steps</h2>
      <div style="background:#f5f3ee;border-radius:10px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:18px;">1️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Go to <a href="https://www.visarun.pro" style="color:#1a7a4a;font-weight:700;text-decoration:none;">www.visarun.pro</a></span>
      </div>
      <div style="background:#f5f3ee;border-radius:10px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:18px;">2️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Tap the <strong>Find Work</strong> tab</span>
      </div>
      <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:10px;padding:12px 16px;display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:18px;">3️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Tap <strong>Sign in</strong> and enter exactly this email:<br/>
          <span style="display:inline-block;margin-top:8px;background:#1a7a4a;color:#fff;padding:5px 14px;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:0.02em;">${normalizedEmail}</span>
        </span>
      </div>
    </div>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://www.visarun.pro" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
        Open VisaRun now
      </a>
    </div>

    <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:16px;padding:24px;margin-bottom:16px;">
      <h2 style="color:#1a7a4a;font-size:12px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.1em;">What you have access to</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;width:28px;">📞</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">Direct phone numbers</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">✉️</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">Recruitment emails</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">📸</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">Instagram profiles</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">📍</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">QLD · WA · NSW · VIC · TAS · NT · SA</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">🔑</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;"><strong>Lifetime access</strong> — pay once, keep forever</td></tr>
      </table>
    </div>

    <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:16px;padding:20px 24px;margin-bottom:16px;">
      <h2 style="color:#b45309;font-size:12px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Pro tip</h2>
      <p style="color:#1a1a18;font-size:14px;margin:0;line-height:1.6;">
        <strong>Call directly — don't just email.</strong> Farm managers respect backpackers who make the effort. A 2-minute call beats 10 unanswered emails.
      </p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #e8e3d9;text-align:center;">
      <p style="color:#5a5850;font-size:14px;margin:0 0 10px;">Any questions? Reply to this email or reach out directly.</p>
      <a href="mailto:visarunpro@gmail.com" style="display:inline-block;background:#f5f3ee;border:1px solid #e8e3d9;border-radius:8px;padding:8px 16px;color:#1a1a18;text-decoration:none;font-weight:600;font-size:13px;">visarunpro@gmail.com</a>
    </div>

    <div style="text-align:center;color:#9a9488;font-size:12px;padding:0 16px;">
      <p style="margin:0 0 4px;">Good luck out there 🇦🇺</p>
      <p style="margin:0 0 4px;font-weight:600;color:#5a5850;">— The VisaRun team</p>
      <p style="margin:0;"><a href="https://www.visarun.pro" style="color:#1a7a4a;text-decoration:none;font-weight:600;">visarun.pro</a> · Made for Working Holiday backpackers</p>
    </div>

  </div>
</body>
</html>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ error: "Failed to send email" });
    }
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error("Send email error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
