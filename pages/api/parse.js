export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { type, text, imageBase64, mediaType } = req.body
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })
  const prompt = `You are an expert at extracting data from Australian payslips. Extract the following fields and return ONLY a valid JSON object — no markdown, no explanation.\n\n${type === 'text' ? `PAYSLIP TEXT:\n---\n${text?.slice(0, 6000)}\n---` : ''}\n\nReturn exactly this JSON:\n{"gross":0,"net":0,"tax":0,"super":0,"hoursWorked":0,"periodFrom":"","periodTo":"","employer":"","name":"","abn":""}\n\nRULES:\ngross — Total earnings BEFORE deductions. Must be > net.\nnet — Amount paid AFTER all deductions.\ntax — PAYG Withholding only.\nsuper — Employer superannuation (~11% of gross).\nhoursWorked — SUM of ALL worked hours.\nperiodFrom/periodTo — DD/MM/YYYY format.\nemployer — Company name.\nname — Employee full name.\nabn — 11 digits, no spaces.\nNEVER include $ or commas in numbers.`
  const messages = type === 'image'
    ? [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 }},{ type: 'text', text: prompt }]}]
    : [{ role: 'user', content: prompt }]
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, messages })
    })
    const data = await response.json()
    if (!response.ok) return res.status(500).json({ error: data?.error?.message || 'API error' })
    const text2 = data.content.map(b => b.text || '').join('').trim()
    const match = text2.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/)
    if (!match) return res.status(500).json({ error: 'No JSON in response' })
    res.json(JSON.parse(match[0]))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
