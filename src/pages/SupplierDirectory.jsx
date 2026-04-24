import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function SupplierDirectory() {
  const { suppliers, setSuppliers } = useApp()
  const navigate = useNavigate()

  // Add form
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [items, setItems] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState('')

  // Price modal
  const [priceModal, setPriceModal] = useState(null)
  const [newPrice, setNewPrice] = useState('')

  // Edit supplier
  const [editingSup, setEditingSup] = useState(null)
  const [editSupForm, setEditSupForm] = useState({ name: '', items: '', phone: '' })
  const [confirmDeleteSup, setConfirmDeleteSup] = useState(null)

  // Toast
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const addSupplier = () => {
    if (!name || !items || !phone || !price) return
    const s = {
      id: Date.now().toString(),
      name,
      items,
      phone,
      priceHistory: [{ price: Number(price), date: new Date().toISOString() }],
    }
    setSuppliers(prev => [...prev, s])
    setName(''); setItems(''); setPhone(''); setPrice('')
    setShowForm(false)
  }

  const addPrice = () => {
    if (!newPrice || !priceModal) return
    setSuppliers(prev =>
      prev.map(s =>
        s.id === priceModal
          ? { ...s, priceHistory: [...s.priceHistory, { price: Number(newPrice), date: new Date().toISOString() }] }
          : s
      )
    )
    setNewPrice('')
    setPriceModal(null)
  }

  const startEditSup = (sup) => {
    setEditingSup(sup.id)
    setEditSupForm({ name: sup.name, items: sup.items, phone: sup.phone })
    setConfirmDeleteSup(null)
    setPriceModal(null)
  }

  const saveEditSup = () => {
    if (!editSupForm.name || !editSupForm.items || !editSupForm.phone) return
    setSuppliers(prev => prev.map(s =>
      s.id === editingSup ? { ...s, ...editSupForm } : s
    ))
    setEditingSup(null)
    showToast('Waa la cusbooneysiiyay')
  }

  const deleteSup = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id))
    setConfirmDeleteSup(null)
    showToast('Waa la tirtirray')
  }

  const handleAskAI = () => {
    const raisedSuppliers = suppliers.filter(s => {
      if (s.priceHistory.length < 2) return false
      const sorted = [...s.priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
      return sorted[sorted.length - 1].price > sorted[sorted.length - 2].price
    })
    const names = raisedSuppliers.map(s => s.name).join(', ')
    const prompt = `Alaab-siiyayaashaydii ${names || 'xoogaa'} ayaa qiimaha kor u qaaday. Maxaan samayn karaa si aan alaab jaban uga helo?`
    navigate('/coach', { state: { prompt } })
  }

  const getPriceTrend = (sup) => {
    const h = [...sup.priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date))
    if (h.length < 2) return null
    const latest = h[h.length - 1].price
    const prev = h[h.length - 2].price
    if (latest === prev) return null
    const pct = Math.abs(((latest - prev) / prev) * 100).toFixed(1)
    return { up: latest > prev, pct, latest, prev }
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-brown text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-brown">Alaab-siiyayaasha 🤝</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-3 py-2">
          + Ku dar
        </button>
      </div>

      {/* Add supplier form */}
      {showForm && (
        <div className="card space-y-3">
          <h2 className="font-heading font-semibold text-brown">Alaab-siiye cusub</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Magaca" className="input-field" />
          <input value={items} onChange={e => setItems(e.target.value)} placeholder="Maxuu siiyo? (Bariis, Caano...)" className="input-field" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefoonka (+252...)" className="input-field" />
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Qiimaha hadda (sh)" className="input-field" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Jooji</button>
            <button onClick={addSupplier} disabled={!name || !items || !phone || !price} className="btn-primary flex-1">Kaydi</button>
          </div>
        </div>
      )}

      {/* Supplier list or empty state */}
      {suppliers.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-3xl mb-3">🤝</p>
          <p className="text-muted font-medium text-sm">Wali alaab-siiye ma jiro</p>
          <p className="text-muted text-xs mt-1 mb-4">
            Ku dar alaab-siiyayaashada aad ka iibsatid si aad qiimaha u raad-raacdo
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-5 py-2">
            + Ku dar alaab-siiyaha koowaad
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {suppliers.map(sup => {
            const trend = getPriceTrend(sup)
            const latestPrice = sup.priceHistory.length > 0
              ? [...sup.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date))[0].price
              : null

            if (confirmDeleteSup === sup.id) {
              return (
                <div key={sup.id} className="card border-red-200">
                  <p className="text-sm text-brown mb-1 font-medium">Ma hubtaa inaad tirtirto?</p>
                  <p className="text-xs text-muted mb-3">{sup.name} — dhammaan macluumaadka ayaa la tirtiri doonaa.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDeleteSup(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                    <button onClick={() => deleteSup(sup.id)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                  </div>
                </div>
              )
            }

            if (editingSup === sup.id) {
              return (
                <div key={sup.id} className="card space-y-3">
                  <h2 className="font-heading font-semibold text-brown">Wax ka beddel</h2>
                  <input
                    value={editSupForm.name}
                    onChange={e => setEditSupForm({ ...editSupForm, name: e.target.value })}
                    placeholder="Magaca"
                    className="input-field"
                    autoFocus
                  />
                  <input
                    value={editSupForm.items}
                    onChange={e => setEditSupForm({ ...editSupForm, items: e.target.value })}
                    placeholder="Maxuu siiyo?"
                    className="input-field"
                  />
                  <input
                    value={editSupForm.phone}
                    onChange={e => setEditSupForm({ ...editSupForm, phone: e.target.value })}
                    placeholder="Telefoonka"
                    className="input-field"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingSup(null)} className="btn-secondary flex-1">Jooji</button>
                    <button
                      onClick={saveEditSup}
                      disabled={!editSupForm.name || !editSupForm.items || !editSupForm.phone}
                      className="btn-primary flex-1"
                    >
                      Kaydi
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={sup.id} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-semibold text-brown">{sup.name}</h2>
                    <p className="text-muted text-xs mt-0.5">{sup.items}</p>
                    <a href={`tel:${sup.phone}`} className="text-terracotta text-xs mt-1 block">
                      📞 {sup.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0 ml-2">
                    {latestPrice && (
                      <div className="text-right">
                        <p className="font-bold text-brown text-sm">{latestPrice.toLocaleString()} sh</p>
                        {trend && (
                          <div className={`flex items-center gap-1 justify-end mt-0.5 ${trend.up ? 'text-red-500' : 'text-teal'}`}>
                            <span className="text-xs">{trend.up ? '↑' : '↓'} {trend.pct}%</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => startEditSup(sup)}
                        className="text-muted hover:text-brown p-1 transition-colors text-base"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => { setConfirmDeleteSup(sup.id); setEditingSup(null); setPriceModal(null) }}
                        className="text-muted hover:text-red-500 p-1 transition-colors text-base"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {sup.priceHistory.length > 0 && (
                  <div className="border-t border-amber-100 pt-3">
                    <p className="text-xs text-muted mb-2">Taariikhda qiimaha:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {[...sup.priceHistory]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((h, i) => (
                          <div key={i} className="flex-shrink-0 text-center">
                            <p className="text-xs font-medium text-brown">{h.price.toLocaleString()}</p>
                            <p className="text-xs text-muted">{new Date(h.date).toLocaleDateString('so-SO')}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setPriceModal(sup.id); setNewPrice('') }}
                  className="text-xs text-terracotta underline"
                >
                  + Qiime cusub ku dar
                </button>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={handleAskAI}
        className="w-full card border-terracotta border-opacity-30 text-center py-4 hover:border-terracotta hover:bg-terracotta hover:bg-opacity-5 transition-all"
      >
        <p className="text-terracotta font-medium text-sm">🤖 AI-ga weydii bedel jaban</p>
        <p className="text-muted text-xs mt-1">Kobcin wuxuu kuu raadin doonaa alaab-siiye jaban</p>
      </button>

      {/* Add price modal */}
      {priceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm space-y-3">
            <h2 className="font-heading font-semibold text-brown">Qiime cusub ku dar</h2>
            <input
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              placeholder="Qiimaha cusub (sh)"
              className="input-field"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setPriceModal(null)} className="btn-secondary flex-1">Jooji</button>
              <button onClick={addPrice} disabled={!newPrice} className="btn-primary flex-1">Kaydi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
