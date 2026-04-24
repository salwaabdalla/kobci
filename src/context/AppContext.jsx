import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, supabaseConfigError } from '../services/supabaseClient'

const AppContext = createContext(null)

const SALE_MARKER_START = ' [[sale:'
const SALE_MARKER_END = ']]'

const MENTORS = [
  {
    id: 'm1',
    name: 'Salwa Abdullahi',
    businessType: 'Cunto karinta',
    yearsExp: 4,
    city: 'Muqdisho',
    challenges: ['Macaamiisha helitaan', 'Lacagta maaraynta'],
    phone: '+252612721000',
    whatsapp: 'https://wa.me/252612721000',
  },
  {
    id: 'm2',
    name: 'Zamzam Hassan',
    businessType: 'Dukaan alaab',
    yearsExp: 3,
    city: 'Hargeysa',
    challenges: ['Qiimaha alaabta', 'Lacagta maaraynta'],
    phone: '+252617348080',
    whatsapp: 'https://wa.me/252617348080',
  },
  {
    id: 'm3',
    name: 'Sumaya Hussein',
    businessType: 'Dharka iibinta',
    yearsExp: 5,
    city: 'Kismaayo',
    challenges: ['Aood-gelin qoyska', 'Macaamiisha helitaan'],
    phone: '+252613713054',
    whatsapp: 'https://wa.me/252613713054',
  },
  {
    id: 'm4',
    name: 'Rayaan Mohamud',
    businessType: 'Xirfadaha tech-ga',
    yearsExp: 2,
    city: 'Muqdisho',
    challenges: ['Awood-gelin qoyska', 'Qiimaha alaabta'],
    phone: '+252613207279',
    whatsapp: 'https://wa.me/252613207279',
  },
]

const EMPTY_SAVINGS_GOAL = { id: null, target: 0, current: 0 }
const EMPTY_STREAK = { id: null, currentStreak: 0, lastLoginDate: null }
const EMPTY_STATE = {
  userProfile: null,
  transactions: [],
  stockItems: [],
  sales: [],
  suppliers: [],
  savingsGoal: EMPTY_SAVINGS_GOAL,
  streak: EMPTY_STREAK,
  winJournal: [],
  chatMessages: [],
  businessPlan: null,
  mentorConnections: [],
  pitchFeedback: [],
}

function getCacheKey(userId) {
  return `kobcin_supabase_cache_${userId}`
}

