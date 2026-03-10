export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  // Transmet la requête telle quelle à Anthropic
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()
    if (!response.ok) return res.status(500).json({ error: data?.error?.message || 'API error' })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
