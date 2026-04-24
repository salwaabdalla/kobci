const GEMINI_MODEL = 'gemini-2.5-flash'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GEMINI_MAX_RETRIES = 2
const GEMINI_RETRY_DELAY_MS = 1200
const isDev = process.env.NODE_ENV !== 'production'

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ''
}

function getGroqApiKey() {
  return process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || ''
}

function sendJson(res, status, payload) {
  res.statusCode = status
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json')
  }
  res.end(JSON.stringify(payload))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter((message) => message && typeof message.content === 'string')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
}

async function callGemini({ messages, system, apiKey }) {
  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))

  const payload = {
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  }

  if (system) {
    payload.systemInstruction = { parts: [{ text: system }] }
  }

  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

    console.log('Gemini status:', geminiRes.status, 'attempt:', attempt + 1)

    const geminiData = await geminiRes.json().catch(() => ({}))
    console.log('Gemini response:', JSON.stringify(geminiData).substring(0, 200))

    if (geminiRes.ok) {
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (text) {
        return { content: text, model: 'gemini' }
      }
      throw new Error('Gemini returned no content')
    }

    if (geminiRes.status === 429 && attempt < GEMINI_MAX_RETRIES) {
      await sleep(GEMINI_RETRY_DELAY_MS * (attempt + 1))
      continue
    }

    throw new Error(geminiData?.error?.message || (geminiRes.status === 429 ? 'GEMINI_RATE_LIMIT' : 'Gemini returned no content'))
  }

  throw new Error('GEMINI_RATE_LIMIT')
}

async function callGroq({ messages, system, apiKey }) {
  const groqMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages

  const groqRes = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    },
  )

  const groqData = await groqRes.json().catch(() => ({}))
  console.log('Groq status:', groqRes.status)
  console.log('Groq response:', JSON.stringify(groqData).substring(0, 200))

  if (!groqRes.ok) {
    throw new Error(groqData?.error?.message || `Groq failed with status ${groqRes.status}`)
  }

  const text = groqData.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new Error('Groq returned no content')
  }

  return { content: text, model: 'groq' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const { messages, system } = req.body || {}
  const sanitizedMessages = sanitizeMessages(messages)

  if (!sanitizedMessages.length) {
    return sendJson(res, 400, { error: 'Invalid request: messages array required' })
  }

  const geminiApiKey = getGeminiApiKey()
  const groqApiKey = getGroqApiKey()
  const providerErrors = []

  console.log('GEMINI KEY EXISTS:', Boolean(geminiApiKey))
  console.log('GROQ KEY EXISTS:', Boolean(groqApiKey))
  console.log('Messages count:', sanitizedMessages.length)

  if (!geminiApiKey && !groqApiKey) {
    return sendJson(res, 500, { error: 'AI keys are not configured on the server.' })
  }

  if (geminiApiKey) {
    try {
      const result = await callGemini({
        messages: sanitizedMessages,
        system: typeof system === 'string' ? system.trim() : '',
        apiKey: geminiApiKey,
      })
      return sendJson(res, 200, result)
    } catch (geminiError) {
      console.log('Gemini failed, falling back to Groq:', geminiError.message)
      providerErrors.push({
        provider: 'gemini',
        error: geminiError.message,
        stack: isDev ? geminiError.stack : undefined,
      })
    }
  }

  if (groqApiKey) {
    try {
      const result = await callGroq({
        messages: sanitizedMessages,
        system: typeof system === 'string' ? system.trim() : '',
        apiKey: groqApiKey,
      })
      return sendJson(res, 200, result)
    } catch (groqError) {
      console.log('Groq error:', groqError.message)
      providerErrors.push({
        provider: 'groq',
        error: groqError.message,
        stack: isDev ? groqError.stack : undefined,
      })
      return sendJson(res, 500, {
        error: 'AI unavailable. Please try again later.',
        details: isDev ? providerErrors : undefined,
      })
    }
  }

  return sendJson(res, 500, {
    error: 'AI unavailable. Please try again later.',
    details: isDev ? providerErrors : undefined,
  })
}
