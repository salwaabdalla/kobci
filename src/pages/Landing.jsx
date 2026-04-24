import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const STATS = [
  { number: '500+', label: 'Ganacsade', color: 'text-terracotta' },
  { number: '12', label: 'Degmo', color: 'text-teal' },
  { number: '94%', label: 'Koboc', color: 'text-gold' },
]

const features = [
  { icon: '💰', title: 'Lacagta Maaree', desc: 'Diiwaangeli dakhligaaga iyo kharashkaaga si fudud. Warbixiin toddobaadlah hel.' },
  { icon: '🤖', title: 'Macallin AI', desc: 'Kobcin wuxuu kula hadlayaa Soomaali, talinina kuu siiyaa gaar ahaan ganacsigaaga.' },
  { icon: '📈', title: 'Korso Ganacsigaaga', desc: 'Saadaalinta xilliga, Mentor-ka, iyo qorshe ganacsi oo buuxa hel.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { userProfile } = useApp()

  const handleStart = () => {
    navigate(userProfile ? '/dashboard' : '/onboarding')
  }

  return (
    <div className="min-h-screen bg-brown flex flex-col">
      {/* Full-screen hero */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-gold bg-opacity-20 border-2 border-gold border-opacity-40 flex items-center justify-center mb-8 mx-auto">
          <span className="text-4xl">🌺</span>
        </div>

        <h1 className="font-heading text-7xl md:text-9xl font-bold text-gold mb-4 tracking-tight">
          Kobcin
        </h1>

        <p className="text-sand text-2xl md:text-3xl font-body font-semibold mb-3">
          Ganacsiga Haweenka Soomaaliyeed kor u qaad
        </p>
        <p className="text-amber-300 text-base md:text-lg max-w-lg mb-10 font-body leading-relaxed">
          AI-ga ugu horreeya ee loogu talagalay haweenka ganacsiga yar yar ee Soomaalida
        </p>

        <button
          onClick={handleStart}
          className="bg-terracotta text-white px-10 py-4 rounded-xl font-body font-semibold text-lg hover:bg-opacity-90 active:scale-95 transition-all shadow-lg mb-4"
        >
          Bilow Hadda
        </button>

        {userProfile && (
          <p className="text-amber-300 text-sm font-body">
            Ku soo dhawoow, {userProfile.name}!
          </p>
        )}

        <div className="mt-12 animate-bounce">
          <svg className="w-6 h-6 text-gold opacity-60 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Impact stats */}
      <div className="bg-sand px-6 pt-12 pb-0">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="card text-center py-6">
              <p className={`font-heading text-4xl md:text-5xl font-bold ${s.color} mb-1`}>{s.number}</p>
              <p className="text-muted text-sm font-body font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About section */}
      <div className="bg-sand px-6 py-10">
        <div className="max-w-2xl mx-auto card mb-10">
          <h2 className="font-heading text-xl font-bold text-brown mb-3">Kobcin Waa Maxay?</h2>
          <p className="text-muted text-sm font-body leading-relaxed">
            Kobcin waa macallin ganacsi oo AI ah oo gaar loogu sameeyay haweenka ganacsatada Soomaalida, si ay u helaan talin ku haboon xaaladooda, luuqaddooda, iyo suuqooda.
            Hadafkeennu waa in haweenka ganacsiga yar yar ee Soomaalida lagu taageero aalado casri ah si ay ganacsiyado kobcaya u dhisaan.
          </p>
        </div>

        {/* Feature cards */}
        <h2 className="font-heading text-2xl font-bold text-brown text-center mb-8">
          Maxaa Kobcin ku siin doona?
        </h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="card text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-heading font-semibold text-brown text-lg mb-2">{f.title}</h3>
              <p className="text-muted text-sm font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <button onClick={handleStart} className="btn-primary px-8 py-3 text-base">
            {userProfile ? 'Galin Dashboard' : 'Bilow Hadda — Bilaash ah'}
          </button>
        </div>

        <p className="text-center text-muted text-xs mt-6 font-body">
          Kobcin © 2024 — Ganacsatada Soomaalida ayuu u taagan yahay
        </p>
      </div>
    </div>
  )
}