function readCache(userId) {
  try {
    const raw = localStorage.getItem(getCacheKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(userId, value) {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(value))
  } catch {}
}

function toDateOnlyLocal(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString()
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T12:00:00`
  }
  return value
}

function buildSaleDescription(itemName, saleId, baseDescription) {
  const clean = (baseDescription || `Iib: ${itemName}`).trim()
  return `${clean}${SALE_MARKER_START}${saleId}${SALE_MARKER_END}`
}

function stripSaleMarker(description = '') {
  const markerIndex = description.indexOf(SALE_MARKER_START)
  return markerIndex >= 0 ? description.slice(0, markerIndex).trim() : description
}

function parseSaleId(description = '') {
  const start = description.indexOf(SALE_MARKER_START)
  const end = description.indexOf(SALE_MARKER_END, start)
  if (start < 0 || end < 0) return null
  return description.slice(start + SALE_MARKER_START.length, end)
}

function mapProfile(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    businessName: row.business_name || '',
    whatYouSell: row.what_you_sell || '',
    weeklyIncome: Number(row.weekly_income || 0),
    biggestChallenge: row.biggest_challenge || '',
    createdAt: row.created_at || null,
  }
}

function getPendingSignupName() {
  try {
    return localStorage.getItem('kobcin_pending_signup_name') || ''
  } catch {
    return ''
  }
}

function setPendingSignupName(name) {
  try {
    if (name) {
      localStorage.setItem('kobcin_pending_signup_name', name)
    } else {
      localStorage.removeItem('kobcin_pending_signup_name')
    }
  } catch {}
}

function toProfileRow(profile, userId) {
  return {
    id: userId,
    name: profile.name || '',
    business_name: profile.businessName || '',
    what_you_sell: profile.whatYouSell || '',
    weekly_income: Number(profile.weeklyIncome || 0),
    biggest_challenge: profile.biggestChallenge || '',
  }
}

function mapTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount || 0),
    description: stripSaleMarker(row.description || ''),
    saleId: parseSaleId(row.description || ''),
    date: normalizeDate(row.date),
    createdAt: row.created_at || null,
  }
}

function toTransactionRow(transaction, userId) {
  return {
    id: transaction.id,
    user_id: userId,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    description: transaction.saleId
      ? buildSaleDescription(transaction.itemName || '', transaction.saleId, transaction.description)
      : transaction.description,
    date: toDateOnlyLocal(transaction.date),
  }
}

function mapStockItem(row) {
  return {
    id: row.id,
    name: row.name || '',
    quantity: Number(row.quantity || 0),
    reorderLevel: Number(row.reorder_level || 0),
    unit: row.unit || 'kg',
    createdAt: row.created_at || null,
  }
}

function toStockItemRow(item, userId) {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    quantity: Number(item.quantity || 0),
    reorder_level: Number(item.reorderLevel || 0),
    unit: item.unit,
  }
}

function mapSale(row) {
  return {
    id: row.id,
    stockItemId: row.stock_item_id,
    item: row.item_name || '',
    quantity: Number(row.quantity || 0),
    amount: Number(row.amount || 0),
    date: normalizeDate(row.date),
    createdAt: row.created_at || null,
  }
}

function toSaleRow(sale, userId) {
  return {
    id: sale.id,
    user_id: userId,
    stock_item_id: sale.stockItemId || null,
    item_name: sale.item,
    quantity: Number(sale.quantity || 0),
    amount: Number(sale.amount || 0),
    date: toDateOnlyLocal(sale.date),
  }
}

function mapSuppliers(suppliersRows, priceRows) {
  const pricesBySupplier = priceRows.reduce((acc, row) => {
    const list = acc[row.supplier_id] || []
    list.push({
      id: row.id,
      price: Number(row.price || 0),
      date: normalizeDate(row.date),
      createdAt: row.created_at || null,
    })
    acc[row.supplier_id] = list
    return acc
  }, {})

  return suppliersRows.map((row) => ({
    id: row.id,
    name: row.name || '',
    items: row.items || '',
    phone: row.phone || '',
    createdAt: row.created_at || null,
    priceHistory: (pricesBySupplier[row.id] || []).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    ),
  }))
}

function mapSavingsGoal(row) {
  if (!row) return EMPTY_SAVINGS_GOAL
  return {
    id: row.id,
    target: Number(row.target || 0),
    current: Number(row.current || 0),
    createdAt: row.created_at || null,
  }
}

function mapWin(row) {
  return {
    id: row.id,
    text: row.text || '',
    date: normalizeDate(row.date),
    createdAt: row.created_at || null,
  }
}

function mapStreak(row) {
  if (!row) return EMPTY_STREAK
  return {
    id: row.id,
    currentStreak: Number(row.current_streak || 0),
    lastLoginDate: row.last_login_date || null,
    createdAt: row.created_at || null,
  }
}

function mapChatMessage(row) {
  return {
    id: row.id,
    role: row.role,
    content: row.content || '',
    createdAt: row.created_at || null,
  }
}

function mapBusinessPlan(row) {
  if (!row) return null
  return {
    id: row.id,
    planText: row.plan_text || '',
    createdAt: row.created_at || null,
  }
}

function mapMentorConnection(row) {
  return {
    id: row.id,
    mentorName: row.mentor_name || '',
    mentorBusiness: row.mentor_business || '',
    connectedAt: row.connected_at || null,
  }
}

function mapPitchFeedback(row) {
  return {
    id: row.id,
    pitchText: row.pitch_text || '',
    aiFeedback: row.ai_feedback || '',
    createdAt: row.created_at || null,
  }
}

function calculateStreak(currentValue) {
  const today = toDateOnlyLocal()
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = toDateOnlyLocal(yesterdayDate)

  if (!currentValue?.lastLoginDate) {
    return { ...EMPTY_STREAK, currentStreak: 1, lastLoginDate: today }
  }

  if (currentValue.lastLoginDate === today) {
    return currentValue
  }

  if (currentValue.lastLoginDate === yesterday) {
    return {
      ...currentValue,
      currentStreak: Number(currentValue.currentStreak || 0) + 1,
      lastLoginDate: today,
    }
  }

  return {
    ...currentValue,
    currentStreak: 1,
    lastLoginDate: today,
  }
}

function normalizeAuthText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatAuthError(error, fallbackMessage) {
  const message = normalizeAuthText(error?.message)

  if (!message) return fallbackMessage
  if (message.toLowerCase().includes('email signups are disabled')) return 'Email signup is disabled in Supabase. Enable Email provider in Supabase Auth settings.'
  if (message.toLowerCase().includes('password should be at least')) return 'Password must be at least 6 characters long.'
  if (message.toLowerCase().includes('invalid email')) return 'Please enter a valid email address.'
  if (message.toLowerCase().includes('user already registered')) return 'This email is already registered. Try logging in instead.'

  return message
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [networkWarning, setNetworkWarning] = useState(false)

  const [userProfile, setUserProfileState] = useState(EMPTY_STATE.userProfile)
  const [transactions, setTransactionsState] = useState(EMPTY_STATE.transactions)
  const [stockItems, setStockItemsState] = useState(EMPTY_STATE.stockItems)
  const [sales, setSalesState] = useState(EMPTY_STATE.sales)
  const [suppliers, setSuppliersState] = useState(EMPTY_STATE.suppliers)
  const [savingsGoal, setSavingsGoalState] = useState(EMPTY_STATE.savingsGoal)
  const [streak, setStreakState] = useState(EMPTY_STATE.streak)
  const [winJournal, setWinJournalState] = useState(EMPTY_STATE.winJournal)
  const [chatMessages, setChatMessagesState] = useState(EMPTY_STATE.chatMessages)
  const [businessPlan, setBusinessPlanState] = useState(EMPTY_STATE.businessPlan)
  const [mentorConnections, setMentorConnectionsState] = useState(EMPTY_STATE.mentorConnections)
  const [pitchFeedback, setPitchFeedbackState] = useState(EMPTY_STATE.pitchFeedback)
  const [authError, setAuthError] = useState(supabaseConfigError)

  const warningTimerRef = useRef(null)

  const clearAllState = () => {
    setUserProfileState(EMPTY_STATE.userProfile)
    setTransactionsState(EMPTY_STATE.transactions)
    setStockItemsState(EMPTY_STATE.stockItems)
    setSalesState(EMPTY_STATE.sales)
    setSuppliersState(EMPTY_STATE.suppliers)
    setSavingsGoalState(EMPTY_STATE.savingsGoal)
    setStreakState(EMPTY_STATE.streak)
    setWinJournalState(EMPTY_STATE.winJournal)
    setChatMessagesState(EMPTY_STATE.chatMessages)
    setBusinessPlanState(EMPTY_STATE.businessPlan)
    setMentorConnectionsState(EMPTY_STATE.mentorConnections)
    setPitchFeedbackState(EMPTY_STATE.pitchFeedback)
  }

  const showNetworkWarning = () => {
    setNetworkWarning(true)
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    warningTimerRef.current = setTimeout(() => setNetworkWarning(false), 4000)
  }

  useEffect(() => {
    if (!user?.id) return

    writeCache(user.id, {
      userProfile,
      transactions,
      stockItems,
      sales,
      suppliers,
      savingsGoal,
      streak,
      winJournal,
      chatMessages,
      businessPlan,
      mentorConnections,
      pitchFeedback,
    })
  }, [
    user,
    userProfile,
    transactions,
    stockItems,
    sales,
    suppliers,
    savingsGoal,
    streak,
    winJournal,
    chatMessages,
    businessPlan,
    mentorConnections,
    pitchFeedback,
  ])

  useEffect(() => () => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
  }, [])

  const loadUserData = async (authUser) => {
    setDataLoading(true)

    try {
      const [
        profileResult,
        transactionsResult,
        stockItemsResult,
        salesResult,
        suppliersResult,
        supplierPricesResult,
        savingsGoalResult,
        winsResult,
        streakResult,
        chatMessagesResult,
        businessPlanResult,
        mentorConnectionsResult,
        pitchFeedbackResult,
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
        supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('stock_items').select('*').order('created_at', { ascending: false }),
        supabase.from('sales').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
        supabase.from('supplier_prices').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('savings_goal').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('wins').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('streak').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('business_plans').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('mentor_connections').select('*').order('connected_at', { ascending: false }),
        supabase.from('pitch_feedback').select('*').order('created_at', { ascending: false }),
      ])

      const errors = [
        profileResult.error,
        transactionsResult.error,
        stockItemsResult.error,
        salesResult.error,
        suppliersResult.error,
        supplierPricesResult.error,
        savingsGoalResult.error,
        winsResult.error,
        streakResult.error,
        chatMessagesResult.error,
        businessPlanResult.error,
        mentorConnectionsResult.error,
        pitchFeedbackResult.error,
      ].filter(Boolean)

      if (errors.length > 0) {
        throw errors[0]
      }

      const nextProfile = mapProfile(profileResult.data)
      const nextTransactions = (transactionsResult.data || []).map(mapTransaction)
      const nextStockItems = (stockItemsResult.data || []).map(mapStockItem)
      const nextSales = (salesResult.data || []).map(mapSale)
      const nextSuppliers = mapSuppliers(suppliersResult.data || [], supplierPricesResult.data || [])
      const nextSavingsGoal = mapSavingsGoal(savingsGoalResult.data)
      const nextWinJournal = (winsResult.data || []).map(mapWin)
      const rawStreak = mapStreak(streakResult.data)
      const nextChatMessages = (chatMessagesResult.data || []).map(mapChatMessage)
      const nextBusinessPlan = mapBusinessPlan(businessPlanResult.data)
      const nextMentorConnections = (mentorConnectionsResult.data || []).map(mapMentorConnection)
      const nextPitchFeedback = (pitchFeedbackResult.data || []).map(mapPitchFeedback)

      setUserProfileState(nextProfile)
      setTransactionsState(nextTransactions)
      setStockItemsState(nextStockItems)
      setSalesState(nextSales)
      setSuppliersState(nextSuppliers)
      setSavingsGoalState(nextSavingsGoal)
      setWinJournalState(nextWinJournal)
      setChatMessagesState(nextChatMessages)
      setBusinessPlanState(nextBusinessPlan)
      setMentorConnectionsState(nextMentorConnections)
      setPitchFeedbackState(nextPitchFeedback)

      const computedStreak = calculateStreak(rawStreak)
      setStreakState(computedStreak)

      if (
        computedStreak.currentStreak !== rawStreak.currentStreak ||
        computedStreak.lastLoginDate !== rawStreak.lastLoginDate
      ) {
        try {
          if (rawStreak.id) {
            const { error } = await supabase
              .from('streak')
              .update({
                current_streak: computedStreak.currentStreak,
                last_login_date: computedStreak.lastLoginDate,
              })
              .eq('id', rawStreak.id)

            if (error) throw error
          } else {
            const { data, error } = await supabase
              .from('streak')
              .insert({
                user_id: authUser.id,
                current_streak: computedStreak.currentStreak,
                last_login_date: computedStreak.lastLoginDate,
              })
              .select()
              .single()

            if (error) throw error
            setStreakState(mapStreak(data))
          }
        } catch {
          showNetworkWarning()
        }
      }
    } catch {
      showNetworkWarning()
      const cached = readCache(authUser.id)
      if (cached) {
        setUserProfileState(cached.userProfile || EMPTY_STATE.userProfile)
        setTransactionsState(cached.transactions || EMPTY_STATE.transactions)
        setStockItemsState(cached.stockItems || EMPTY_STATE.stockItems)
        setSalesState(cached.sales || EMPTY_STATE.sales)
        setSuppliersState(cached.suppliers || EMPTY_STATE.suppliers)
        setSavingsGoalState(cached.savingsGoal || EMPTY_STATE.savingsGoal)
        setStreakState(cached.streak || EMPTY_STATE.streak)
        setWinJournalState(cached.winJournal || EMPTY_STATE.winJournal)
        setChatMessagesState(cached.chatMessages || EMPTY_STATE.chatMessages)
        setBusinessPlanState(cached.businessPlan || EMPTY_STATE.businessPlan)
        setMentorConnectionsState(cached.mentorConnections || EMPTY_STATE.mentorConnections)
        setPitchFeedbackState(cached.pitchFeedback || EMPTY_STATE.pitchFeedback)
      } else {
        clearAllState()
      }
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        const currentUser = data.session?.user || null
        if (!mounted) return
        setUser(currentUser)

        if (currentUser) {
          await loadUserData(currentUser)
        } else {
          clearAllState()
        }
      } catch {
        showNetworkWarning()
        clearAllState()
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const nextUser = session?.user || null
      setUser(nextUser)

      if (nextUser) {
        void loadUserData(nextUser)
      } else {
        clearAllState()
        setDataLoading(false)
      }

      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    if (supabaseConfigError) {
      return { success: false, error: new Error(supabaseConfigError) }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeAuthText(email),
        password,
      })
      if (error) throw error
      setAuthError('')
      return { success: true }
    } catch (error) {
      console.error('Supabase signIn failed:', error)
      const friendlyError = new Error(formatAuthError(error, 'Unable to log in right now.'))
      setAuthError(friendlyError.message)
      return { success: false, error: friendlyError }
    }
  }

  const signUp = async ({ email, password, fullName }) => {
    if (supabaseConfigError) {
      return { success: false, error: new Error(supabaseConfigError) }
    }

    try {
      const trimmedName = (fullName || '').trim()
      const trimmedEmail = normalizeAuthText(email)

      if (!trimmedEmail) {
        throw new Error('Please enter your email address.')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.')
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: trimmedName ? { full_name: trimmedName } : undefined,
        },
      })

      if (error) throw error
      setPendingSignupName(trimmedName)
      setAuthError('')
      return { success: true, data }
    } catch (error) {
      console.error('Supabase signUp failed:', error)
      const friendlyError = new Error(formatAuthError(error, 'Unable to sign up right now.'))
      setAuthError(friendlyError.message)
      return { success: false, error: friendlyError }
    }
  }

  const signOut = async () => {
    if (supabaseConfigError) {
      return { success: false, error: new Error(supabaseConfigError) }
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setPendingSignupName('')
      setAuthError('')
      return { success: true }
    } catch (error) {
      setAuthError(error?.message || 'Logout failed')
      showNetworkWarning()
      return { success: false, error }
    }
  }

  const updateProfile = async (profileValues) => {
    if (!user?.id) return { success: false }

    const nextProfile = {
      ...userProfile,
      ...profileValues,
      name: profileValues.name ?? userProfile?.name ?? user?.user_metadata?.full_name ?? getPendingSignupName(),
      weeklyIncome: Number(profileValues.weeklyIncome ?? userProfile?.weeklyIncome ?? 0),
    }

    setUserProfileState(nextProfile)

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(toProfileRow(nextProfile, user.id))
        .select()
        .single()

      if (error) throw error
      setUserProfileState(mapProfile(data))
      setPendingSignupName('')
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const addTransaction = async (transactionInput) => {
    if (!user?.id) return { success: false }

    const transaction = {
      id: crypto.randomUUID(),
      type: transactionInput.type,
      amount: Number(transactionInput.amount || 0),
      description: transactionInput.description || (transactionInput.type === 'income' ? 'Dakhli' : 'Kharashaad'),
      saleId: transactionInput.saleId || null,
      itemName: transactionInput.itemName || '',
      date: transactionInput.date || new Date().toISOString(),
    }

    setTransactionsState((prev) => [transaction, ...prev])

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(toTransactionRow(transaction, user.id))
        .select()
        .single()

      if (error) throw error
      const mapped = mapTransaction(data)
      setTransactionsState((prev) => [mapped, ...prev.filter((item) => item.id !== transaction.id)])
      return { success: true, data: mapped }
    } catch {
      showNetworkWarning()
      return { success: false, data: transaction }
    }
  }

  const updateTransaction = async (transactionId, updates) => {
    const current = transactions.find((item) => item.id === transactionId)
    if (!user?.id || !current) return { success: false }

    const nextTransaction = {
      ...current,
      ...updates,
      amount: Number(updates.amount ?? current.amount ?? 0),
    }

    setTransactionsState((prev) => prev.map((item) => (
      item.id === transactionId ? nextTransaction : item
    )))

    try {
      const payload = {
        type: nextTransaction.type,
        amount: Number(nextTransaction.amount || 0),
        description: nextTransaction.saleId
          ? buildSaleDescription(nextTransaction.itemName || nextTransaction.description, nextTransaction.saleId, nextTransaction.description)
          : nextTransaction.description,
        date: toDateOnlyLocal(nextTransaction.date),
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transactionId)
        .select()
        .single()

      if (error) throw error
      const mapped = mapTransaction(data)
      setTransactionsState((prev) => prev.map((item) => (
        item.id === transactionId ? mapped : item
      )))
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const deleteTransaction = async (transactionId) => {
    setTransactionsState((prev) => prev.filter((item) => item.id !== transactionId))

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId)
      if (error) throw error
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const addStockItem = async (itemInput) => {
    if (!user?.id) return { success: false }

    const item = {
      id: crypto.randomUUID(),
      name: itemInput.name,
      quantity: Number(itemInput.quantity || 0),
      reorderLevel: Number(itemInput.reorderLevel || 0),
      unit: itemInput.unit || 'kg',
    }

    setStockItemsState((prev) => [...prev, item])

    try {
      const { data, error } = await supabase
        .from('stock_items')
        .insert(toStockItemRow(item, user.id))
        .select()
        .single()

      if (error) throw error
      const mapped = mapStockItem(data)
      setStockItemsState((prev) => prev.map((entry) => (entry.id === item.id ? mapped : entry)))
      return { success: true, data: mapped }
    } catch {
      showNetworkWarning()
      return { success: false, data: item }
    }
  }

  const updateStockItem = async (itemId, updates) => {
    const current = stockItems.find((item) => item.id === itemId)
    if (!current) return { success: false }

    const nextItem = {
      ...current,
      ...updates,
      quantity: Number(updates.quantity ?? current.quantity ?? 0),
      reorderLevel: Number(updates.reorderLevel ?? current.reorderLevel ?? 0),
    }

    setStockItemsState((prev) => prev.map((item) => (
      item.id === itemId ? nextItem : item
    )))

    try {
      const { data, error } = await supabase
        .from('stock_items')
        .update({
          name: nextItem.name,
          quantity: Number(nextItem.quantity || 0),
          reorder_level: Number(nextItem.reorderLevel || 0),
          unit: nextItem.unit,
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      const mapped = mapStockItem(data)
      setStockItemsState((prev) => prev.map((item) => (item.id === itemId ? mapped : item)))
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const adjustStockItemQuantity = async (itemId, delta) => {
    const current = stockItems.find((item) => item.id === itemId)
    if (!current) return { success: false }
    const nextQuantity = Math.max(0, Number(current.quantity || 0) + delta)
    return updateStockItem(itemId, { quantity: nextQuantity })
  }

  const deleteStockItem = async (itemId) => {
    setStockItemsState((prev) => prev.filter((item) => item.id !== itemId))

    try {
      const { error } = await supabase.from('stock_items').delete().eq('id', itemId)
      if (error) throw error
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const addSale = async ({ stockItemId, quantity, amount }) => {
    if (!user?.id) return { success: false }

    const stockItem = stockItems.find((item) => item.id === stockItemId)
    if (!stockItem) return { success: false }

    const saleQuantity = Number(quantity || 0)
    const saleAmount = Number(amount || 0)
    const nextQuantity = Math.max(0, Number(stockItem.quantity || 0) - saleQuantity)
    const saleId = crypto.randomUUID()
    const transactionId = crypto.randomUUID()
    const now = new Date().toISOString()

    const sale = {
      id: saleId,
      stockItemId,
      item: stockItem.name,
      quantity: saleQuantity,
      amount: saleAmount,
      date: now,
    }

    const linkedTransaction = {
      id: transactionId,
      type: 'income',
      amount: saleAmount,
      description: `Iib: ${stockItem.name}`,
      saleId,
      itemName: stockItem.name,
      date: now,
    }

    setSalesState((prev) => [sale, ...prev])
    setTransactionsState((prev) => [linkedTransaction, ...prev])
    setStockItemsState((prev) => prev.map((item) => (
      item.id === stockItemId ? { ...item, quantity: nextQuantity } : item
    )))

    try {
      const [saleResult, transactionResult, stockResult] = await Promise.all([
        supabase.from('sales').insert(toSaleRow(sale, user.id)).select().single(),
        supabase.from('transactions').insert(toTransactionRow(linkedTransaction, user.id)).select().single(),
        supabase.from('stock_items').update({ quantity: nextQuantity }).eq('id', stockItemId).select().single(),
      ])

      if (saleResult.error || transactionResult.error || stockResult.error) {
        throw saleResult.error || transactionResult.error || stockResult.error
      }

      const mappedSale = mapSale(saleResult.data)
      const mappedTransaction = mapTransaction(transactionResult.data)
      const mappedStockItem = mapStockItem(stockResult.data)

      setSalesState((prev) => [mappedSale, ...prev.filter((item) => item.id !== saleId)])
      setTransactionsState((prev) => [mappedTransaction, ...prev.filter((item) => item.id !== transactionId)])
      setStockItemsState((prev) => prev.map((item) => (
        item.id === stockItemId ? mappedStockItem : item
      )))

      return { success: true, data: mappedSale }
    } catch {
      showNetworkWarning()
      return { success: false, data: sale }
    }
  }

  const deleteSale = async (sale) => {
    const linkedTransaction = transactions.find((item) => item.saleId === sale.id)
    const stockItem = sale.stockItemId
      ? stockItems.find((item) => item.id === sale.stockItemId)
      : stockItems.find((item) => item.name === sale.item)
    const restoredQuantity = stockItem ? Number(stockItem.quantity || 0) + Number(sale.quantity || 0) : null

    setSalesState((prev) => prev.filter((item) => item.id !== sale.id))
    setTransactionsState((prev) => prev.filter((item) => item.saleId !== sale.id))

    if (stockItem) {
      setStockItemsState((prev) => prev.map((item) => (
        item.id === stockItem.id ? { ...item, quantity: restoredQuantity } : item
      )))
    }

    try {
      const tasks = [
        supabase.from('sales').delete().eq('id', sale.id),
      ]

      if (linkedTransaction) {
        tasks.push(supabase.from('transactions').delete().eq('id', linkedTransaction.id))
      }

      if (stockItem) {
        tasks.push(
          supabase.from('stock_items').update({ quantity: restoredQuantity }).eq('id', stockItem.id),
        )
      }

      const results = await Promise.all(tasks)
      const failed = results.find((result) => result.error)
      if (failed?.error) throw failed.error

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const addSupplier = async ({ name, items, phone, price }) => {
    if (!user?.id) return { success: false }

    const supplierId = crypto.randomUUID()
    const supplier = {
      id: supplierId,
      name,
      items,
      phone,
      priceHistory: [],
    }

    setSuppliersState((prev) => [...prev, supplier])

    try {
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .insert({
          id: supplierId,
          user_id: user.id,
          name,
          items,
          phone,
        })
        .select()
        .single()

      if (supplierError) throw supplierError

      let mappedSupplier = {
        ...supplier,
        createdAt: supplierData.created_at || null,
      }

      if (Number(price || 0) > 0) {
        const priceEntry = {
          id: crypto.randomUUID(),
          supplier_id: supplierId,
          price: Number(price),
          date: toDateOnlyLocal(),
        }

        const { data: priceData, error: priceError } = await supabase
          .from('supplier_prices')
          .insert(priceEntry)
          .select()
          .single()

        if (priceError) throw priceError

        mappedSupplier = {
          ...mappedSupplier,
          priceHistory: [{
            id: priceData.id,
            price: Number(priceData.price || 0),
            date: normalizeDate(priceData.date),
            createdAt: priceData.created_at || null,
          }],
        }
      }

      setSuppliersState((prev) => prev.map((entry) => (
        entry.id === supplierId ? mappedSupplier : entry
      )))

      return { success: true, data: mappedSupplier }
    } catch {
      showNetworkWarning()
      return { success: false, data: supplier }
    }
  }

  const updateSupplier = async (supplierId, updates) => {
    const current = suppliers.find((supplier) => supplier.id === supplierId)
    if (!current) return { success: false }

    const nextSupplier = { ...current, ...updates }
    setSuppliersState((prev) => prev.map((supplier) => (
      supplier.id === supplierId ? nextSupplier : supplier
    )))

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          name: nextSupplier.name,
          items: nextSupplier.items,
          phone: nextSupplier.phone,
        })
        .eq('id', supplierId)
        .select()
        .single()

      if (error) throw error

      setSuppliersState((prev) => prev.map((supplier) => (
        supplier.id === supplierId
          ? {
              ...supplier,
              name: data.name || '',
              items: data.items || '',
              phone: data.phone || '',
            }
          : supplier
      )))

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const deleteSupplier = async (supplierId) => {
    setSuppliersState((prev) => prev.filter((supplier) => supplier.id !== supplierId))

    try {
      const [priceResult, supplierResult] = await Promise.all([
        supabase.from('supplier_prices').delete().eq('supplier_id', supplierId),
        supabase.from('suppliers').delete().eq('id', supplierId),
      ])

      if (priceResult.error || supplierResult.error) {
        throw priceResult.error || supplierResult.error
      }

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const addSupplierPrice = async (supplierId, price) => {
    const entry = {
      id: crypto.randomUUID(),
      price: Number(price || 0),
      date: new Date().toISOString(),
    }

    setSuppliersState((prev) => prev.map((supplier) => (
      supplier.id === supplierId
        ? { ...supplier, priceHistory: [...supplier.priceHistory, entry] }
        : supplier
    )))

    try {
      const { data, error } = await supabase
        .from('supplier_prices')
        .insert({
          id: entry.id,
          supplier_id: supplierId,
          price: entry.price,
          date: toDateOnlyLocal(entry.date),
        })
        .select()
        .single()

      if (error) throw error

      const mappedEntry = {
        id: data.id,
        price: Number(data.price || 0),
        date: normalizeDate(data.date),
        createdAt: data.created_at || null,
      }

      setSuppliersState((prev) => prev.map((supplier) => (
        supplier.id === supplierId
          ? {
              ...supplier,
              priceHistory: supplier.priceHistory.map((priceItem) => (
                priceItem.id === entry.id ? mappedEntry : priceItem
              )),
            }
          : supplier
      )))

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const setSavingsGoal = async (goalInput) => {
    if (!user?.id) return { success: false }

    const nextGoal = {
      ...savingsGoal,
      ...goalInput,
      target: Number(goalInput.target ?? savingsGoal.target ?? 0),
      current: Number(goalInput.current ?? savingsGoal.current ?? 0),
    }

    setSavingsGoalState(nextGoal)

    try {
      if (nextGoal.id) {
        const { data, error } = await supabase
          .from('savings_goal')
          .update({
            target: nextGoal.target,
            current: nextGoal.current,
          })
          .eq('id', nextGoal.id)
          .select()
          .single()

        if (error) throw error
        setSavingsGoalState(mapSavingsGoal(data))
      } else {
        const { data, error } = await supabase
          .from('savings_goal')
          .insert({
            user_id: user.id,
            target: nextGoal.target,
            current: nextGoal.current,
          })
          .select()
          .single()

        if (error) throw error
        setSavingsGoalState(mapSavingsGoal(data))
      }

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const updateSavingsCurrent = async (currentAmount) => {
    return setSavingsGoal({ current: Number(currentAmount || 0) })
  }

  const addWin = async (text) => {
    if (!user?.id) return { success: false }

    const win = {
      id: crypto.randomUUID(),
      text,
      date: new Date().toISOString(),
    }

    setWinJournalState((prev) => [win, ...prev])

    try {
      const { data, error } = await supabase
        .from('wins')
        .insert({
          id: win.id,
          user_id: user.id,
          text: win.text,
          date: toDateOnlyLocal(win.date),
        })
        .select()
        .single()

      if (error) throw error
      const mapped = mapWin(data)
      setWinJournalState((prev) => [mapped, ...prev.filter((entry) => entry.id !== win.id)])
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const deleteWin = async (winId) => {
    setWinJournalState((prev) => prev.filter((entry) => entry.id !== winId))

    try {
      const { error } = await supabase.from('wins').delete().eq('id', winId)
      if (error) throw error
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const updateStreak = async () => {
    if (!user?.id) return { success: false }

    const nextStreak = calculateStreak(streak)
    setStreakState(nextStreak)

    try {
      if (streak.id) {
        const { data, error } = await supabase
          .from('streak')
          .update({
            current_streak: nextStreak.currentStreak,
            last_login_date: nextStreak.lastLoginDate,
          })
          .eq('id', streak.id)
          .select()
          .single()

        if (error) throw error
        setStreakState(mapStreak(data))
      } else {
        const { data, error } = await supabase
          .from('streak')
          .insert({
            user_id: user.id,
            current_streak: nextStreak.currentStreak,
            last_login_date: nextStreak.lastLoginDate,
          })
          .select()
          .single()

        if (error) throw error
        setStreakState(mapStreak(data))
      }

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const saveChatMessage = async ({ role, content }) => {
    if (!user?.id) return { success: false }

    const message = {
      id: crypto.randomUUID(),
      role,
      content,
      createdAt: new Date().toISOString(),
    }

    setChatMessagesState((prev) => [...prev, message])

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          user_id: user.id,
          role: message.role,
          content: message.content,
        })
        .select()
        .single()

      if (error) throw error
      const mapped = mapChatMessage(data)
      setChatMessagesState((prev) => prev.map((entry) => (
        entry.id === message.id ? mapped : entry
      )))
      return { success: true, data: mapped }
    } catch {
      showNetworkWarning()
      return { success: false, data: message }
    }
  }

  const clearChatMessages = async () => {
    setChatMessagesState([])

    try {
      const { error } = await supabase.from('chat_messages').delete().eq('user_id', user?.id)
      if (error) throw error
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const saveBusinessPlan = async (planText) => {
    if (!user?.id) return { success: false }

    const optimisticPlan = businessPlan || {
      id: crypto.randomUUID(),
      planText,
      createdAt: new Date().toISOString(),
    }

    setBusinessPlanState({ ...optimisticPlan, planText })

    try {
      if (businessPlan?.id) {
        const { data, error } = await supabase
          .from('business_plans')
          .update({ plan_text: planText })
          .eq('id', businessPlan.id)
          .select()
          .single()

        if (error) throw error
        setBusinessPlanState(mapBusinessPlan(data))
      } else {
        const { data, error } = await supabase
          .from('business_plans')
          .insert({
            user_id: user.id,
            plan_text: planText,
          })
          .select()
          .single()

        if (error) throw error
        setBusinessPlanState(mapBusinessPlan(data))
      }

      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const deleteBusinessPlan = async () => {
    if (!businessPlan?.id) {
      setBusinessPlanState(null)
      return { success: true }
    }

    const currentId = businessPlan.id
    setBusinessPlanState(null)

    try {
      const { error } = await supabase.from('business_plans').delete().eq('id', currentId)
      if (error) throw error
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const saveMentorConnection = async ({ mentorName, mentorBusiness }) => {
    if (!user?.id) return { success: false }

    const connection = {
      id: crypto.randomUUID(),
      mentorName,
      mentorBusiness,
      connectedAt: new Date().toISOString(),
    }

    setMentorConnectionsState((prev) => [connection, ...prev])

    try {
      const { data, error } = await supabase
        .from('mentor_connections')
        .insert({
          id: connection.id,
          user_id: user.id,
          mentor_name: mentorName,
          mentor_business: mentorBusiness,
        })
        .select()
        .single()

      if (error) throw error
      const mapped = mapMentorConnection(data)
      setMentorConnectionsState((prev) => [mapped, ...prev.filter((entry) => entry.id !== connection.id)])
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const savePitchFeedback = async ({ pitchText, aiFeedback }) => {
    if (!user?.id) return { success: false }

    const feedback = {
      id: crypto.randomUUID(),
      pitchText,
      aiFeedback,
      createdAt: new Date().toISOString(),
    }

    setPitchFeedbackState((prev) => [feedback, ...prev])

    try {
      const { data, error } = await supabase
        .from('pitch_feedback')
        .insert({
          id: feedback.id,
          user_id: user.id,
          pitch_text: pitchText,
          ai_feedback: aiFeedback,
        })
        .select()
        .single()

      if (error) throw error
      const mapped = mapPitchFeedback(data)
      setPitchFeedbackState((prev) => [mapped, ...prev.filter((entry) => entry.id !== feedback.id)])
      return { success: true }
    } catch {
      showNetworkWarning()
      return { success: false }
    }
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    authLoading,
    dataLoading,
    networkWarning,
    authError,
    userProfile,
    transactions,
    stockItems,
    sales,
    suppliers,
    savingsGoal,
    streak,
    mentors: MENTORS,
    winJournal,
    chatMessages,
    businessPlan,
    mentorConnections,
    pitchFeedback,
    signIn,
    signUp,
    signOut,
    updateProfile,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addStockItem,
    updateStockItem,
    adjustStockItemQuantity,
    deleteStockItem,
    addSale,
    deleteSale,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierPrice,
    setSavingsGoal,
    updateSavingsCurrent,
    addWin,
    deleteWin,
    updateStreak,
    saveChatMessage,
    clearChatMessages,
    saveBusinessPlan,
    deleteBusinessPlan,
    saveMentorConnection,
    savePitchFeedback,
    reloadUserData: () => (user ? loadUserData(user) : Promise.resolve()),
  }), [
    user,
    authLoading,
    dataLoading,
    networkWarning,
    userProfile,
    transactions,
    stockItems,
    sales,
    suppliers,
    savingsGoal,
    streak,
    winJournal,
    chatMessages,
    businessPlan,
    mentorConnections,
    pitchFeedback,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
