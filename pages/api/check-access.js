import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // 1. Vérifier si l'email existe dans Customers
  const { data, error } = await supabase
    .from("Customers")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error:", error.code);
    return res.status(500).json({ error: "Database error" });
  }

  // Email inconnu → pas payé
  if (!data) {
    return res.status(200).json({ paid: false });
  }

  // 2. Email valide → générer un token unique
  // randomUUID() génère une clef du type : "a3f9b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
  const token = randomUUID();

  // 3. Sauvegarder le token dans Supabase (écrase l'ancien)
  // → Si Bob utilise l'email d'Alice, Alice perd son token
  //   et devra re-taper son email → nouveau token → Bob est invalidé
  const { error: updateError } = await supabase
    .from("Customers")
    .update({ token })
    .eq("email", email.toLowerCase().trim());

  if (updateError) {
    console.error("Token update error:", updateError.code);
    return res.status(500).json({ error: "Database error" });
  }

  // 4. Renvoyer le token au frontend — jamais l'email
  return res.status(200).json({ paid: true, token });
}
