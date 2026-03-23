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
      // On connecte à Supabase avec la clé service (accès total)
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      // Vérifie si l'email existe déjà
      const { data: existing } = await supabase
        .from("customers")
        .select("email")
        .eq("email", email)
        .single();

      // Si l'email n'existe pas encore, on l'insère
      if (!existing) {
        const { error } = await supabase
          .from("customers")
          .insert({ email });

        if (error) {
          console.error("Supabase error:", error);
          return res.status(500).json({ error: "Database error" });
        }
      }

      console.log("✅ Customer saved:", email);
    }
  }

  return res.status(200).json({ received: true });
}
