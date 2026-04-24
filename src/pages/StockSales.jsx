import React, { useState, useMemo, useRef } from 'react'
import { useApp } from '../context/AppContext'

const TABS = ['Kaydka', 'Iibinta']

export default function StockSales() {
  const { stockItems, setStockItems, sales, setSales } = useApp()
  const [tab, setTab] = useState(0)

  // Stock add form
  const [sName, setSName] = useState('')
  const [sQty, setSQty] = useState('')
  const [sLevel, setSLevel] = useState('')
  const [sUnit, setSUnit] = useState('kg')

  // Stock edit
  const [editingItem, setEditingItem] = useState(null)
  const [editItemForm, setEditItemForm] = useState({ name: '', quantity: '', reorderLevel: '', unit: 'kg' })
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)

  // Sale add form
  const [salItem, setSalItem] = useState('')
  const [salQty, setSalQty] = useState('')
  const [salAmt, setSalAmt] = useState('')

  // Sale delete
  const [confirmDeleteSale, setConfirmDeleteSale] = useState(null)

  // Toast
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySales = useMemo(() =>
    sales.filter(s => new Date(s.date) >= today),
    [sales]
  )

  const todayTotal = todaySales.reduce((s, x) => s + x.amount, 0)

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const addStock = () => {
    if (!sName || !sQty || !sLevel) return
    const item = {
      id: Date.now().toString(),
      name: sName,
      quantity: Number(sQty),
      reorderLevel: Number(sLevel),
      unit: sUnit,
    }
    setStockItems(prev => [...prev, item])
    setSName(''); setSQty(''); setSLevel(''); setSUnit('kg')
  }

  const adjustQty = (id, delta) => {
    setStockItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ))
  }

  const startEditItem = (item) => {
    setEditingItem(item.id)
    setEditItemForm({
      name: item.name,
      quantity: String(item.quantity),
      reorderLevel: String(item.reorderLevel),
      unit: item.unit,
    })
    setConfirmDeleteItem(null)
  }

  const saveEditItem = () => {
    if (!editItemForm.name || !editItemForm.quantity || !editItemForm.reorderLevel) return
    setStockItems(prev => prev.map(item =>
      item.id === editingItem
        ? { ...item, name: editItemForm.name, quantity: Number(editItemForm.quantity), reorderLevel: Number(editItemForm.reorderLevel), unit: editItemForm.unit }
        : item
    ))
    setEditingItem(null)
    showToast('Waa la cusbooneysiiyay')
  }

  const deleteItem = (id) => {
    setStockItems(prev => prev.filter(item => item.id !== id))
    setConfirmDeleteItem(null)
    showToast('Waa la tirtirray')
  }

  const addSale = () => {
    if (!salItem || !salQty || !salAmt) return
    const sale = {
      id: Date.now().toString(),
      item: salItem,
      quantity: Number(salQty),
      amount: Number(salAmt),
      date: new Date().toISOString(),
    }
    setSales(prev => [sale, ...prev])
    setStockItems(prev =>
      prev.map(s =>
        s.name === salItem
          ? { ...s, quantity: Math.max(0, s.quantity - Number(salQty)) }
          : s
      )
    )
    setSalItem(''); setSalQty(''); setSalAmt('')
  }

  const deleteSale = (sale) => {
    setSales(prev => prev.filter(s => s.id !== sale.id))
    setStockItems(prev => prev.map(s =>
      s.name === sale.item ? { ...s, quantity: s.quantity + sale.quantity } : s
    ))
    setConfirmDeleteSale(null)
    showToast('Waa la tirtirray')
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-brown text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold text-brown">Kaydka & Iibinta 📦</h1>

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

      {/* Tab 0: Stock */}
      {tab === 0 && (
        <div className="space-y-4">
          {stockItems.length > 0 && stockItems.filter(s => s.quantity <= s.reorderLevel).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ {stockItems.filter(s => s.quantity <= s.reorderLevel).length} alaab ayaa yar — dib u iibso!
              </p>
            </div>
          )}

          {stockItems.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-muted font-medium text-sm">Wali alaab ma jirto</p>
              <p className="text-muted text-xs mt-1">Ku dar alaabta aad iibiso foomka hoose</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stockItems.map(item => {
                const low = item.quantity <= item.reorderLevel

                if (confirmDeleteItem === item.id) {
                  return (
                    <div key={item.id} className="card border-red-200">
                      <p className="text-sm text-brown mb-3 font-medium">Ma hubtaa inaad tirtirto?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDeleteItem(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                        <button onClick={() => deleteItem(item.id)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                      </div>
                    </div>
                  )
                }

                if (editingItem === item.id) {
                  return (
                    <div key={item.id} className="card space-y-3">
                      <input
                        value={editItemForm.name}
                        onChange={e => setEditItemForm({ ...editItemForm, name: e.target.value })}
                        placeholder="Magaca alaabta"
                        className="input-field"
                        autoFocus
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted mb-1 block">Xaddiga</label>
                          <input
                            type="number"
                            value={editItemForm.quantity}
                            onChange={e => setEditItemForm({ ...editItemForm, quantity: e.target.value })}
                            placeholder="0"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1 block">Hoos hadduu gaaro</label>
                          <input
                            type="number"
                            value={editItemForm.reorderLevel}
                            onChange={e => setEditItemForm({ ...editItemForm, reorderLevel: e.target.value })}
                            placeholder="0"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1 block">Cabbirka</label>
                          <select value={editItemForm.unit} onChange={e => setEditItemForm({ ...editItemForm, unit: e.target.value })} className="input-field">
                            <option>kg</option>
                            <option>litre</option>
                            <option>xabo</option>
                            <option>bac</option>
                            <option>kaar</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingItem(null)} className="btn-secondary flex-1 text-sm">Jooji</button>
                        <button onClick={saveEditItem} disabled={!editItemForm.name || !editItemForm.quantity || !editItemForm.reorderLevel} className="btn-primary flex-1 text-sm">Kaydi</button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={item.id} className="card">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brown text-sm">{item.name}</p>
                        <p className="text-xs text-muted">
                          {item.reorderLevel} {item.unit} hadduu galo ogeysiis
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => adjustQty(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-amber-100 text-brown font-bold text-sm flex items-center justify-center hover:bg-amber-200 transition-colors"
                        >
                          −
                        </button>
                        <span className={`text-sm font-bold w-8 text-center ${low ? 'text-red-500' : 'text-teal'}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => adjustQty(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-amber-100 text-brown font-bold text-sm flex items-center justify-center hover:bg-amber-200 transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-muted ml-0.5">{item.unit}</span>
                        {low && (
                          <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            Yar
                          </span>
                        )}
                        <button
                          onClick={() => startEditItem(item)}
                          className="text-muted hover:text-brown p-1 transition-colors text-base"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteItem(item.id); setEditingItem(null) }}
                          className="text-muted hover:text-red-500 p-1 transition-colors text-base"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add stock form */}
          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-3">Alaab cusub ku dar</h2>
            <div className="space-y-3">
              <input
                value={sName}
                onChange={e => setSName(e.target.value)}
                placeholder="Magaca alaabta"
                className="input-field"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted mb-1 block">Xaddiga</label>
                  <input
                    type="number"
                    value={sQty}
                    onChange={e => setSQty(e.target.value)}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Hoos hadduu gaaro</label>
                  <input
                    type="number"
                    value={sLevel}
                    onChange={e => setSLevel(e.target.value)}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Cabbirka</label>
                  <select value={sUnit} onChange={e => setSUnit(e.target.value)} className="input-field">
                    <option>kg</option>
                    <option>litre</option>
                    <option>xabo</option>
                    <option>bac</option>
                    <option>kaar</option>
                  </select>
                </div>
              </div>
              <button onClick={addStock} disabled={!sName || !sQty || !sLevel} className="btn-primary w-full">
                Ku dar Kaydka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Sales */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="card bg-teal bg-opacity-5 border-teal border-opacity-20">
            <p className="text-muted text-xs mb-1">Maanta oo dhan iibiye</p>
            <p className="font-heading text-2xl font-bold text-teal">
              {todayTotal > 0 ? `${todayTotal.toLocaleString()} sh` : '0 sh'}
            </p>
            <p className="text-xs text-muted mt-1">{todaySales.length} iib maanta</p>
          </div>

          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-3">Iib Diiwaangeli</h2>
            {stockItems.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted text-sm">
                  Marka hore alaab ku dar Kaydka, kadibna iib diiwaangeli kartaa.
                </p>
                <button
                  onClick={() => setTab(0)}
                  className="btn-primary text-sm mt-3 px-4 py-2"
                >
                  Kaydka u tag
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">Alaabta</label>
                  <select value={salItem} onChange={e => setSalItem(e.target.value)} className="input-field">
                    <option value="">Dooro alaabta...</option>
                    {stockItems.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Xaddiga la iibiyay</label>
                    <input
                      type="number"
                      value={salQty}
                      onChange={e => setSalQty(e.target.value)}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Lacagta (sh)</label>
                    <input
                      type="number"
                      value={salAmt}
                      onChange={e => setSalAmt(e.target.value)}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                </div>
                <button
                  onClick={addSale}
                  disabled={!salItem || !salQty || !salAmt}
                  className="btn-primary w-full"
                >
                  Kaydi Iibka
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-heading font-semibold text-brown mb-3">Maanta Iibiye</h2>
            {todaySales.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-muted text-sm">Iib ma jiro maanta</p>
                <p className="text-muted text-xs mt-1">Marka aad iib galisid, halkan ka soo muuqan doontaa</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySales.map(s => {
                  if (confirmDeleteSale === s.id) {
                    return (
                      <div key={s.id} className="card border-red-200">
                        <p className="text-sm text-brown mb-1 font-medium">Ma hubtaa inaad tirtirto?</p>
                        <p className="text-xs text-muted mb-3">
                          {s.quantity} {s.item} ayaa dib ugu laaban doona kaydka.
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDeleteSale(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                          <button onClick={() => deleteSale(s)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={s.id} className="card flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-brown">{s.item}</p>
                        <p className="text-xs text-muted">Xaddiga: {s.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal text-sm">
                          +{s.amount.toLocaleString()} sh
                        </span>
                        <button
                          onClick={() => setConfirmDeleteSale(s.id)}
                          className="text-muted hover:text-red-500 p-1 transition-colors text-base"
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
    </div>
  )
}
