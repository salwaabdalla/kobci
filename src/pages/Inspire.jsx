import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'

const ROLE_MODELS = [
  {
    name: 'Ifrah Ahmed',
    built: 'Ololaha caafimaadka haweenka iyo xuquuqda aadanaha Soomaalida adduunka oo dhan',
    quote: '"Hal guri ma dhisto, laakiin hal qalbi ayaa badbaadinaysa adduunka."',
    field: 'Xirfad bulsheed',
    country: 'Soomaaliya / Awstraaliya',
  },
  {
    name: 'Iman Abdulmajid',
    built: 'Ganacsiga muuqaalka caalamiga ee ugu wanaagsan ee Aafrikada',
    quote: '"Xilliga aad ka tagayso oo adiga u shaqeynaysid, taasi waa guushii ugu weyn."',
    field: 'Ganacsiga muuqaalka',
    country: 'Soomaaliya / Maraykanka',
  },
  {
    name: 'Hawa Abdi',
    built: 'Isbitaalka iyo xarunta qaxootiga ee 90,000+ qof ku nool Soomaaliya',
    quote: '"Waxaan aaminaa in gabadha waxbarasho helaysa ay badbaadin karto qoyska oo dhan."',
    field: 'Caafimaad & Bulsho',
    country: 'Soomaaliya',
  },
  {
    name: 'Ubah Hassan',
    built: 'Xididada muuqaalka caalamiga ee ugu xooggan ee haweeney Soomaali leh',
    quote: '"Isaga jeclow, shaqo ka bilow oo bandhig: adduunka ayaa xigta."',
    field: 'Ganacsiga muuqaalka',
    country: 'Soomaaliya / Maraykanka',
  },
]

const AFFIRMATIONS = {
  'Qiimaha alaabta': 'Qiimahaygu wuxuu muujinayaa qiimaha shaqadayda. Xaqa ayaan u leeyahay faa\'iido hayn.',
  'Macaamiisha helitaan': 'Macaamiishaydu waxay raadineysaan. Halkaan ayaan joogaa oo diyaar ah.',
  'Lacagta maaraynta': 'Maalin kasta waxaan baraa lacagta. Kobcinkeygu waa xafiis joogto ah.',
  'Aood-gelin qoyska': 'Ganacsigaygu waa awood qoyska. Maalin kasta waxaan dhisaa mustaqbal wanaagsan.',
}

const DEFAULT_AFFIRMATION = 'Ganacsato baan ahay. Maalin kasta waxaan kobciyaa. Kobcin wuxuu ii taagan yahay.'

const AVATAR_COLORS = [
  'from-terracotta to-brown',
  'from-teal to-brown',
  'from-gold to-terracotta',
  'from-brown to-teal',
]

export default function Inspire() {
  const { userProfile, winJournal, addWin, deleteWin } = useApp()
  const [winText, setWinText] = useState('')
  const [confirmDeleteWin, setConfirmDeleteWin] = useState(null)

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const affirmation = AFFIRMATIONS[userProfile?.biggestChallenge] || DEFAULT_AFFIRMATION

  const handleAddWin = () => {
    if (!winText.trim()) return
    addWin(winText.trim())
    setWinText('')
  }

  const handleDeleteWin = (id) => {
    deleteWin(id)
    setConfirmDeleteWin(null)
    showToast('Waa la tirtirray')
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('so-SO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 md:top-4 left-1/2 -translate-x-1/2 z-50 bg-brown text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold text-brown">Dhiirigelinta ⭐</h1>

      {/* Daily affirmation */}
      <div className="bg-gradient-to-br from-brown to-terracotta rounded-xl p-5 text-center">
        <p className="text-gold text-xs font-medium mb-3 tracking-wider uppercase">Maanta oo Maanta</p>
        <p className="text-white font-heading text-xl leading-relaxed font-semibold">
          "{affirmation}"
        </p>
        {userProfile?.name && (
          <p className="text-amber-200 text-sm mt-3">— {userProfile.name}</p>
        )}
      </div>

      {/* Role models */}
      <div>
        <h2 className="font-heading font-semibold text-brown mb-3">Tusaalayaasha Guusha 🌟</h2>
        <div className="space-y-3">
          {ROLE_MODELS.map((rm, idx) => (
            <div key={rm.name} className="card">
              <div className="flex gap-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[idx]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-heading font-bold text-lg">
                    {rm.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading font-semibold text-brown">{rm.name}</h3>
                      <p className="text-muted text-xs">{rm.field} • {rm.country}</p>
                    </div>
                  </div>
                  <p className="text-muted text-xs mt-1 leading-relaxed">{rm.built}</p>
                </div>
              </div>
              <blockquote className="mt-3 border-l-2 border-terracotta pl-3">
                <p className="text-brown text-sm italic leading-relaxed">{rm.quote}</p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* Win journal */}
      <div>
        <h2 className="font-heading font-semibold text-brown mb-3">Diiwaanka Guusha 🏆</h2>

        <div className="card mb-3">
          <p className="text-muted text-sm mb-3">Maanta maxaad guulaysatay? Yar iyo weynaaba qor.</p>
          <textarea
            value={winText}
            onChange={e => setWinText(e.target.value)}
            placeholder="Tusaale: Macmiil cusub ayaan helay! Qiimahana waxaan hagaajiyay..."
            className="input-field min-h-[80px] resize-none mb-3"
          />
          <button
            onClick={handleAddWin}
            disabled={!winText.trim()}
            className="btn-primary w-full"
          >
            Guushayda Kaydi 🏆
          </button>
        </div>

        {winJournal.length === 0 ? (
          <div className="text-center py-6 text-muted">
            <p className="text-3xl mb-2">🌟</p>
            <p className="text-sm">Wali wax guul ah ma diiwaangelinin. Bilow maanta!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {winJournal.map(win => {
              if (confirmDeleteWin === win.id) {
                return (
                  <div key={win.id} className="card border-red-200">
                    <p className="text-sm text-brown mb-3 font-medium">Ma hubtaa inaad tirtirto?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDeleteWin(null)} className="btn-secondary flex-1 text-sm py-2">Maya</button>
                      <button onClick={() => handleDeleteWin(win.id)} className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium py-2">Haa, tirtir</button>
                    </div>
                  </div>
                )
              }
              return (
                <div key={win.id} className="card flex gap-3">
                  <span className="text-gold text-xl flex-shrink-0">🏆</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-brown text-sm leading-relaxed">{win.text}</p>
                    <p className="text-muted text-xs mt-1">{formatDate(win.date)}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteWin(win.id)}
                    className="text-muted hover:text-red-500 p-1 transition-colors text-base flex-shrink-0"
                  >
                    🗑️
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
