import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const SOMALI_QUOTES = [
  '"Naag ganacsato waa iftiinka goyska." — Xigmad Soomaali',
  '"Hawsha maanta oo samaynaysid ayaa berri lagu mahadcelinayaa." — Xigmad Soomaali',
  '"Gacanta bidix ka garab siiso midigta, meel fog bay gaari doonaan." — Xigmad Soomaali',
  '"Lacag la kaydiya waa lacag la helay." — Xigmad Soomaali',
  '"Markii aad baxdo waaberiga hore, adduunka kula kulma." — Xigmad Soomaali',
  '"Sabar waa awood, wax kasta oo aad sabrido ayaad gaadhay." — Xigmad Soomaali',
  '"Nin wax baraa waa nin wax leh." — Xigmad Soomaali',
  '"Dunida ama qabso ama daa, laakiin u dayo." — Xigmad Soomaali',
  '"Midab walba wuxuu leeyahay qurux, ganacsiga walba wuxuu leeyahay fursad." — Xigmad Soomaali',
  '"Hawsha waxaa ka dhigta midho, samir iyo xikmad." — Xigmad Soomaali',
]

const SLOW_PERIODS = [
  { name: 'Ramadaan', startMonth: 2, endMonth: 3 },
  { name: 'Ka dib Ciida', startMonth: 4, endMonth: 4 },
]

const SOMALI_MONTHS = [
  'Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun',
  'Luulyo', 'Ogosto', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Disembar',
]

const SOMALI_DAYS = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimco', 'Sabti']

