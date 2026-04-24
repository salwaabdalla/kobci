import React, { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

const TABS = ['Diiwaangelinta', 'Warbixinta', 'Bartilmaameedyada']
const SOMALI_DAYS_SHORT = ['Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim', 'Sab']

function getWeekDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)
    return date
  })
}

export default function MoneyHub() {
  const {
    transactions,
    savingsGoal,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setSavingsGoal,
    updateSavingsCurrent,
  } = useApp()

  const [tab, setTab] = useState(0)
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [savingsInput, setSavingsInput] = useState('')
  const [editingTx, setEditingTx] = useState(null)
  const [editTxForm, setEditTxForm] = useState({ type: 'income', amount: '', description: '' })
  const [confirmDeleteTx, setConfirmDeleteTx] = useState(null)
  const [editingGoalTarget, setEditingGoalTarget] = useState(false)
  const [editGoalInput, setEditGoalInput] = useState('')
  const [toast, setToast] = useState('')

  const toastTimer = useRef(null)
  const weekDays = useMemo(() => getWeekDays(), [])

  const weekTransactions = useMemo(() => {
    const start = weekDays[0]
    return transactions.filter((transaction) => new Date(transaction.date) >= start)
  }, [transactions, weekDays])

  const weekIncome = weekTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const weekExpense = weekTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const weekProfit = weekIncome - weekExpense
  const hasAnyData = transactions.length > 0

  const dayTotals = useMemo(() => weekDays.map((day) => {
    const next = new Date(day.getTime() + 86400000)
    const dayTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return date >= day && date < next
    })

    return {
      label: SOMALI_DAYS_SHORT[day.getDay()],
      income: dayTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
      expense: dayTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    }
  }), [transactions, weekDays])

  const maxDay = Math.max(...dayTotals.map((day) => Math.max(day.income, day.expense)), 1)
  const savingsProgress = savingsGoal.target > 0 ? Math.min((savingsGoal.current / savingsGoal.target) * 100, 100) : 0

  const daysToGoal = useMemo(() => {
    if (weekProfit <= 0 || savingsGoal.target <= savingsGoal.current) return null
    const remaining = savingsGoal.target - savingsGoal.current
    const dailyRate = weekProfit / 7
    if (dailyRate <= 0) return null
    return Math.ceil(remaining / dailyRate)
  }, [weekProfit, savingsGoal])

  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const handleSave = async () => {
    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) return

    await addTransaction({
      type,
      amount: numericAmount,
      description: description || (type === 'income' ? 'Dakhli' : 'Kharashaad'),
      date: new Date().toISOString(),
    })

    setAmount('')
    setDescription('')
  }

  const handleSetGoal = async () => {
    const target = Number(goalInput)
    if (!target || target <= 0) return

    await setSavingsGoal({
      target,
      current: savingsGoal.current,
    })

    setGoalInput('')
  }

  const startEditTx = (transaction) => {
    setEditingTx(transaction.id)
    setEditTxForm({
      type: transaction.type,
      amount: String(transaction.amount),
      description: transaction.description,
    })
    setConfirmDeleteTx(null)
  }

  const saveEditTx = async () => {
    const numericAmount = Number(editTxForm.amount)
    if (!numericAmount || numericAmount <= 0) return

    await updateTransaction(editingTx, {
      type: editTxForm.type,
      amount: numericAmount,
      description: editTxForm.description || (editTxForm.type === 'income' ? 'Dakhli' : 'Kharashaad'),
    })

    setEditingTx(null)
    showToast('Waa la cusbooneysiiyay')
  }

  const removeTransaction = async (transactionId) => {
    await deleteTransaction(transactionId)
    setConfirmDeleteTx(null)
    showToast('Waa la tirtiray')
  }

  const saveGoalTarget = async () => {
    const target = Number(editGoalInput)
    if (!target || target <= 0) return

    await setSavingsGoal({
      target,
      current: savingsGoal.current,
    })

    setEditingGoalTarget(false)
    setEditGoalInput('')
    showToast('Waa la cusbooneysiiyay')
  }

  const handleSavingsAdd = async () => {
    const amountToAdd = Number(savingsInput)
    if (!amountToAdd || amountToAdd <= 0) return

    await updateSavingsCurrent(Number(savingsGoal.current || 0) + amountToAdd)
    setSavingsInput('')
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-brown text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold text-brown">Xarunta Lacagta 💰</h1>

      <div className="flex gap-1 bg-amber-50 rounded-xl p-1">
        {TABS.map((label, index) => (
          <button
            key={label}
            onClick={() => setTab(index)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === index ? 'bg-white text-terracotta shadow-sm' : 'text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                type === 'income' ? 'border-teal bg-teal bg-opacity-10 text-teal' : 'border-amber-200 text-muted'
              }`}
            >
              ↑ Dakhli
            </button>
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                type === 'expense' ? 'border-red-400 bg-red-50 text-red-600' : 'border-amber-200 text-muted'
              }`}
            >
              ↓ Kharashaad
            </button>
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Xaddiga (dollar)</label>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="input-field text-xl font-bold"
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Sharaxaada</label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Maxay ahayd?"
              className="input-field"
            />
          </div>

          <button onClick={() => void handleSave()} disabled={!amount} className="btn-primary w-full py-3">
            Kaydi
          </button>

          <div>
            <h2 className="font-heading font-semibold text-brown mb-3">Dhaqdhaqaaqyada Dambe</h2>
            {!hasAnyData ? (
              <div className="card text-center py-8">
                <p className="text-3xl mb-3">💸</p>
                <p className="text-muted text-sm font-medium">Wali waxba ma diiwaan gelinin</p>
                <p className="text-muted text-xs mt-1">Bilow hadda — geli dakhligaaga ama kharashkaaga</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => {
                  if (editingTx === transaction.id) {
                    return (
                      <div key={transaction.id} className="card space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditTxForm({ ...editTxForm, type: 'income' })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                              editTxForm.type === 'income'
                                ? 'border-teal bg-teal bg-opacity-10 text-teal'
                                : 'border-amber-200 text-muted'
                            }`}
                          >
                            ↑ Dakhli
                          </button>
                          <button
                            onClick={() => setEditTxForm({ ...editTxForm, type: 'expense' })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                              editTxForm.type === 'expense'
                                ? 'border-red-400 bg-red-50 text-red-600'
                                : 'border-amber-200 text-muted'
                            }`}
                          >
                            ↓ Kharashaad
                          </button>
                        </div>
                        <input
                          type="number"
                          value={editTxForm.amount}
                          onChange={(event) => setEditTxForm({ ...editTxForm, amount: event.target.value })}
                          placeholder="Xaddiga"
                          className="input-field"
                          autoFocus
                        />
                        <input
                          value={editTxForm.description}
                          onChange={(event) => setEditTxForm({ ...editTxForm, description: event.target.value })}
                          placeholder="Sharaxaada"
                          className="input-field"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingTx(null)} className="btn-secondary flex-1 text-sm">Jooji</button>
                          <button onClick={() => void saveEditTx()} disabled={!editTxForm.amount} className="btn-primary flex-1 text-sm">Kaydi</button>
                        </div>
                      </div>
                    )
                  }

                  if (confirmDeleteTx === transaction.id) {
                    return (
                      <div key={transaction.id} className="card border-red-200">
                        <p className="text-sm text-brown mb-3 font-medium">Ma hubtaa inaad tirtirto?</p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDeleteTx(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                          <button onClick={() => void removeTransaction(transaction.id)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={transaction.id} className="card flex items-center justify-between py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown truncate">{transaction.description}</p>
                        <p className="text-xs text-muted">{new Date(transaction.date).toLocaleDateString('so-SO')}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <span className={`font-bold text-sm ${transaction.type === 'income' ? 'text-teal' : 'text-red-500'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{Number(transaction.amount || 0).toLocaleString()} $
                        </span>
                        <button onClick={() => startEditTx(transaction)} className="text-muted hover:text-brown p-1 transition-colors text-base" title="Wax ka beddel">
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDeleteTx(transaction.id)
                            setEditingTx(null)
                          }}
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

      {tab === 1 && (
        <div className="space-y-4">
          {!hasAnyData ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-muted font-medium text-sm">Warbixin ma jirto weli</p>
              <p className="text-muted text-xs mt-1">
                Marka aad dakhli ama kharashaad gelisid, warbixintu halkan ka soo muuqan doontaa.
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
                  {dayTotals.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100px' }}>
                        {day.income > 0 && (
                          <div className="w-full bg-teal rounded-t-sm" style={{ height: `${(day.income / maxDay) * 100}px` }} />
                        )}
                        {day.expense > 0 && (
                          <div className="w-full bg-red-300 rounded-t-sm" style={{ height: `${(day.expense / maxDay) * 100}px` }} />
                        )}
                      </div>
                      <span className="text-xs text-muted">{day.label}</span>
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
                <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${savingsProgress}%` }} />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="font-bold text-teal">{Number(savingsGoal.current || 0).toLocaleString()} $</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted">/ {Number(savingsGoal.target || 0).toLocaleString()} $</span>
                  <button
                    onClick={() => {
                      setEditingGoalTarget(true)
                      setEditGoalInput(String(savingsGoal.target))
                    }}
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
                    onChange={(event) => setEditGoalInput(event.target.value)}
                    placeholder="Bartilmaameedka cusub (sh)"
                    className="input-field flex-1 text-sm"
                    autoFocus
                  />
                  <button onClick={() => void saveGoalTarget()} disabled={!editGoalInput} className="btn-primary text-sm flex-shrink-0">Kaydi</button>
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
                onChange={(event) => setGoalInput(event.target.value)}
                placeholder="Xaddiga bartilmaameedka (sh)"
                className="input-field flex-1"
              />
              <button onClick={() => void handleSetGoal()} disabled={!goalInput} className="btn-primary flex-shrink-0">
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
                  value={savingsInput}
                  onChange={(event) => setSavingsInput(event.target.value)}
                  placeholder="Xaddiga"
                  className="input-field flex-1"
                />
                <button onClick={() => void handleSavingsAdd()} className="btn-primary flex-shrink-0">
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
