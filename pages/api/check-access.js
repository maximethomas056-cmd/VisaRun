import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // On accepte seulement les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  // Vérification basique de l'email
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // On se connecte à Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // On cherche l'email dans la table Customers
  const { data, error } = await supabase
    .from("Customers")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "no rows found" — c'est normal si l'email n'existe pas
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Database error" });
  }

  // Si on a trouvé l'email → accès débloqué
  return res.status(200).json({ paid: !!data });
}
