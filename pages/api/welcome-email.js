// Route serveur pour envoyer le mail "Welcome back" quand un client se reconnecte
// Inclut un throttle 7 jours : on ne spam pas le client à chaque connexion

// ── Mettre à jour ces valeurs quand la DB grandit via Apify ──────────────
const EMPLOYER_COUNT = "2,000+";
const DB_LAST_UPDATED = "April 2026";
// ─────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

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

  // ── Throttle 7 jours ──────────────────────────────────────────────────────
  // On vérifie dans Supabase quand le dernier welcome email a été envoyé.
  // Si c'était il y a moins de 7 jours, on skip silencieusement.
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: customer } = await supabase
    .from("Customers")
    .select("last_welcome_sent")
    .eq("email", normalizedEmail)
    .single();

  if (customer?.last_welcome_sent) {
    const lastSent = new Date(customer.last_welcome_sent);
    const daysSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) {
      return res.status(200).json({ skipped: true, reason: "throttled" });
    }
  }

  // ── Envoi de l'email ──────────────────────────────────────────────────────
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
        subject: "Your VisaRun contacts are ready",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="background:#1a7a4a;border-radius:16px;padding:36px 24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;line-height:1;margin-bottom:14px;">🦘</div>
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;font-weight:700;letter-spacing:-0.01em;">Good to see you back</h1>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">Your lifetime access is still active</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <p style="color:#1a1a18;font-size:15px;margin:0 0 10px;line-height:1.6;">Hey 👋</p>
      <p style="color:#1a1a18;font-size:15px;margin:0;line-height:1.6;">
        Your <strong>${EMPLOYER_COUNT} employer contacts</strong> are ready — phone numbers, emails, Instagram and Facebook across all of Australia.<br/><br/>
        Head to the <strong>Find Work</strong> tab and start reaching out directly.
      </p>
    </div>

    <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:16px;padding:24px;margin-bottom:16px;">
      <h2 style="color:#1a7a4a;font-size:12px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.1em;">Tips to land a job faster</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;vertical-align:top;width:28px;">📞</td>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;"><strong>Call, don't just email.</strong> Farm managers pick up — a 2-minute call beats 10 unanswered emails.</td>
        </tr>
        <tr>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;vertical-align:top;">⏰</td>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;"><strong>Call before 9am or after 4pm.</strong> They're out in the field during the day.</td>
        </tr>
        <tr>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;vertical-align:top;">📍</td>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;"><strong>Use the distance filter.</strong> Find employers within 50–100km of where you are right now.</td>
        </tr>
        <tr>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;vertical-align:top;">📸</td>
          <td style="padding:7px 0;font-size:14px;color:#1a1a18;"><strong>Check their Instagram.</strong> Many farms post jobs on social before anywhere else.</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://www.visarun.pro" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
        Find Work now
      </a>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #e8e3d9;text-align:center;">
      <p style="color:#5a5850;font-size:14px;margin:0 0 10px;">Any questions? Reply to this email or reach out directly.</p>
      <a href="mailto:visarunpro@gmail.com" style="display:inline-block;background:#f5f3ee;border:1px solid #e8e3d9;border-radius:8px;padding:8px 16px;color:#1a1a18;text-decoration:none;font-weight:600;font-size:13px;">visarunpro@gmail.com</a>
    </div>

    <div style="text-align:center;color:#9a9488;font-size:12px;padding:0 16px;">
      <p style="margin:0 0 4px;">Good luck out there 🇦🇺</p>
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

    // ── Mettre à jour last_welcome_sent dans Supabase ──────────────────────
    // On enregistre la date d'envoi pour le throttle des prochaines connexions
    await supabase
      .from("Customers")
      .update({ last_welcome_sent: new Date().toISOString() })
      .eq("email", normalizedEmail);

    return res.status(200).json({ sent: true });

  } catch (err) {
    console.error("Welcome email error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
