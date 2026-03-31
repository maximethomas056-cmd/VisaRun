import { createClient } from "@supabase/supabase-js";

// On désactive le bodyParser par défaut de Next.js
// car Stripe a besoin du corps brut (raw body) pour vérifier la signature
export const config = {
  api: { bodyParser: false },
};

// Fonction pour lire le corps brut de la requête
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  // On accepte seulement les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  // On vérifie que la requête vient bien de Stripe (sécurité)
  let event;
  try {
    const stripe = (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // On écoute uniquement l'événement "paiement réussi"
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email;

    if (email) {
      // Normaliser l'email en lowercase pour éviter les bugs de casse
      const normalizedEmail = email.toLowerCase().trim();
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      // Vérifie si l'email existe déjà
      const { data: existing } = await supabase
        .from("Customers")
        .select("email")
        .eq("email", normalizedEmail)
        .single();

      // Si l'email n'existe pas encore, on l'insère
      if (!existing) {
        const { error } = await supabase
          .from("Customers")
          .insert({ email: normalizedEmail });

        if (error) {
          console.error("Supabase error:", error);
          return res.status(500).json({ error: "Database error" });
        }
      }

      console.log("✅ Customer saved:", normalizedEmail);

      // Envoyer l'email directement via Resend (sans appel interne)
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "VisaRun <noreply@visarun.pro>",
            to: [normalizedEmail],
            subject: "🦘 You're in, mate — VisaRun access is ready",
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#1a7a4a;border-radius:16px;padding:36px 24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:56px;line-height:1;margin-bottom:14px;">🦘</div>
      <h1 style="color:#ffffff;font-size:26px;margin:0 0 8px;font-weight:700;">You're in, mate!</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Full access confirmed ✅</p>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <p style="color:#1a1a18;font-size:15px;margin:0 0 12px;line-height:1.6;">Hey mate 👋</p>
      <p style="color:#1a1a18;font-size:15px;margin:0 0 12px;line-height:1.6;">You just unlocked <strong>2,000+ direct employer contacts</strong> across Australia. No middleman. No recruitment fees.</p>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #e8e3d9;">
      <h2 style="color:#1a1a18;font-size:15px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em;">🔓 Access your contacts in 3 steps</h2>
      <div style="background:#f5f3ee;border-radius:10px;padding:12px 16px;margin-bottom:8px;">
        <span style="font-size:18px;margin-right:12px;">1️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Go to <a href="https://www.visarun.pro" style="color:#1a7a4a;font-weight:700;text-decoration:none;">www.visarun.pro</a></span>
      </div>
      <div style="background:#f5f3ee;border-radius:10px;padding:12px 16px;margin-bottom:8px;">
        <span style="font-size:18px;margin-right:12px;">2️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Click the <strong>"Find Work"</strong> tab</span>
      </div>
      <div style="background:#edf7f1;border:1px solid #b8e0c8;border-radius:10px;padding:12px 16px;">
        <span style="font-size:18px;margin-right:12px;">3️⃣</span>
        <span style="color:#1a1a18;font-size:14px;">Click <strong>Unlock</strong> and enter: <span style="display:inline-block;margin-top:6px;background:#1a7a4a;color:#fff;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:700;">${normalizedEmail}</span></span>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://www.visarun.pro" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">🔓 Open VisaRun now</a>
    </div>
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
    <div style="background:#ffffff;border-radius:16px;padding:20px 24px;margin-bottom:24px;border:1px solid #e8e3d9;text-align:center;">
      <p style="color:#5a5850;font-size:14px;margin:0 0 10px;">Questions? We respond fast 👋</p>
      <a href="mailto:visarunpro@gmail.com" style="display:inline-block;background:#f5f3ee;border:1px solid #e8e3d9;border-radius:8px;padding:8px 16px;color:#1a1a18;text-decoration:none;font-weight:600;font-size:13px;">📧 visarunpro@gmail.com</a>
    </div>
    <div style="text-align:center;color:#9a9488;font-size:12px;">
      <p style="margin:0 0 6px;">Good luck out there 🇦🇺</p>
      <p style="margin:0;"><a href="https://www.visarun.pro" style="color:#1a7a4a;text-decoration:none;font-weight:600;">visarun.pro</a> · Made for Working Holiday backpackers</p>
    </div>
  </div>
</body>
</html>`,
          }),
        });
        const resendData = await resendRes.json();
        if (!resendRes.ok) {
          console.error("Resend error:", resendData);
        } else {
          console.log("✅ Email sent to:", normalizedEmail);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}
