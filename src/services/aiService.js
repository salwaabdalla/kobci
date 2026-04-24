function buildSystemPrompt(businessProfile) {
  const profile = businessProfile || {}

  return `Adiga waxaad tahay macallin ganacsi oo saaxiibtinimo leh oo la yidhaahdo "Kobcin". Aad u wanaagsan oo Soomaali ku hadasha keliya. Waxaad gaar ahaan u talin doontaa macmiilkaaga iyadoo la tixgelinayo xogta ganacsigaaga:

Magaca: ${profile.name || 'Ma garanayno'}
Ganacsi: ${profile.businessName || 'Ma garanayno'}
Waxa la iibinayo: ${profile.whatYouSell || 'Ma garanayno'}
Dakhliga toddobaadlaha: ${profile.weeklyIncome || 'Ma garanayno'} shilin
Caqabadda ugu weyn: ${profile.biggestChallenge || 'Ma garanayno'}

Sii talin gaar ah, wax ku ool ah, oo Soomaali ahaan. Ha isticmaalin Ingiriis. Jawaabaha ha noqdaan kuwo cad, dabiici ah, oo si saaxiibtinimo leh u qoran.`
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function askCoach(userMessage, businessProfile) {
  const cleanUserMessage = sanitizeText(userMessage)

  if (!cleanUserMessage) {
    throw new Error('AI_UNAVAILABLE')
  }

  const response = await fetch('/api/coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: cleanUserMessage }],
      system: sanitizeText(buildSystemPrompt(businessProfile)) || undefined,
    }),
  })

  const rawText = await response.text()
  let data = {}

  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch {
    data = { error: rawText || 'AI_UNAVAILABLE' }
  }

  if (!response.ok || !sanitizeText(data?.content)) {
    console.error('AI handler failed:', data)
    const detailText = Array.isArray(data?.details)
      ? data.details.map((item) => `${item.provider}: ${item.error}`).join(' | ')
      : ''
    throw new Error(detailText || data?.error || 'AI_UNAVAILABLE')
  }

  return {
    content: sanitizeText(data.content),
    model: data.model || 'unknown',
  }
}