function formatSomaliDate(date) {
  const d = new Date(date)
  return `${SOMALI_DAYS[d.getDay()]}, ${d.getDate()} ${SOMALI_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getWeekRange() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  return start
}

export default function Dashboard() {
  const { userProfile, transactions, stockItems, suppliers, savingsGoal, streak, sales } = useApp()
  const navigate = useNavigate()

  const today = new Date()
  const weekStart = getWeekRange()

  const weekTransactions = transactions.filter(t => new Date(t.date) >= weekStart)
  const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const weekProfit = weekIncome - weekExpense

  const quote = useMemo(() => {
    const idx = today.getDate() % SOMALI_QUOTES.length
    return SOMALI_QUOTES[idx]
  }, [])

  // Only show slow-period warning after 14 distinct days of real sales data
  const uniqueSaleDays = useMemo(() => {
    return new Set(sales.map(s => new Date(s.date).toDateString())).size
  }, [sales])

  const forecastUnlocked = uniqueSaleDays >= 14

  const slowWarning = useMemo(() => {
    if (!forecastUnlocked) return null
    const now = new Date()
    const sixWeeksAhead = new Date(now.getTime() + 42 * 86400000)
    return SLOW_PERIODS.find(p => {
      const start = new Date(now.getFullYear(), p.startMonth, 1)
      return start >= now && start <= sixWeeksAhead
    })
  }, [forecastUnlocked])

  const businessScore = useMemo(() => {
    let score = 0
    if (transactions.length > 0) score += 20
    if (stockItems.length > 0) score += 20
    if (suppliers.length > 0) score += 20
    if (streak.currentStreak > 3) score += 20
    if (savingsGoal.target > 0) score += 20
    return score
  }, [transactions, stockItems, suppliers, streak, savingsGoal])

  const savingsProgress = savingsGoal.target > 0
    ? Math.min((savingsGoal.current / savingsGoal.target) * 100, 100)
    : 0

  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { label: SOMALI_DAYS[d.getDay()].slice(0, 2), filled: i >= 7 - streak.currentStreak }
  })

  const quickActions = [
    { label: 'Lacag geli', path: '/money', icon: '💰' },
    { label: 'Macallinka AI', path: '/coach', icon: '🤖' },
    { label: 'Kaydka eeg', path: '/stock', icon: '📦' },
    { label: 'Saadaalinta', path: '/forecast', icon: '📊' },
    { label: 'Ganacsiga', path: '/business-plan', icon: '📋' },
    { label: 'Dhiirigelinta', path: '/inspire', icon: '⭐' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-brown">
          Subax wanaagsan, {userProfile?.name}! 👋
        </h1>
        <p className="text-muted text-sm mt-1">{formatSomaliDate(today)}</p>
      </div>

      {/* Forecast locked notice */}
      {!forecastUnlocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-amber-500 text-xl">📊</span>
          <div>
            <p className="font-medium text-amber-800 text-sm">
              Saadaalinta weli kuma furna
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              Diiwaangeli 14 maalmood oo iib ah si aad saadaalinta xilliga u hesho.
              Hadda: {uniqueSaleDays} / 14 maalmood.
            </p>
          </div>
        </div>
      )}

      {/* Slow period warning — only shown after 14 days of data */}
      {slowWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
          <span className="text-orange-500 text-xl">⚠️</span>
          <div>
            <p className="font-medium text-orange-800 text-sm">
              Digniin: {slowWarning.name} waxay dhowdahay!
            </p>
            <p className="text-orange-700 text-xs mt-0.5">
              Xilliga {slowWarning.name} ganacsiga ayaa hoos u dhici kara. Hore u qorsho.
            </p>
            <button
              onClick={() => navigate('/forecast')}
              className="text-orange-600 text-xs underline mt-1"
            >
              Saadaalinta eeg →
            </button>
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-brown">Joogsiganaha 🔥</h2>
          <span className="text-terracotta font-bold text-lg">{streak.currentStreak} maalmood</span>
        </div>
        <div className="flex gap-2">
          {streakDays.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-medium ${
                d.filled ? 'bg-terracotta text-white' : 'bg-amber-100 text-muted'
              }`}>
                {d.filled ? '✓' : ''}
              </div>
              <span className="text-xs text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-muted text-xs mb-1">Dakhliga toddobaadka</p>
          {weekIncome > 0 ? (
            <p className="font-heading text-xl font-bold text-teal">
              {weekIncome.toLocaleString()} sh
            </p>
          ) : (
            <p className="font-heading text-xl font-bold text-muted">—</p>
          )}
        </div>
        <div className="card">
          <p className="text-muted text-xs mb-1">Faa'iidada toddobaadka</p>
          {transactions.length > 0 ? (
            <p className={`font-heading text-xl font-bold ${weekProfit >= 0 ? 'text-teal' : 'text-red-500'}`}>
              {weekProfit.toLocaleString()} sh
            </p>
          ) : (
            <p className="font-heading text-xl font-bold text-muted">—</p>
          )}
        </div>

        {/* Savings card */}
        {savingsGoal.target === 0 ? (
          <div className="card col-span-2 flex items-center justify-between">
            <div>
              <p className="text-muted text-xs mb-1">Bartilmaameedka kaydka</p>
              <p className="text-muted text-sm">Bartilmaameed ma jiro weli</p>
            </div>
            <button
              onClick={() => navigate('/money')}
              className="btn-primary text-xs py-2 px-3 flex-shrink-0"
            >
              Dhig bartilmaameed
            </button>
          </div>
        ) : (
          <div className="card col-span-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-muted text-xs">Bartilmaameedka kaydka</p>
              <p className="text-terracotta text-xs font-medium">{Math.round(savingsProgress)}%</p>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-teal rounded-full transition-all"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>{savingsGoal.current.toLocaleString()} sh</span>
              <span>{savingsGoal.target.toLocaleString()} sh</span>
            </div>
          </div>
        )}
      </div>

      {/* Business Score */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-brown">Dhibcaha Ganacsiga</h2>
            <p className="text-muted text-xs mt-0.5">Ku salaysan buuxinta macluumaadka</p>
          </div>
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FBF4EC" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={businessScore >= 80 ? '#1D9E75' : businessScore >= 60 ? '#E8A020' : '#C4623B'}
                strokeWidth="3"
                strokeDasharray={`${businessScore} 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brown">
              {businessScore}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="bg-brown rounded-xl p-4">
        <p className="text-gold text-xs mb-1 font-medium">Maanta oo maanta</p>
        <p className="text-sand text-sm font-body italic leading-relaxed">{quote}</p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading font-semibold text-brown mb-3">Fursadaha Degdegga</h2>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((a) => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="card flex flex-col items-center gap-2 py-4 hover:border-terracotta hover:border-opacity-40 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs text-muted text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
