import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CHALLENGE_OPTIONS = [
  'Qiimaha alaabta',
  'Macaamiisha helitaan',
  'Lacagta maaraynta',
  'Awood-gelin qoyska',
]

const steps = [
  { field: 'name', question: 'Magacaaga waa maxay?', placeholder: 'Gali magacaaga...', type: 'text' },
  { field: 'businessName', question: 'Ganacsigaaga magaciisa?', placeholder: 'Gali magaca ganacsiga...', type: 'text' },
  { field: 'whatYouSell', question: 'Maxaad iibisaa?', placeholder: 'Tusaale: cunto, dharka, alaabta guriga...', type: 'text' },
  { field: 'weeklyIncome', question: 'Maalintiiba imisa ayaa kusoo gasho?', placeholder: 'Tusaale: 50000', type: 'number' },
  { field: 'biggestChallenge', question: 'Caqabadda ugu weyn ee aad wajaheyso?', type: 'choice' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateProfile } = useApp()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    businessName: '',
    whatYouSell: '',
    weeklyIncome: '',
    biggestChallenge: '',
  })

  const current = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  const canProceed = () => {
    const value = form[current.field]
    return value && value.toString().trim().length > 0
  }

  const next = async () => {
    if (saving) return

    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    setSaving(true)
    await updateProfile({
      ...form,
      weeklyIncome: Number(form.weeklyIncome),
    })
    setSaving(false)
    navigate('/dashboard')
  }

  const handleInput = (value) => {
    setForm((prev) => ({ ...prev, [current.field]: value }))
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-brown">Kobcin</h1>
        <p className="text-muted text-sm mt-1">Ganacsigaaga kor u qaad</p>
      </div>

      <div className="card w-full max-w-md">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Tallaabada {step + 1} / {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="font-heading text-2xl font-semibold text-brown mb-6">
          {current.question}
        </h2>

        {current.type === 'choice' ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {CHALLENGE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleInput(option)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                  form.biggestChallenge === option
                    ? 'border-terracotta bg-terracotta bg-opacity-10 text-terracotta'
                    : 'border-amber-200 text-muted hover:border-terracotta hover:text-terracotta'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type={current.type}
            value={form[current.field]}
            onChange={(event) => handleInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canProceed()) {
                void next()
              }
            }}
            placeholder={current.placeholder}
            className="input-field mb-6 text-lg"
            autoFocus
          />
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
              Dib u noqo
            </button>
          )}
          <button onClick={() => void next()} disabled={!canProceed() || saving} className="btn-primary flex-1">
            {step === steps.length - 1 ? (saving ? '...' : 'Bilow Kobcin ✓') : 'Xigta →'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === step ? 'w-6 bg-terracotta' : index < step ? 'bg-terracotta opacity-50' : 'bg-amber-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
