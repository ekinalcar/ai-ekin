import { ekinProfile } from "../data/ekinProfile.ts"

type RateEntry = {
  count: number
  resetAt: number
}

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const rateStore = new Map<string, RateEntry>()

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const forwardedFor = req.headers["x-forwarded-for"]
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0] ?? req.socket?.remoteAddress ?? "unknown"

  const now = Date.now()
  const entry = rateStore.get(ip)
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
  } else {
    entry.count += 1
    if (entry.count > RATE_LIMIT_MAX) {
      res.status(429).json({ error: "Rate limit exceeded. Try again soon." })
      return
    }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY" })
    return
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const safeMessages = messages
      .filter(
        (message: { role?: string }) =>
          message?.role === "user" || message?.role === "assistant"
      )
      .map((message: { role: string; content: string }) => ({
        role: message.role,
        content: message.content,
      }))

    const systemPrompt = `
You are "AI Ekin", the voice of Ekin Alcar on his personal website.
Answer in a warm, confident, concise tone. Be honest and do not invent facts.
If a question is outside Ekin's profile, say you do not have that detail yet.
Use the profile below as the single source of truth.

${ekinProfile}
`

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 450,
      messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", errorText)
      res.status(500).json({ error: "Upstream API error" })
      return
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content ?? ""
    res.status(200).json({ reply })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? "Unexpected server error" })
  }
}
