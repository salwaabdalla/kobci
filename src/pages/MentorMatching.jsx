import React, { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'

function getInitials(name) {
  return name.split(' ').map((part) => part[0]).join('').toUpperCase()
}

const AVATAR_COLORS = ['bg-terracotta', 'bg-teal', 'bg-gold', 'bg-brown']

function buildWhatsAppMessage(mentor, userProfile) {
  return `Assalamu Calaykum ${mentor.name}! Magacaygu waa ${userProfile?.name || '...'}. Waxaan leeyahay ganacsi ${userProfile?.businessName || ''}. Waxaan helay macluumaadkaaga Kobcin-ka oo rabnaa inaan kala hadallo waayo-aragnimadaada ganacsi. Ma haysataa waqti?`
}

export default function MentorMatching() {
  const { userProfile, mentors, saveMentorConnection } = useApp()
  const [connectModal, setConnectModal] = useState(null)
  const [copied, setCopied] = useState(false)

  const bestMatch = useMemo(() => {
    if (!userProfile) return mentors[0]

    const challenge = userProfile.biggestChallenge
    const sell = userProfile.whatYouSell?.toLowerCase() || ''
    let best = mentors[0]
    let bestScore = 0

    mentors.forEach((mentor) => {
      let score = 0
      if (mentor.challenges.includes(challenge)) score += 2
      if (sell && mentor.businessType.toLowerCase().includes(sell.split(' ')[0])) score += 1
      if (score > bestScore) {
        best = mentor
        bestScore = score
      }
    })

    return best
  }, [userProfile, mentors])

  const copyMessage = (message) => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleOpenWhatsApp = async (mentor) => {
    await saveMentorConnection({
      mentorName: mentor.name,
      mentorBusiness: mentor.businessType,
    })

    const url = `https://wa.me/${mentor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(buildWhatsAppMessage(mentor, userProfile))}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-brown">Macallimaha & Baraha 👩‍🏫</h1>

      <div className="bg-brown rounded-xl p-4 flex gap-3">
        <div className="text-2xl">🤖</div>
        <div>
          <p className="text-gold text-xs font-medium mb-1">Kobcin wuxuu kuu doortay:</p>
          <p className="text-white font-heading font-semibold">{bestMatch.name}</p>
          <p className="text-amber-200 text-xs mt-0.5">{bestMatch.businessType} • {bestMatch.city} • {bestMatch.yearsExp} sano waayo-aragnimo</p>
          <p className="text-sand text-xs mt-1">Salka ku saleysan: caqabadaada ({userProfile?.biggestChallenge}) iyo nooca ganacsigaaga</p>
        </div>
      </div>

      <div className="space-y-3">
        {mentors.map((mentor, index) => {
          const isMatch = mentor.id === bestMatch.id

          return (
            <div key={mentor.id} className={`card ${isMatch ? 'border-gold border-2 bg-gold bg-opacity-5' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                  <span className="font-heading font-bold text-brown text-sm">{getInitials(mentor.name)}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-semibold text-brown">{mentor.name}</h2>
                    {isMatch && <span className="bg-gold text-brown text-xs px-2 py-0.5 rounded-full font-medium">★ Ugu habboon</span>}
                  </div>
                  <p className="text-muted text-xs mt-0.5">{mentor.businessType} • {mentor.city}</p>
                  <p className="text-muted text-xs">{mentor.yearsExp} sano waayo-aragnimo</p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {mentor.challenges.map((challenge) => (
                      <span key={challenge} className="bg-amber-50 text-muted text-xs px-2 py-0.5 rounded-full border border-amber-200">
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => window.open(mentor.whatsapp, '_blank')} className="btn-primary w-full mt-3 text-sm py-2">
                Xiriir WhatsApp
              </button>
            </div>
          )
        })}
      </div>

      {connectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="card w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-brown">La xiriir {connectModal.name}</h2>
              <button onClick={() => setConnectModal(null)} className="text-muted text-xl">×</button>
            </div>

            <div className="bg-sand rounded-lg p-3">
              <p className="text-xs text-muted mb-2">Farriinta WhatsApp-ka ku koobi:</p>
              <p className="text-brown text-sm leading-relaxed">{buildWhatsAppMessage(connectModal, userProfile)}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => copyMessage(buildWhatsAppMessage(connectModal, userProfile))} className="btn-secondary flex-1 text-sm">
                {copied ? '✓ La koobiyay' : 'Koobi'}
              </button>
              <button onClick={() => void handleOpenWhatsApp(connectModal)} className="btn-primary flex-1 text-sm text-center">
                WhatsApp Fur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
