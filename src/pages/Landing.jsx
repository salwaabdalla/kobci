import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

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
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Decorative circle */}
        <div className="w-24 h-24 rounded-full bg-gold bg-opacity-20 border-2 border-gold border-opacity-40 flex items-center justify-center mb-8 mx-auto">
          <span className="text-4xl">🌺</span>
        </div>

        <h1 className="font-heading text-6xl md:text-8xl font-bold text-gold mb-3 tracking-tight">
          Kobcin
        </h1>

        <p className="text-sand text-xl md:text-2xl font-body font-medium mb-2">
          Ganacsigaaga kor u qaad
        </p>
        <p className="text-amber-300 text-sm md:text-base max-w-md mb-10 font-body">
          Macallin ganacsi ah oo Soomaali ku hadla, gaar ahaan kuugu talinaya.
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

        {/* Scroll hint */}
        <div className="mt-12 animate-bounce">
          <svg className="w-6 h-6 text-gold opacity-60 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Feature cards */}
      <div className="bg-sand px-6 py-12">
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
          <button
            onClick={handleStart}
            className="btn-primary px-8 py-3 text-base"
          >
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
