import React, { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

const TABS = ['Kaydka', 'Iibinta']

export default function StockSales() {
  const {
    stockItems,
    sales,
    addStockItem,
    updateStockItem,
    adjustStockItemQuantity,
    deleteStockItem,
    addSale,
    deleteSale,
  } = useApp()

  const [tab, setTab] = useState(0)
  const [sName, setSName] = useState('')
  const [sQty, setSQty] = useState('')
  const [sLevel, setSLevel] = useState('')
  const [sUnit, setSUnit] = useState('kg')
  const [editingItem, setEditingItem] = useState(null)
  const [editItemForm, setEditItemForm] = useState({ name: '', quantity: '', reorderLevel: '', unit: 'kg' })
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)
  const [salItem, setSalItem] = useState('')
  const [salQty, setSalQty] = useState('')
  const [salAmt, setSalAmt] = useState('')
  const [confirmDeleteSale, setConfirmDeleteSale] = useState(null)
  const [toast, setToast] = useState('')

  const toastTimer = useRef(null)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySales = useMemo(
    () => sales.filter((sale) => new Date(sale.date) >= today),
    [sales],
  )

  const todayTotal = todaySales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0)

  const showToast = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const handleAddStock = async () => {
    if (!sName || !sQty || !sLevel) return

    await addStockItem({
      name: sName,
      quantity: Number(sQty),
      reorderLevel: Number(sLevel),
      unit: sUnit,
    })

    setSName('')
    setSQty('')
    setSLevel('')
    setSUnit('kg')
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

  const handleSaveEditItem = async () => {
    if (!editItemForm.name || !editItemForm.quantity || !editItemForm.reorderLevel) return

    await updateStockItem(editingItem, {
      name: editItemForm.name,
      quantity: Number(editItemForm.quantity),
      reorderLevel: Number(editItemForm.reorderLevel),
      unit: editItemForm.unit,
    })

    setEditingItem(null)
    showToast('Waa la cusbooneysiiyay')
  }

  const handleDeleteItem = async (itemId) => {
    await deleteStockItem(itemId)
    setConfirmDeleteItem(null)
    showToast('Waa la tirtiray')
  }

  const handleAddSale = async () => {
    if (!salItem || !salQty || !salAmt) return

    await addSale({
      stockItemId: salItem,
      quantity: Number(salQty),
      amount: Number(salAmt),
    })

    setSalItem('')
    setSalQty('')
    setSalAmt('')
  }

  const handleDeleteSale = async (sale) => {
    await deleteSale(sale)
    setConfirmDeleteSale(null)
    showToast('Waa la tirtiray')
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-brown text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold text-brown">Kaydka & Iibinta 📦</h1>

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
          {stockItems.length > 0 && stockItems.filter((item) => item.quantity <= item.reorderLevel).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ {stockItems.filter((item) => item.quantity <= item.reorderLevel).length} alaab ayaa yar — dib u iibso!
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
              {stockItems.map((item) => {
                const low = item.quantity <= item.reorderLevel

                if (confirmDeleteItem === item.id) {
                  return (
                    <div key={item.id} className="card border-red-200">
                      <p className="text-sm text-brown mb-3 font-medium">Ma hubtaa inaad tirtirto?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDeleteItem(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                        <button onClick={() => void handleDeleteItem(item.id)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                      </div>
                    </div>
                  )
                }

                if (editingItem === item.id) {
                  return (
                    <div key={item.id} className="card space-y-3">
                      <input
                        value={editItemForm.name}
                        onChange={(event) => setEditItemForm({ ...editItemForm, name: event.target.value })}
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
                            onChange={(event) => setEditItemForm({ ...editItemForm, quantity: event.target.value })}
                            placeholder="0"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1 block">Hoos hadduu gaaro</label>
                          <input
                            type="number"
                            value={editItemForm.reorderLevel}
                            onChange={(event) => setEditItemForm({ ...editItemForm, reorderLevel: event.target.value })}
                            placeholder="0"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1 block">Cabbirka</label>
                          <select value={editItemForm.unit} onChange={(event) => setEditItemForm({ ...editItemForm, unit: event.target.value })} className="input-field">
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
                        <button onClick={() => void handleSaveEditItem()} disabled={!editItemForm.name || !editItemForm.quantity || !editItemForm.reorderLevel} className="btn-primary flex-1 text-sm">Kaydi</button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={item.id} className="card">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brown text-sm">{item.name}</p>
                        <p className="text-xs text-muted">{item.reorderLevel} {item.unit} hadduu galo ogeysiis</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => void adjustStockItemQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-amber-100 text-brown font-bold text-sm flex items-center justify-center hover:bg-amber-200 transition-colors">−</button>
                        <span className={`text-sm font-bold w-8 text-center ${low ? 'text-red-500' : 'text-teal'}`}>{item.quantity}</span>
                        <button onClick={() => void adjustStockItemQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-amber-100 text-brown font-bold text-sm flex items-center justify-center hover:bg-amber-200 transition-colors">+</button>
                        <span className="text-xs text-muted ml-0.5">{item.unit}</span>
                        {low && <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full font-medium">Yar</span>}
                        <button onClick={() => startEditItem(item)} className="text-muted hover:text-brown p-1 transition-colors text-base">✏️</button>
                        <button
                          onClick={() => {
                            setConfirmDeleteItem(item.id)
                            setEditingItem(null)
                          }}
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

          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-3">Alaab cusub ku dar</h2>
            <div className="space-y-3">
              <input value={sName} onChange={(event) => setSName(event.target.value)} placeholder="Magaca alaabta" className="input-field" />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted mb-1 block">Xaddiga</label>
                  <input type="number" value={sQty} onChange={(event) => setSQty(event.target.value)} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Hoos hadduu gaaro</label>
                  <input type="number" value={sLevel} onChange={(event) => setSLevel(event.target.value)} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Cabbirka</label>
                  <select value={sUnit} onChange={(event) => setSUnit(event.target.value)} className="input-field">
                    <option>kg</option>
                    <option>litre</option>
                    <option>xabo</option>
                    <option>bac</option>
                    <option>kaar</option>
                  </select>
                </div>
              </div>
              <button onClick={() => void handleAddStock()} disabled={!sName || !sQty || !sLevel} className="btn-primary w-full">
                Ku dar Kaydka
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-4">
          <div className="card bg-teal bg-opacity-5 border-teal border-opacity-20">
            <p className="text-muted text-xs mb-1">Maanta oo dhan iibiye</p>
            <p className="font-heading text-2xl font-bold text-teal">{todayTotal > 0 ? `${todayTotal.toLocaleString()} sh` : '0 sh'}</p>
            <p className="text-xs text-muted mt-1">{todaySales.length} iib maanta</p>
          </div>

          <div className="card">
            <h2 className="font-heading font-semibold text-brown mb-3">Iib Diiwaangeli</h2>
            {stockItems.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted text-sm">Marka hore alaab ku dar Kaydka, kadibna iib diiwaangeli kartaa.</p>
                <button onClick={() => setTab(0)} className="btn-primary text-sm mt-3 px-4 py-2">Kaydka u tag</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">Alaabta</label>
                  <select value={salItem} onChange={(event) => setSalItem(event.target.value)} className="input-field">
                    <option value="">Dooro alaabta...</option>
                    {stockItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Xaddiga la iibiyay</label>
                    <input type="number" value={salQty} onChange={(event) => setSalQty(event.target.value)} placeholder="0" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Lacagta (sh)</label>
                    <input type="number" value={salAmt} onChange={(event) => setSalAmt(event.target.value)} placeholder="0" className="input-field" />
                  </div>
                </div>
                <button onClick={() => void handleAddSale()} disabled={!salItem || !salQty || !salAmt} className="btn-primary w-full">
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
                <p className="text-muted text-xs mt-1">Marka aad iib gelisid, halkan ka soo muuqan doontaa</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySales.map((sale) => {
                  if (confirmDeleteSale === sale.id) {
                    return (
                      <div key={sale.id} className="card border-red-200">
                        <p className="text-sm text-brown mb-1 font-medium">Ma hubtaa inaad tirtirto?</p>
                        <p className="text-xs text-muted mb-3">{sale.quantity} {sale.item} ayaa dib ugu laaban doona kaydka.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDeleteSale(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                          <button onClick={() => void handleDeleteSale(sale)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={sale.id} className="card flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-brown">{sale.item}</p>
                        <p className="text-xs text-muted">Xaddiga: {sale.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal text-sm">+{Number(sale.amount || 0).toLocaleString()} sh</span>
                        <button onClick={() => setConfirmDeleteSale(sale.id)} className="text-muted hover:text-red-500 p-1 transition-colors text-base">🗑️</button>
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
