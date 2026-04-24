import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const CHALLENGES = [
  'Qiimaha alaabta',
  'Macaamiisha helitaan',
  'Lacagta maaraynta',
  'Aood-gelin qoyska',
]

export default function Settings() {
  const { userProfile, setUserProfile } = useApp()

  const [form, setForm] = useState({
    name: userProfile?.name || '',
    businessName: userProfile?.businessName || '',
    whatYouSell: userProfile?.whatYouSell || '',
    weeklyIncome: String(userProfile?.weeklyIncome || ''),
    biggestChallenge: userProfile?.biggestChallenge || '',
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!form.name.trim() || !form.businessName.trim()) return
    setUserProfile({
      ...userProfile,
      name: form.name.trim(),
      businessName: form.businessName.trim(),
      whatYouSell: form.whatYouSell.trim(),
      weeklyIncome: Number(form.weeklyIncome) || 0,
      biggestChallenge: form.biggestChallenge,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold text-brown">Xogta ⚙️</h1>

      {saved && (
        <div className="bg-teal bg-opacity-10 border border-teal border-opacity-30 rounded-xl p-3">
          <p className="text-teal font-medium text-sm">✓ Waa la cusbooneysiiyay — dhammaan bogaggu waxay isticmaalaan xogtan cusub.</p>
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-heading font-semibold text-brown">Macluumaadkaaga Shakhsiga</h2>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Magacaaga</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Magacaaga"
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Magaca Ganacsiga</label>
          <input
            value={form.businessName}
            onChange={e => setForm({ ...form, businessName: e.target.value })}
            placeholder="Magaca ganacsigaaga"
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Maxaad iibisaa?</label>
          <input
            value={form.whatYouSell}
            onChange={e => setForm({ ...form, whatYouSell: e.target.value })}
            placeholder="Alaabta ama adeegga aad iibiso"
            className="input-field"
          />
          <p className="text-xs text-muted mt-1">Tani waxay saameyn doontaa saadaalinta xilliga iyo AI-ga jawaabihiisa.</p>
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Dakhliga Toddobaadlaha (sh)</label>
          <input
            type="number"
            value={form.weeklyIncome}
            onChange={e => setForm({ ...form, weeklyIncome: e.target.value })}
            placeholder="0"
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Caqabadda ugu Weyn</label>
          <select
            value={form.biggestChallenge}
            onChange={e => setForm({ ...form, biggestChallenge: e.target.value })}
            className="input-field"
          >
            <option value="">Dooro...</option>
            {CHALLENGES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1">Tani waxay doortaa macallinka AI iyo dhiirigelinta ku habboon.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={!form.name.trim() || !form.businessName.trim()}
          className="btn-primary w-full py-3"
        >
          Kaydi Xogta
        </button>
      </div>

      <div className="card">
        <h2 className="font-heading font-semibold text-brown mb-2">Macluumaad</h2>
        <p className="text-muted text-xs leading-relaxed">
          Wax kasta oo aad halkan ka beddesho ayaa isla markiiba saamayn doona dhammaan bogagga: AI Coach, saadaalinta, iyo macallinka. Xogta waxaa lagu kaydiyaa taleefantaada oo kaliya — ma aadayso server kasta.
        </p>
      </div>
    </div>
  )
}
