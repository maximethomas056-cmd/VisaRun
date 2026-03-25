// Ce fichier envoie un email de confirmation après paiement via Resend
// Expéditeur : noreply@visarun.pro

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VisaRun <noreply@visarun.pro>",
        to: [email],
        subject: "🦘 You're in, mate — VisaRun access is ready",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header vert -->
    <div style="background:linear-gradient(135deg,#1a7a4a,#0d3d22);border-radius:16px;padding:36px 24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:56px;line-height:1;margin-bottom:14px;">🦘</div>
      <h1 style="color:#ffffff;font-size:26px;margin:0 0 8px;font-weight:700;letter-spacing:-0.02em;">You're in, mate!</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Full access confirmed ✅</p>
    </div>

    <!-- Intro -->
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <p style="color:#1a1a18;font-size:15px;margin:0 0 12px;line-height:1.6;">Hey mate 👋</p>
      <p style="color:#1a1a18;font-size:15px;margin:0 0 12px;line-height:1.6;">
        You just unlocked <strong>2,000+ direct employer contacts</strong> across Australia.<br/>
        No middleman. No recruitment fees. Call them directly and start working faster.
      </p>
    </div>

    <!-- 3 étapes -->
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <h2 style="color:#1a1a18;font-size:15px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em;">🔓 Access your contacts in 3 steps</h2>
      
      <div style="background:#f5f3ee;border-radius:10px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;">
        <span style="font-size:18px;margin-right:12px;">1️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Go to <a href="https://www.visarun.pro" style="color:#1a7a4a;font-weight:700;text-decoration:none;">www.visarun.pro</a></span>
      </div>
      <div style="background:#f5f3ee;border-radius:10px;padding:12px 16px;margin-bottom:8px;">
        <span style="font-size:18px;margin-right:12px;">2️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Click the <strong>"Find Work"</strong> tab</span>
      </div>
      <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:10px;padding:12px 16px;margin-bottom:0;">
        <span style="font-size:18px;margin-right:12px;">3️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Click <strong>Unlock</strong> and enter exactly this email:<br/>
          <span style="display:inline-block;margin-top:6px;background:#1a7a4a;color:#fff;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:0.02em;">${email}</span>
        </span>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://www.visarun.pro" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.01em;box-shadow:0 4px 16px rgba(26,122,74,0.3);">
        🔓 Open VisaRun now
      </a>
    </div>

    <!-- Ce qui est débloqué -->
    <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:16px;padding:24px;margin-bottom:16px;">
      <h2 style="color:#1a7a4a;font-size:13px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.1em;">✅ What you unlocked</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">📞</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">Direct phone numbers</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">✉️</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">Recruitment emails</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">🌐</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">Official websites</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">📍</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;">QLD · WA · NSW · VIC · TAS · NT · SA</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#1a1a18;">🔑</td><td style="padding:5px 0;font-size:14px;color:#1a1a18;"><strong>Lifetime access</strong> — pay once, keep forever</td></tr>
      </table>
    </div>

    <!-- Pro tip -->
    <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:16px;padding:20px 24px;margin-bottom:16px;">
      <h2 style="color:#b45309;font-size:13px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">💡 Pro tip</h2>
      <p style="color:#1a1a18;font-size:14px;margin:0;line-height:1.6;">
        <strong>Call directly — don't just email.</strong><br/>
        Farm managers respect backpackers who make the effort. A 2-minute phone call beats 10 unanswered emails.
      </p>
    </div>

    <!-- Questions -->
    <div style="background:#ffffff;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #e8e3d9;text-align:center;">
      <h2 style="color:#1a1a18;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.1em;">❓ Need help?</h2>
      <p style="color:#5a5850;font-size:14px;margin:0 0 14px;">Find us on social media — we respond fast 👋</p>
      <p style="margin:0 0 8px;font-size:14px;">
        <a href="https://instagram.com/visarun" style="display:inline-block;background:#f5f3ee;border:1px solid #e8e3d9;border-radius:8px;padding:8px 16px;color:#1a1a18;text-decoration:none;font-weight:600;font-size:13px;">
          📸 Instagram @visarun
        </a>
      </p>
      <p style="margin:0;font-size:14px;">
        <a href="https://facebook.com/visarun" style="display:inline-block;background:#f5f3ee;border:1px solid #e8e3d9;border-radius:8px;padding:8px 16px;color:#1a1a18;text-decoration:none;font-weight:600;font-size:13px;">
          👥 Facebook VisaRun
        </a>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#9a9488;font-size:12px;padding:0 16px;">
      <p style="margin:0 0 6px;">Good luck out there 🇦🇺</p>
      <p style="margin:0 0 6px;font-weight:600;color:#5a5850;">— The VisaRun team</p>
      <p style="margin:0;">
        <a href="https://www.visarun.pro" style="color:#1a7a4a;text-decoration:none;font-weight:600;">visarun.pro</a>
        · Made for Working Holiday backpackers
      </p>
    </div>

  </div>
</body>
</html>
        `,
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
