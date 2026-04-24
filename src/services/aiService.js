const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function buildSystemPrompt(businessProfile) {
  const profile = businessProfile || {}
  return `Adiga waxaad tahay macallin ganacsi oo saaxiibtinimo leh oo la yidhaahdo "Kobcin". Aad u wanaagsan oo Soomaali ku hadasha keliya. Waxaad gaar ahaan u talin doontaa macmiilkaaga iyadoo la tixgelinayo xogta ganacsigaaga:

Magaca: ${profile.name || 'Ma garanayno'}
Ganacsi: ${profile.businessName || 'Ma garanayno'}
Waxa la iibinayo: ${profile.whatYouSell || 'Ma garanayno'}
Dakhliga toddobaadlaha: ${profile.weeklyIncome || 'Ma garanayno'} shilin
Caqabadda ugu weyn: ${profile.biggestChallenge || 'Ma garanayno'}

Sii talin gaar ah, wax ku ool ah, oo Soomaali ahaan. Ha isticmaalin Ingiriis. Jawaabaha gaabis gaabi, caadi u ah, oo si saaxiibtinimo ah u hadal.`
}

async function askGemini(userMessage, systemPrompt) {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemPrompt}\n\nSu'aasha macmiilka: ${userMessage}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 800,
      },
    }),
  })

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`)
  const data = await response.json()

  if (data.error) throw new Error(data.error.message)
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function askGroq(userMessage, systemPrompt) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 800,
    }),
  })

  if (!response.ok) throw new Error(`Groq error: ${response.status}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function askCoach(userMessage, businessProfile) {
  const systemPrompt = buildSystemPrompt(businessProfile)

  try {
    const text = await askGemini(userMessage, systemPrompt)
    if (text) return text
    throw new Error('Empty Gemini response')
  } catch {
    try {
      const text = await askGroq(userMessage, systemPrompt)
      if (text) return text
      throw new Error('Empty Groq response')
    } catch {
      throw new Error('AI_UNAVAILABLE')
    }
  }
}
