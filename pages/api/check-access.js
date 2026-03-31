import { createClient } from "@supabase/supabase-js";

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

  const { data, error } = await supabase
    .from("Customers")
    .select("id")  // On ne renvoie plus l'email — juste un id anonyme
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error:", error.code);
    return res.status(500).json({ error: "Database error" });
  }

  // Juste true/false — pas d'info sur ce qui existe ou non
  return res.status(200).json({ paid: !!data });
}
