import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { askCoach } from '../services/aiService'

const GRANTS = [
  {
    name: 'SOMGEP — Barnaamijka Kordhinta Ganacsiga',
    org: 'Xukuumadda Soomaaliya + Bangiga Adduunka',
    amount: 'Ilaa $5,000',
    type: 'Deeq',
    desc: 'Deeq ganacsiyada yaryar ee haweenka. Codsiga waxaa la helay gudaha goboladda.',
    eligibility: 'Haweenka ganacsatada ah ee 18+ jirka',
  },
  {
    name: 'Dahabshiil Microfinance',
    org: 'Dahabshiil Group',
    amount: 'Ilaa $2,000',
    type: 'Amaah',
    desc: 'Amaah yaryar oo faa\'iido hooseysa ah ganacsiyada yaryar ee Soomaalida.',
    eligibility: 'Ganacsi la xaqiijiyay, 6+ bilood oo taariikhda leh',
  },
  {
    name: 'USAID Nawiri Programme',
    org: 'USAID Soomaaliya',
    amount: 'Ilaa $3,000',
    type: 'Deeq',
    desc: 'Taageero dhaqaale oo loogu talagalay haweenka xirfadlayaasha ah ee Soomaalida.',
    eligibility: 'Haweenka 18-40 jirka ah',
  },
  {
    name: 'UNDP Somalia Youth Entrepreneurship',
    org: 'UNDP Somalia',
    amount: 'Ilaa $10,000',
    type: 'Deeq',
    desc: 'Barnaamij gaar ah oo loogu talagalay dhalinyarada ganacsatada ah.',
    eligibility: 'Da\'da 18-35 jirka, ganacsi oo qorshe cad leh',
  },
  {
    name: 'Kaah Exchange Microfinance',
    org: 'Kaah Exchange',
    amount: 'Ilaa $1,000',
    type: 'Amaah',
    desc: 'Amaah degdeg ah ganacsatada yaryar ee macaamiisha Kaah ah.',
    eligibility: 'Macmiil Kaah ah, taariikhda bangiga leh',
  },
]

export default function Grow() {
  const { userProfile } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [pitch, setPitch] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [pitchError, setPitchError] = useState('')

  const handleMarketingAI = () => {
    const prompt = `Ganacsigayga waxaan iibiyaa ${userProfile?.whatYouSell || 'alaab'}. Suuqgeynta sideen u wanaajin karaa? Tilmaamo gaar ah oo fudud si aan macaamiil badan u helo.`
    navigate('/coach', { state: { prompt } })
  }

  const handlePitchFeedback = async () => {
    if (!pitch.trim()) return
    setLoadingFeedback(true)
    setPitchError('')
    setFeedback('')
    try {
      const result = await askCoach(
        `Waxaan kaaga akhriyayaa qoraalka ganacsigayga (pitch). Fadlan i sii jawaab ku saabsan: 1) Xoogga 2) Daciifnimada 3) Sida loo wanaajin karo. Pitch-ka:\n\n${pitch}`,
        userProfile
      )
      setFeedback(result)
    } catch {
      setPitchError('Waxaa jiray khalad. Isku day mar kale.')
    } finally {
      setLoadingFeedback(false)
    }
  }

  const TABS = ['Deeqaha & Amaahda', 'Suuqgeynta', 'Qaadashada']

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-brown">Kordhinta Ganacsiga 🌱</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-amber-50 rounded-xl p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === i ? 'bg-white text-terracotta shadow-sm' : 'text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Grants & Loans */}
      {tab === 0 && (
        <div className="space-y-3">
          <p className="text-muted text-sm">
            Deeqaha iyo amaahyada loogu talagalay ganacsatada Soomaalida:
          </p>
          {GRANTS.map((g, i) => (
            <div key={i} className="card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-heading font-semibold text-brown text-sm">{g.name}</h2>
                  <p className="text-muted text-xs">{g.org}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    g.type === 'Deeq'
                      ? 'bg-teal bg-opacity-15 text-teal'
                      : 'bg-gold bg-opacity-20 text-gold'
                  }`}>
                    {g.type}
                  </span>
                  <span className="font-bold text-terracotta text-sm">{g.amount}</span>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">{g.desc}</p>
              <p className="text-xs text-muted">
                <span className="font-medium">Shuruudaha:</span> {g.eligibility}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 1: Marketing */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="card">
            <div className="text-4xl mb-3">📣</div>
            <h2 className="font-heading font-semibold text-brown mb-2">Suuqgeynta Ganacsigaaga</h2>
            <p className="text-muted text-sm mb-4 leading-relaxed">
              Kobcin wuxuu kuu siin doonaa tilmaamo gaar ah oo ku saleysan waxa aad iibisid si aad macaamiil badan u heshid.
            </p>
            <button onClick={handleMarketingAI} className="btn-primary w-full py-3">
              🤖 Hel Taladda Suuqgeynta
            </button>
          </div>

          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-3">Tilmaamaha Degdegga</h2>
            <div className="space-y-3">
              {[
                { icon: '📱', title: 'Baraha Bulshada', desc: 'Sawirada alaabta Facebook iyo TikTok ku dhig maalin kasta' },
                { icon: '👄', title: 'Afku Af', desc: 'Macaamiisha raali ah u sheeg inay kuu tilmaamaan dadka kale' },
                { icon: '🎁', title: 'Bixinta Bilaashka', desc: 'Macmiilka cusub bilaash yar sii si ay ku tijaabiyaan' },
                { icon: '📍', title: 'Goobta Suuqa', desc: 'Suuqyada maxalliga ah joog si macaamiil badan u arko' },
              ].map(tip => (
                <div key={tip.title} className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <p className="font-medium text-brown text-sm">{tip.title}</p>
                    <p className="text-muted text-xs">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pitch Training */}
      {tab === 2 && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-2">Qaadashada Ganacsiga 🎤</h2>
            <p className="text-muted text-sm mb-4">
              Qor sida aad uga hadli lahayd ganacsigaaga (2-3 daqiiqo), Kobcin wuxuu kuu siin doonaa jawaab.
            </p>
            <textarea
              value={pitch}
              onChange={e => setPitch(e.target.value)}
              placeholder="Tusaale: Magacaygu waa Faadumo. Waxaan lahaahay dukan dhar ah Muqdisho. Dharkaygu wuxuu kala duwan yahay..."
              className="input-field min-h-[120px] resize-none mb-3"
            />
            {pitchError && (
              <p className="text-red-600 text-sm mb-2">{pitchError}</p>
            )}
            <button
              onClick={handlePitchFeedback}
              disabled={!pitch.trim() || loadingFeedback}
              className="btn-primary w-full py-3"
            >
              {loadingFeedback ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Jawaabta la diyaarinayaa...
                </span>
              ) : '🤖 Jawaabta Hel'}
            </button>
          </div>

          {feedback && (
            <div className="card bg-gold bg-opacity-5 border-gold border-opacity-30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-brown flex items-center justify-center text-gold text-xs font-bold">K</div>
                <p className="font-medium text-brown text-sm">Kobcin — Jawaabtiisa</p>
              </div>
              <p className="text-brown text-sm leading-relaxed whitespace-pre-wrap">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
