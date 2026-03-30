import { createClient } from "@supabase/supabase-js";
import { getClientIp, isRateLimited, isValidEmail, normalizeEmail } from "./_security";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  if (isRateLimited(`check-access:${ip}`, 15, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase
    .from("Customers")
    .select("email")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Database error" });
  }

  return res.status(200).json({ paid: !!data });
}
