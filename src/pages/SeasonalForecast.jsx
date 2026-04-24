import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const SOMALI_MONTHS = [
  'Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun',
  'Luulyo', 'Ogosto', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Disembar',
]

// Seasonal data: 0=Jan … 11=Dec. Value: 0=low, 1=medium, 2=high, 3=very high
// These reflect common Somali market patterns
const BASE_SEASONAL = [1, 1, 0, 3, 0, 1, 1, 1, 2, 1, 1, 2]

// Clothing modifiers: Ramadan (Mar) high, Eid (Apr) very high, school (Sep) very high
const CLOTHING_SEASONAL = [1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 1, 2]

// Food modifiers: Ramadan low, Eid high, otherwise medium
const FOOD_SEASONAL = [1, 1, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1]

const LEVEL_CONFIG = {
  0: { label: 'Hoos', color: 'bg-red-400', textColor: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  1: { label: 'Dhexdhex', color: 'bg-amber-400', textColor: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  2: { label: 'Sarreeya', color: 'bg-teal', textColor: 'text-teal', bg: 'bg-teal bg-opacity-10', border: 'border-teal border-opacity-30' },
  3: { label: 'Aad u sarreeya', color: 'bg-gold', textColor: 'text-gold', bg: 'bg-gold bg-opacity-10', border: 'border-gold border-opacity-30' },
}

function getSeasonalData(userProfile) {
  const sell = userProfile?.whatYouSell?.toLowerCase() || ''
  if (sell.includes('dharka') || sell.includes('dhar') || sell.includes('clothing')) {
    return CLOTHING_SEASONAL
  }
  if (sell.includes('cunto') || sell.includes('shaah') || sell.includes('food') || sell.includes('bariis')) {
    return FOOD_SEASONAL
  }
  return BASE_SEASONAL
}

export default function SeasonalForecast() {
  const { userProfile } = useApp()
  const navigate = useNavigate()

  const currentMonth = new Date().getMonth()

  const seasonal = useMemo(() => getSeasonalData(userProfile), [userProfile])

  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthIdx = (currentMonth + i) % 12
      return {
        name: SOMALI_MONTHS[monthIdx],
        level: seasonal[monthIdx],
        monthIdx,
        isNow: i === 0,
      }
    })
  }, [currentMonth, seasonal])

  const maxLevel = 3

  const lowSoon = months.slice(0, 3).find(m => m.level === 0)

  const handleGetPlan = () => {
    const lowMonth = months.find(m => m.level === 0)
    const prompt = lowMonth
      ? `Ganacsigaygu ${userProfile?.whatYouSell || 'alaab'} wuxuu iibayaa. ${lowMonth.name}-ka ayaa ah xilli hooseeya. Sideen ugu diyaargaroo karaa?`
      : `Saadaalinta xilliga ganacsigayga ayaan weydiinayaa. Waxaan iibiyaa ${userProfile?.whatYouSell || 'alaab'}. Xilli kasta maxaan samayn karaa si dakhligaygu kor ugu kaco?`
    navigate('/coach', { state: { prompt } })
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold text-brown">Saadaalinta Xilliga 📊</h1>

      {userProfile && (
        <p className="text-muted text-sm">
          Salka ku saleysan: <span className="text-terracotta font-medium">{userProfile.whatYouSell}</span>
        </p>
      )}

      {/* Low period warning */}
      {lowSoon && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-red-800 font-medium text-sm">
              Xilli hoos u dhac ah wuxuu dhowdahay: {lowSoon.name}!
            </p>
            <p className="text-red-700 text-xs mt-1">
              Hore u qorsho si lacag ku filan oo kaydsan aad u leedahay.
            </p>
          </div>
        </div>
      )}

      {/* 6-month bar chart */}
      <div className="card">
        <h2 className="font-heading font-semibold text-brown mb-4">6 Bilood ee Xiga</h2>
        <div className="flex items-end gap-2 h-40">
          {months.map((m, i) => {
            const cfg = LEVEL_CONFIG[m.level]
            const heightPct = ((m.level + 1) / (maxLevel + 1)) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                  <div
                    className={`w-full ${cfg.color} rounded-t-md transition-all`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${m.isNow ? 'text-terracotta' : 'text-muted'}`}>
                  {m.name.slice(0, 3)}
                </span>
                {m.isNow && <span className="text-terracotta text-xs">●</span>}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${cfg.color}`} />
              <span className="text-xs text-muted">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Month details */}
      <div className="space-y-2">
        {months.map((m, i) => {
          const cfg = LEVEL_CONFIG[m.level]
          return (
            <div key={i} className={`card flex items-center justify-between ${cfg.bg} ${cfg.border}`}>
              <div>
                <p className={`font-medium text-sm ${m.isNow ? 'text-terracotta' : 'text-brown'}`}>
                  {m.name} {m.isNow && '(Hadda)'}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.textColor} border ${cfg.border}`}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Get AI plan */}
      <button
        onClick={handleGetPlan}
        className="btn-primary w-full py-3"
      >
        🤖 Qorshaha xilliga hoos u dhaca
      </button>
    </div>
  )
}
