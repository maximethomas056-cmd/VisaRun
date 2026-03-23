export const config = {
  api: { bodyParser: { sizeLimit: "12mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: "API key not configured" } });
  }

  if (!req.body || !req.body.model || !req.body.messages) {
    return res.status(400).json({ error: { message: "Invalid request body" } });
  }

  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
  } catch (networkError) {
    return res.status(502).json({ error: { message: "Network error: " + networkError.message } });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return res.status(502).json({ error: { message: "Invalid response from Anthropic" } });
  }

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  return res.status(200).json(data);
}
