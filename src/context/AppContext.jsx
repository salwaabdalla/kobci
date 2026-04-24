import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

// Bump this string any time the data schema changes to wipe old seed data from localStorage
const SCHEMA_VERSION = '2'

function migrateIfNeeded() {
  try {
    if (localStorage.getItem('kobcin_version') !== SCHEMA_VERSION) {
      localStorage.removeItem('kobcin_transactions')
      localStorage.removeItem('kobcin_stock')
      localStorage.removeItem('kobcin_sales')
      localStorage.removeItem('kobcin_suppliers')
      localStorage.removeItem('kobcin_savings')
      localStorage.removeItem('kobcin_streak')
      localStorage.setItem('kobcin_version', SCHEMA_VERSION)
    }
  } catch {}
}

migrateIfNeeded()

const MENTORS = [
  {
    id: 'm1',
    name: 'Zahra Ahmed',
    businessType: 'Cunto karinta',
    yearsExp: 4,
    city: 'Muqdisho',
    challenges: ['Macaamiisha helitaan', 'Lacagta maaraynta'],
    phone: '+252612000001',
  },
  {
    id: 'm2',
    name: 'Hodan Omar',
    businessType: 'Dukaan yar',
    yearsExp: 3,
    city: 'Hargeysa',
    challenges: ['Qiimaha alaabta', 'Lacagta maaraynta'],
    phone: '+252612000002',
  },
  {
    id: 'm3',
    name: 'Faadumo Ali',
    businessType: 'Dharka iibinta',
    yearsExp: 5,
    city: 'Kismaayo',
    challenges: ['Aood-gelin qoyska', 'Macaamiisha helitaan'],
    phone: '+252612000003',
  },
  {
    id: 'm4',
    name: 'Asad Nuur',
    businessType: 'Xirfadaha tech-ga',
    yearsExp: 2,
    city: 'Muqdisho',
    challenges: ['Awood-gelin qoyska', 'Qiimaha alaabta'],
    phone: '+252612000004',
  },
]

function safeGet(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function updateStreak(existing) {
  const today = new Date().toDateString()
  if (!existing || !existing.lastLoginDate) {
    return { lastLoginDate: today, currentStreak: 1 }
  }
  if (existing.lastLoginDate === today) {
    return existing
  }
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  if (existing.lastLoginDate === yesterday) {
    return { lastLoginDate: today, currentStreak: (existing.currentStreak || 1) + 1 }
  }
  return { lastLoginDate: today, currentStreak: 1 }
}

export function AppProvider({ children }) {
  const [userProfile, setUserProfileState] = useState(() => safeGet('kobcin_profile', null))
  const [transactions, setTransactionsState] = useState(() => safeGet('kobcin_transactions', []))
  const [stockItems, setStockItemsState] = useState(() => safeGet('kobcin_stock', []))
  const [sales, setSalesState] = useState(() => safeGet('kobcin_sales', []))
  const [suppliers, setSuppliersState] = useState(() => safeGet('kobcin_suppliers', []))
  const [savingsGoal, setSavingsGoalState] = useState(() => safeGet('kobcin_savings', { target: 0, current: 0 }))
  const [streak, setStreakState] = useState(() => {
    const saved = safeGet('kobcin_streak', null)
    return updateStreak(saved)
  })
  const [mentors] = useState(MENTORS)
  const [winJournal, setWinJournalState] = useState(() => safeGet('kobcin_wins', []))

  useEffect(() => {
    const updated = updateStreak(streak)
    if (updated.currentStreak !== streak.currentStreak || updated.lastLoginDate !== streak.lastLoginDate) {
      setStreakState(updated)
      safeSet('kobcin_streak', updated)
    }
  }, [])

  const setUserProfile = (val) => {
    setUserProfileState(val)
    safeSet('kobcin_profile', val)
  }

  const setTransactions = (val) => {
    const next = typeof val === 'function' ? val(transactions) : val
    setTransactionsState(next)
    safeSet('kobcin_transactions', next)
  }

  const setStockItems = (val) => {
    const next = typeof val === 'function' ? val(stockItems) : val
    setStockItemsState(next)
    safeSet('kobcin_stock', next)
  }

  const setSales = (val) => {
    const next = typeof val === 'function' ? val(sales) : val
    setSalesState(next)
    safeSet('kobcin_sales', next)
  }

  const setSuppliers = (val) => {
    const next = typeof val === 'function' ? val(suppliers) : val
    setSuppliersState(next)
    safeSet('kobcin_suppliers', next)
  }

  const setSavingsGoal = (val) => {
    const next = typeof val === 'function' ? val(savingsGoal) : val
    setSavingsGoalState(next)
    safeSet('kobcin_savings', next)
  }

  const addWin = (text) => {
    const entry = { id: Date.now().toString(), text, date: new Date().toISOString() }
    const next = [entry, ...winJournal]
    setWinJournalState(next)
    safeSet('kobcin_wins', next)
  }

  const deleteWin = (id) => {
    const next = winJournal.filter(w => w.id !== id)
    setWinJournalState(next)
    safeSet('kobcin_wins', next)
  }

  return (
    <AppContext.Provider value={{
      userProfile, setUserProfile,
      transactions, setTransactions,
      stockItems, setStockItems,
      sales, setSales,
      suppliers, setSuppliers,
      savingsGoal, setSavingsGoal,
      streak, mentors,
      winJournal, addWin, deleteWin,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
