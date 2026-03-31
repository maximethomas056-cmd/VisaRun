// Route serveur pour envoyer le mail "Welcome back" quand un client se reconnecte
// Appelée depuis JobFinder après vérification d'accès

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
        to: [normalizedEmail],
        subject: "🦘 Welcome back — your contacts are ready",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="background:linear-gradient(135deg,#1a7a4a,#0d3d22);border-radius:16px;padding:36px 24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:56px;line-height:1;margin-bottom:14px;">🦘</div>
      <h1 style="color:#ffffff;font-size:26px;margin:0 0 8px;font-weight:700;">Welcome back, mate!</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Your full access is still active ✅</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <p style="color:#1a1a18;font-size:15px;margin:0 0 12px;line-height:1.6;">Hey mate 👋</p>
      <p style="color:#1a1a18;font-size:15px;margin:0;line-height:1.6;">
        You just signed back in to VisaRun. Your <strong>2,000+ employer contacts</strong> are ready — go find your next job.
      </p>
    </div>

    <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:16px;padding:24px;margin-bottom:16px;">
      <h2 style="color:#1a7a4a;font-size:13px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.1em;">💡 Tips to land a job faster</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;font-size:14px;color:#1a1a18;vertical-align:top;">📞</td><td style="padding:6px 0;font-size:14px;color:#1a1a18;"><strong>Call, don't email.</strong> Farm managers pick up the phone — 2 minutes beats 10 unanswered emails.</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#1a1a18;vertical-align:top;">📍</td><td style="padding:6px 0;font-size:14px;color:#1a1a18;"><strong>Search by city.</strong> Use the distance slider to find employers within 50-100km of where you are.</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#1a1a18;vertical-align:top;">📸</td><td style="padding:6px 0;font-size:14px;color:#1a1a18;"><strong>Check their Instagram.</strong> Many farms post jobs directly on social — follow them to stay ahead.</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#1a1a18;vertical-align:top;">⏰</td><td style="padding:6px 0;font-size:14px;color:#1a1a18;"><strong>Call before 9am or after 4pm.</strong> Farm managers are in the field during the day.</td></tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://www.visarun.pro" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(26,122,74,0.3);">
        🔍 Find Work now
      </a>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #e8e3d9;text-align:center;">
      <p style="color:#5a5850;font-size:14px;margin:0 0 10px;">Questions? We respond fast 👋</p>
      <a href="mailto:visarunpro@gmail.com" style="display:inline-block;background:#f5f3ee;border:1px solid #e8e3d9;border-radius:8px;padding:8px 16px;color:#1a1a18;text-decoration:none;font-weight:600;font-size:13px;">📧 visarunpro@gmail.com</a>
    </div>

    <div style="text-align:center;color:#9a9488;font-size:12px;padding:0 16px;">
      <p style="margin:0 0 6px;">Good luck out there 🇦🇺</p>
      <p style="margin:0;"><a href="https://www.visarun.pro" style="color:#1a7a4a;text-decoration:none;font-weight:600;">visarun.pro</a> · Made for Working Holiday backpackers</p>
    </div>

  </div>
</body>
</html>`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Resend welcome-email error:", data);
      return res.status(500).json({ error: "Failed to send email" });
    }
    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error("Welcome email error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
