import Groq from 'groq-sdk'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export async function generateResponse(message: string, history: Message[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')

  const groq = new Groq({ apiKey })

  const messages = [
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ]

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please try again.')), 30000)
  )

  const result = await Promise.race([
    groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
    }),
    timeoutPromise,
  ])

  return result.choices[0]?.message?.content ?? 'No response received.'
}
