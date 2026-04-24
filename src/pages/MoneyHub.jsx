import React, { useState, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'

const TABS = ['Diiwaangelinta', 'Warbixinta', 'Bartilmaameedyada']

function getWeekDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })
}

const SOMALI_DAYS_SHORT = ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab']

export default function MoneyHub() {
  const { transactions, setTransactions, savingsGoal, setSavingsGoal } = useApp()
  const [tab, setTab] = useState(0)
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [goalInput, setGoalInput] = useState('')

  // Edit transaction
  const [editingTx, setEditingTx] = useState(null)
  const [editTxForm, setEditTxForm] = useState({ type: 'income', amount: '', description: '' })
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null)

  // Savings goal target edit
  const [editingGoalTarget, setEditingGoalTarget] = useState(false)
  const [editGoalInput, setEditGoalInput] = useState('')

  // Toast
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const weekDays = useMemo(() => getWeekDays(), [])

  const weekTransactions = useMemo(() => {
    const start = weekDays[0]
    return transactions.filter(t => new Date(t.date) >= start)
  }, [transactions, weekDays])

  const weekIncome = weekTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const weekExpense = weekTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const weekProfit = weekIncome - weekExpense

  const dayTotals = useMemo(() => {
    return weekDays.map(day => {
      const next = new Date(day.getTime() + 86400000)
      const dayTxns = transactions.filter(t => {
        const d = new Date(t.date)
        return d >= day && d < next
      })
      return {
        label: SOMALI_DAYS_SHORT[day.getDay()],
        income: dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })
  }, [transactions, weekDays])

  const maxDay = Math.max(...dayTotals.map(d => Math.max(d.income, d.expense)), 1)

  const savingsProgress = savingsGoal.target > 0
    ? Math.min((savingsGoal.current / savingsGoal.target) * 100, 100)
    : 0

  const daysToGoal = useMemo(() => {
    if (weekProfit <= 0 || savingsGoal.target <= savingsGoal.current) return null
    const remaining = savingsGoal.target - savingsGoal.current
    const dailyRate = weekProfit / 7
    if (dailyRate <= 0) return null
    return Math.ceil(remaining / dailyRate)
  }, [weekProfit, savingsGoal])

  const hasAnyData = transactions.length > 0

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const handleSave = () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) return
    const txn = {
      id: Date.now().toString(),
      type,
      amount: amt,
      description: description || (type === 'income' ? 'Dakhli' : 'Kharashaad'),
      date: new Date().toISOString(),
    }
    setTransactions(prev => [txn, ...prev])
    setAmount('')
    setDescription('')
  }

  const handleSetGoal = () => {
    const target = Number(goalInput)
    if (!target || target <= 0) return
    setSavingsGoal(prev => ({ ...prev, target }))
    setGoalInput('')
  }

  const startEditTx = (tx) => {
    setEditingTx(tx.id)
    setEditTxForm({ type: tx.type, amount: String(tx.amount), description: tx.description })
    setConfirmDeleteTx(null)
  }

  const saveEditTx = () => {
    const amt = Number(editTxForm.amount)
    if (!amt || amt <= 0) return
    setTransactions(prev => prev.map(t =>
      t.id === editingTx
        ? { ...t, type: editTxForm.type, amount: amt, description: editTxForm.description || (editTxForm.type === 'income' ? 'Dakhli' : 'Kharashaad') }
        : t
    ))
    setEditingTx(null)
    showToast('Waa la cusbooneysiiyay')
  }

  const deleteTx = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    setConfirmDeleteTx(null)
    showToast('Waa la tirtirray')
  }

  const saveGoalTarget = () => {
    const target = Number(editGoalInput)
    if (!target || target <= 0) return
    setSavingsGoal(prev => ({ ...prev, target }))
    setEditingGoalTarget(false)
    setEditGoalInput('')
    showToast('Waa la cusbooneysiiyay')
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-brown text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold text-brown">Xarunta Lacagta 💰</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-amber-50 rounded-xl p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === i ? 'bg-white text-terracotta shadow-sm' : 'text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Log */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                type === 'income'
                  ? 'border-teal bg-teal bg-opacity-10 text-teal'
                  : 'border-amber-200 text-muted'
              }`}
            >
              ↑ Dakhli
            </button>
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                type === 'expense'
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-amber-200 text-muted'
              }`}
            >
              ↓ Kharashaad
            </button>
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Xaddiga (shilin)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="input-field text-xl font-bold"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Sharaxaada</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Maxay ahayd?"
              className="input-field"
            />
          </div>
          <button onClick={handleSave} disabled={!amount} className="btn-primary w-full py-3">
            Kaydi
          </button>

          <div>
            <h2 className="font-heading font-semibold text-brown mb-3">Dhaqdhaqaaqyada Dambe</h2>
            {!hasAnyData ? (
              <div className="card text-center py-8">
                <p className="text-3xl mb-3">💸</p>
                <p className="text-muted text-sm font-medium">Wali waxba ma diiwaan gelinin</p>
                <p className="text-muted text-xs mt-1">Bilow haddeer — geli dakhligaaga ama kharashkaaga</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 10).map(t => {
                  if (editingTx === t.id) {
                    return (
                      <div key={t.id} className="card space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditTxForm({ ...editTxForm, type: 'income' })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                              editTxForm.type === 'income' ? 'border-teal bg-teal bg-opacity-10 text-teal' : 'border-amber-200 text-muted'
                            }`}
                          >
                            ↑ Dakhli
                          </button>
                          <button
                            onClick={() => setEditTxForm({ ...editTxForm, type: 'expense' })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                              editTxForm.type === 'expense' ? 'border-red-400 bg-red-50 text-red-600' : 'border-amber-200 text-muted'
                            }`}
                          >
                            ↓ Kharashaad
                          </button>
                        </div>
                        <input
                          type="number"
                          value={editTxForm.amount}
                          onChange={e => setEditTxForm({ ...editTxForm, amount: e.target.value })}
                          placeholder="Xaddiga"
                          className="input-field"
                          autoFocus
                        />
                        <input
                          value={editTxForm.description}
                          onChange={e => setEditTxForm({ ...editTxForm, description: e.target.value })}
                          placeholder="Sharaxaada"
                          className="input-field"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingTx(null)} className="btn-secondary flex-1 text-sm">Jooji</button>
                          <button onClick={saveEditTx} disabled={!editTxForm.amount} className="btn-primary flex-1 text-sm">Kaydi</button>
                        </div>
                      </div>
                    )
                  }

                  if (confirmDeleteTx === t.id) {
                    return (
                      <div key={t.id} className="card border-red-200">
                        <p className="text-sm text-brown mb-3 font-medium">Ma hubtaa inaad tirtirto?</p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDeleteTx(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                          <button onClick={() => deleteTx(t.id)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={t.id} className="card flex items-center justify-between py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown truncate">{t.description}</p>
                        <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString('so-SO')}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <span className={`font-bold text-sm ${t.type === 'income' ? 'text-teal' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} sh
                        </span>
                        <button
                          onClick={() => startEditTx(t)}
                          className="text-muted hover:text-brown p-1 transition-colors text-base"
                          title="Wax ka beddel"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteTx(t.id); setEditingTx(null) }}
                          className="text-muted hover:text-red-500 p-1 transition-colors text-base"
                          title="Tirtir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Report */}
      {tab === 1 && (
        <div className="space-y-4">
          {!hasAnyData ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-muted font-medium text-sm">Warbixin ma jirto weli</p>
              <p className="text-muted text-xs mt-1">
                Marka aad dakhli ama kharashaad galisid, warbixintu halkan ka soo muuqan doontaa.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="card text-center">
                  <p className="text-xs text-muted mb-1">Dakhliga</p>
                  <p className="font-bold text-teal text-sm">{weekIncome.toLocaleString()}</p>
                  <p className="text-xs text-muted">sh</p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-muted mb-1">Kharashaadka</p>
                  <p className="font-bold text-red-500 text-sm">{weekExpense.toLocaleString()}</p>
                  <p className="text-xs text-muted">sh</p>
                </div>
                <div className="card text-center">
                  <p className="text-xs text-muted mb-1">Faa'iidada</p>
                  <p className={`font-bold text-sm ${weekProfit >= 0 ? 'text-teal' : 'text-red-500'}`}>
                    {weekProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted">sh</p>
                </div>
              </div>

              <div className="card">
                <h2 className="font-heading font-semibold text-brown mb-4">7 Maalmood</h2>
                <div className="flex items-end gap-2 h-32">
                  {dayTotals.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100px' }}>
                        {d.income > 0 && (
                          <div
                            className="w-full bg-teal rounded-t-sm"
                            style={{ height: `${(d.income / maxDay) * 100}px` }}
                          />
                        )}
                        {d.expense > 0 && (
                          <div
                            className="w-full bg-red-300 rounded-t-sm"
                            style={{ height: `${(d.expense / maxDay) * 100}px` }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-muted">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-teal rounded-sm" />
                    <span className="text-xs text-muted">Dakhli</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-300 rounded-sm" />
                    <span className="text-xs text-muted">Kharashaad</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Goals */}
      {tab === 2 && (
        <div className="space-y-4">
          {savingsGoal.target === 0 ? (
            <div className="card text-center py-8">
              <p className="text-3xl mb-3">🎯</p>
              <p className="text-muted font-medium text-sm">Bartilmaameed ma jiro weli</p>
              <p className="text-muted text-xs mt-1 mb-4">
                Dhig bartilmaameed kaydka hoose, kadibna waxaad arki doontaa horumarka
              </p>
            </div>
          ) : (
            <div className="card">
              <h2 className="font-heading font-semibold text-brown mb-3">Bartilmaameedka Kaydka</h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">La kaydiyay</span>
                <span className="text-terracotta font-medium">{Math.round(savingsProgress)}%</span>
              </div>
              <div className="h-3 bg-amber-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-teal rounded-full transition-all"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="font-bold text-teal">{savingsGoal.current.toLocaleString()} sh</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted">/ {savingsGoal.target.toLocaleString()} sh</span>
                  <button
                    onClick={() => { setEditingGoalTarget(true); setEditGoalInput(String(savingsGoal.target)) }}
                    className="text-muted hover:text-brown transition-colors text-base"
                    title="Wax ka beddel bartilmaameedka"
                  >
                    ✏️
                  </button>
                </div>
              </div>
              {editingGoalTarget && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    value={editGoalInput}
                    onChange={e => setEditGoalInput(e.target.value)}
                    placeholder="Bartilmaameedka cusub (sh)"
                    className="input-field flex-1 text-sm"
                    autoFocus
                  />
                  <button onClick={saveGoalTarget} disabled={!editGoalInput} className="btn-primary text-sm flex-shrink-0">Kaydi</button>
                  <button onClick={() => setEditingGoalTarget(false)} className="btn-secondary text-sm flex-shrink-0">Jooji</button>
                </div>
              )}
              {daysToGoal && (
                <p className="text-xs text-muted mt-3 text-center">
                  Haddaad sida hadda u socoto, ~{daysToGoal} maalmood ayaa loo baahan yahay bartilmaameedka in laga gaaro.
                </p>
              )}
            </div>
          )}

          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-3">
              {savingsGoal.target === 0 ? 'Dhig Bartilmaameedka' : 'Bedel Bartilmaameedka'}
            </h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                placeholder="Xaddiga bartilmaameedka (sh)"
                className="input-field flex-1"
              />
              <button onClick={handleSetGoal} disabled={!goalInput} className="btn-primary flex-shrink-0">
                Kaydi
              </button>
            </div>
          </div>

          {savingsGoal.target > 0 && (
            <div className="card">
              <h2 className="font-heading font-semibold text-brown mb-3">Geli Kaydka</h2>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Xaddiga"
                  id="savings-add"
                  className="input-field flex-1"
                />
                <button
                  onClick={() => {
                    const val = Number(document.getElementById('savings-add').value)
                    if (val > 0) {
                      setSavingsGoal(prev => ({ ...prev, current: prev.current + val }))
                      document.getElementById('savings-add').value = ''
                    }
                  }}
                  className="btn-primary flex-shrink-0"
                >
                  Ku dar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
