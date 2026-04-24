import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function useCountUp(target, duration = 1000) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!target) { setDisplay(0); return }
    let rafId
    const start = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      setDisplay(Math.round(target * progress))
      if (progress < 1) { rafId = requestAnimationFrame(tick) }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])
  return display
}

const QURAN_AYAHS = [
  {
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    somali: 'Cid kasta oo Alle ka cabsata, wuxuu u yeelaa meel uu ka baxo, wuxuuna ka arsaaqaa meel uusan filayn.',
  },
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    somali: 'Hubaal, dhibaatada waxaa la socota fudayd.',
  },
  {
    arabic: 'وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ',
    somali: 'Tawfiiqaydu waxay ka timaaddaa Alle oo keliya..',
  },
]

const SLOW_PERIODS = [
  { name: 'Ramadaan', startMonth: 2, endMonth: 3 },
  { name: 'iida kadib', startMonth: 4, endMonth: 4 },
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
  const { userProfile, transactions, stockItems, suppliers, savingsGoal, sales } = useApp()
  const navigate = useNavigate()

  const today = new Date()
  const weekStart = getWeekRange()

  const weekTransactions = transactions.filter(t => new Date(t.date) >= weekStart)
  const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const weekProfit = weekIncome - weekExpense

  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekIncome = transactions
    .filter(t => { const d = new Date(t.date); return d >= lastWeekStart && d < weekStart })
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const todayStr = today.toDateString()
  const todayTransactions = transactions.filter(t => new Date(t.date).toDateString() === todayStr)
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const lowStockCount = stockItems.filter(item => item.quantity <= (item.reorderLevel || 0)).length

  const ayah = useMemo(() => QURAN_AYAHS[today.getDay() % QURAN_AYAHS.length], [])

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
    if (transactions.length > 0) score += 25
    if (stockItems.length > 0) score += 25
    if (suppliers.length > 0) score += 25
    if (savingsGoal.target > 0) score += 25
    return score
  }, [transactions, stockItems, suppliers, savingsGoal])

  const savingsProgress = savingsGoal.target > 0
    ? Math.min((savingsGoal.current / savingsGoal.target) * 100, 100)
    : 0

  const animIncome = useCountUp(weekIncome)
  const animProfit = useCountUp(Math.abs(weekProfit))
  const animScore = useCountUp(businessScore)
  const animSavingsProgress = useCountUp(Math.round(savingsProgress))
  const animSavingsCurrent = useCountUp(savingsGoal.current)
  const animTodayIncome = useCountUp(todayIncome)
  const animTodayExpense = useCountUp(todayExpense)
  const animLowStock = useCountUp(lowStockCount)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-brown">
          Subax wanaagsan, {userProfile?.name}! 👋
        </h1>
        <p className="text-muted text-sm mt-1">{formatSomaliDate(today)}</p>
      </div>

      {/* Forecast preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h2 className="font-heading font-semibold text-brown text-sm">Saadaalinta Dakhliga</h2>
          </div>
          <button
            onClick={() => navigate('/forecast')}
            className="text-xs text-terracotta font-medium hover:underline"
          >
            Eeg dhamaystiran →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-50 rounded-lg py-3 px-2">
            <p className="text-muted text-xs mb-1">Toddobaadkii hore</p>
            <p className="font-heading font-bold text-brown text-sm">
              {lastWeekIncome > 0 ? `${lastWeekIncome.toLocaleString()} sh` : '—'}
            </p>
          </div>
          <div className="bg-teal bg-opacity-10 rounded-lg py-3 px-2">
            <p className="text-muted text-xs mb-1">Toddobaadkan</p>
            <p className="font-heading font-bold text-teal text-sm">
              {weekIncome > 0 ? `${weekIncome.toLocaleString()} sh` : '—'}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg py-3 px-2">
            <p className="text-muted text-xs mb-1">Saadaal</p>
            {weekIncome > 0 ? (
              <p className={`font-heading font-bold text-sm flex items-center justify-center gap-0.5 ${weekIncome >= lastWeekIncome ? 'text-green-600' : 'text-red-500'}`}>
                {weekIncome >= lastWeekIncome ? '↑' : '↓'}
                {weekIncome.toLocaleString()} sh
              </p>
            ) : (
              <p className="font-heading font-bold text-muted text-sm">—</p>
            )}
          </div>
        </div>
        {weekIncome === 0 && (
          <p className="text-center text-muted text-xs mt-3">
            Dakhlig diiwaangeli si saadaalinta u bilowdo
          </p>
        )}
      </div>

      {/* Slow period warning */}
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

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-muted text-xs mb-1">Dakhliga toddobaadka</p>
          {weekIncome > 0 ? (
            <p className="font-heading text-xl font-bold text-teal">
              {animIncome.toLocaleString()} sh
            </p>
          ) : (
            <p className="font-heading text-xl font-bold text-muted">—</p>
          )}
        </div>
        <div className="card">
          <p className="text-muted text-xs mb-1">Faa'iidada toddobaadka</p>
          {transactions.length > 0 ? (
            <p className={`font-heading text-xl font-bold ${weekProfit >= 0 ? 'text-teal' : 'text-red-500'}`}>
              {weekProfit < 0 ? '-' : ''}{animProfit.toLocaleString()} sh
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
              <p className="text-terracotta text-xs font-medium">{animSavingsProgress}%</p>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-teal rounded-full transition-all"
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>{animSavingsCurrent.toLocaleString()} sh</span>
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
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FFF0F5" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={businessScore >= 80 ? '#1D9E75' : businessScore >= 60 ? '#E91E8C' : '#C2185B'}
                strokeWidth="3"
                strokeDasharray={`${businessScore} 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brown">
              {animScore}
            </span>
          </div>
        </div>
      </div>

      {/* Aayada Maanta */}
      <div className="rounded-xl p-4 flex gap-3 items-start" style={{ backgroundColor: '#E8F5E9' }}>
        <span className="text-2xl flex-shrink-0 mt-1">☪️</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-2" style={{ color: '#388E3C' }}>Aayada Maanta</p>
          <p className="text-right text-sm italic leading-relaxed mb-2" style={{ color: '#78909C', fontFamily: 'serif', direction: 'rtl' }}>
            {ayah.arabic}
          </p>
          <p className="font-heading font-bold text-sm leading-relaxed" style={{ color: '#1B5E20' }}>
            {ayah.somali}
          </p>
        </div>
      </div>

      {/* Today's stat cards */}
      <div>
        <h2 className="font-heading font-semibold text-brown mb-3">Xaaladda Maanta</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Iibka Maanta */}
          <button
            onClick={() => navigate('/money')}
            className="card text-left active:scale-95 transition-all hover:border-green-300"
          >
            <p className="text-muted text-xs mb-1">Iibka Maanta</p>
            <div className="flex items-end gap-1">
              <p className="font-heading text-xl font-bold text-green-600">
                {animTodayIncome.toLocaleString()}
              </p>
              <span className="text-green-600 text-xs mb-0.5">sh</span>
              <span className="text-green-500 text-sm mb-0.5 ml-auto">↑</span>
            </div>
          </button>

          {/* Kharashka Maanta */}
          <button
            onClick={() => navigate('/money')}
            className="card text-left active:scale-95 transition-all hover:border-red-200"
          >
            <p className="text-muted text-xs mb-1">Kharashka Maanta</p>
            <div className="flex items-end gap-1">
              <p className="font-heading text-xl font-bold text-red-500">
                {animTodayExpense.toLocaleString()}
              </p>
              <span className="text-red-500 text-xs mb-0.5">sh</span>
              <span className="text-red-400 text-sm mb-0.5 ml-auto">↓</span>
            </div>
          </button>

          {/* Kaydka Hooseeya */}
          <button
            onClick={() => navigate('/stock')}
            className="card text-left active:scale-95 transition-all hover:border-orange-300"
          >
            <p className="text-muted text-xs mb-1">Kaydka Hooseeya</p>
            <div className="flex items-end gap-1">
              <p className="font-heading text-xl font-bold text-orange-500">
                {animLowStock}
              </p>
              <span className="text-orange-500 text-xs mb-0.5">xidid</span>
              <span className="text-orange-400 text-sm mb-0.5 ml-auto">⚠</span>
            </div>
          </button>

          {/* Bartilmaameedka */}
          <button
            onClick={() => navigate('/money')}
            className="card text-left active:scale-95 transition-all hover:border-teal-300"
          >
            <p className="text-muted text-xs mb-1">Bartilmaameedka</p>
            <div className="flex items-center gap-2">
              <p className="font-heading text-xl font-bold text-teal">
                {animSavingsProgress}%
              </p>
              <div className="relative w-8 h-8 ml-auto flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8F4F1" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#1D9E75"
                    strokeWidth="4"
                    strokeDasharray={`${savingsProgress} 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
