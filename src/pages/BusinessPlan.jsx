import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { askCoach } from '../services/aiService'

const QUESTIONS = [
  { field: 'businessName', label: 'Magaca Ganacsiga', placeholder: 'Magaca ganacsigaaga' },
  { field: 'whatYouSell', label: 'Maxaad iibisaa?', placeholder: 'Sifee alaabta ama adeegga' },
  { field: 'targetCustomer', label: 'Macaamiishaada Bartilmaameedka', placeholder: 'Cidda aad u iibisid?' },
  { field: 'competitiveAdvantage', label: 'Maxaad ka duwan tahay tartanka?', placeholder: 'Qiimaha jaban, tayo sarreeya, deegaan...' },
  { field: 'monthlyGoal', label: 'Bartilmaameedka Dakhliga Bishii', placeholder: 'Wixii shilin ahaan' },
  { field: 'biggestChallenge', label: 'Caqabadda ugu weyn', placeholder: 'Maxaad u baahan tahay caawimaad?' },
]

export default function BusinessPlan() {
  const { userProfile, businessPlan, saveBusinessPlan, deleteBusinessPlan } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    businessName: userProfile?.businessName || '',
    whatYouSell: userProfile?.whatYouSell || '',
    targetCustomer: '',
    competitiveAdvantage: '',
    monthlyGoal: userProfile?.weeklyIncome ? String(userProfile.weeklyIncome * 4) : '',
    biggestChallenge: userProfile?.biggestChallenge || '',
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      businessName: userProfile?.businessName || '',
      whatYouSell: userProfile?.whatYouSell || '',
      monthlyGoal: userProfile?.weeklyIncome ? String(userProfile.weeklyIncome * 4) : prev.monthlyGoal,
      biggestChallenge: userProfile?.biggestChallenge || '',
    }))
  }, [userProfile])

  const planText = businessPlan?.planText || ''

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    const prompt = `Fadlan ii qor qorshe ganacsi oo buuxa oo Soomaali ah. Xogta ganacsiga:
Magaca Ganacsiga: ${form.businessName}
Waxa la Iibinayo: ${form.whatYouSell}
Macaamiisha Bartilmaameedka: ${form.targetCustomer}
Kala duwanaanshaha Tartanka: ${form.competitiveAdvantage}
Bartilmaameedka Dakhliga Bishii: ${form.monthlyGoal} shilin
Caqabadda ugu Weyn: ${form.biggestChallenge}

Qorshuhu ha ka koobnaado: 1) Soo-koobid, 2) Cilmi baarista suuqa, 3) Alaabta/Adeegga, 4) Qorshaha Suuqgeynta, 5) Qorshaha Maaliyadda, 6) Hadafyada 6-bilood. Soomaali buuxda ah si qumman u qor.`

    try {
      const result = await askCoach(prompt, userProfile)
      await saveBusinessPlan(result.content)
    } catch {
      setError('Waxaa jiray khalad. Isku day mar kale.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const content = `QORSHAHA GANACSIGA — ${form.businessName}\n${new Date().toLocaleDateString('so-SO')}\n\n${planText}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Qorshaha-${form.businessName || 'Ganacsiga'}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = async () => {
    await deleteBusinessPlan()
    setForm({
      businessName: userProfile?.businessName || '',
      whatYouSell: userProfile?.whatYouSell || '',
      targetCustomer: '',
      competitiveAdvantage: '',
      monthlyGoal: userProfile?.weeklyIncome ? String(userProfile.weeklyIncome * 4) : '',
      biggestChallenge: userProfile?.biggestChallenge || '',
    })
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold text-brown">Qorshaha Ganacsiga 📋</h1>

      {!planText ? (
        <div className="space-y-4">
          <p className="text-muted text-sm">Buuxi su'aalaha hoose, Kobcin wuxuu kuu qori doonaa qorshe ganacsi oo buuxa.</p>

          <div className="space-y-3">
            {QUESTIONS.map((question) => (
              <div key={question.field}>
                <label className="text-sm font-medium text-brown mb-1 block">{question.label}</label>
                <input
                  value={form[question.field]}
                  onChange={(event) => setForm({ ...form, [question.field]: event.target.value })}
                  placeholder={question.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button onClick={() => void handleGenerate()} disabled={loading || !form.businessName || !form.whatYouSell} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Qorshaha la diyaarinayaa...
              </span>
            ) : (
              '🤖 Qorshaha Samee'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-brown text-lg">Qorshaha Ganacsiga — {form.businessName}</h2>
              <button onClick={() => void handleReset()} className="btn-secondary text-sm px-3 py-1.5">🔄 Dib u samee</button>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-brown text-sm leading-relaxed font-body">
                {planText}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleDownload} className="btn-primary flex-1 py-3">↓ Soo dejiso</button>
            <button
              onClick={() => {
                if (navigator.share) {
                  void navigator.share({ title: `Qorshaha ${form.businessName}`, text: planText })
                }
              }}
              className="btn-secondary flex-1 py-3"
            >
              Wadaag
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
