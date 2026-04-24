function buildSystemPrompt(businessProfile) {
  const profile = businessProfile || {}

  const profileLines = [
    `Magaca: ${profile.name || 'Lama garanayo'}`,
    `Ganacsiga: ${profile.businessName || 'Lama garanayo'}`,
    `Waxa iibiya: ${profile.whatYouSell || 'Lama garanayo'}`,
    `Dakhliga usbuuciga ah: ${profile.weeklyIncome || 'Lama garanayo'} dollar`,
    `Caqabadda ugu weyn: ${profile.biggestChallenge || 'Lama garanayo'}`,
  ].join('\n')

  return `Adiga waxaad tahay Kobcin, macallin ganacsi oo u hadla af Soomaali kaliya. MARNABA af Ingiriisi u jawaabi. Haddaad su'aal Ingiriisi ah hesho, jawaabta weli af Soomaali ku bixi. Jawaabaha gaaban, wax ku ool ah, oo gaar ah u bixi. MARNABA xiddig (*) ama markdown ama calaamadaha bullet u isticmaalin. Liiska aanka la tiriyaa u isticmaal sidan: 1. 2. 3. Jawaab walba khadad cusub ku kala qaadi. Ugu badnaan 5 dhibcood ku koobi. Ganacsigooda waa:\n${profileLines}`
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
