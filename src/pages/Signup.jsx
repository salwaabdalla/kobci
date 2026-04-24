import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Signup() {
  const { signUp } = useApp()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await signUp({ fullName, email, password })

    if (result.success) {
      setSuccess('Akoon waa la sameeyay. Soo dhawaaw.')
      setFullName('')
      setEmail('')
      setPassword('')
    } else {
      setError(result.error?.message || 'Diiwaangelinta waxaa jirtay khalad. Isku day mar kale.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-brown">Kobcin</h1>
        <p className="text-muted text-sm mt-1">Ganacsigaaga kor u qaad</p>
      </div>

      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-5">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-brown">Akoon Samee</h2>
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Magacaaga oo buuxa</label>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="input-field"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">Iimaylkaaga</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-field"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-brown mb-1 block">passwordkaaga</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-field"
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted mt-1">Ugu yaraan 6 xaraf.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-teal bg-opacity-10 border border-teal border-opacity-30 rounded-lg p-3">
            <p className="text-teal text-sm">{success}</p>
          </div>
        )}

        <button type="submit" disabled={loading || !fullName || !email || !password} className="btn-primary w-full py-3">
          {loading ? '...' : 'Samee'}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-terracotta text-sm">
            Akoon ma haysataa? Soo Gal
          </Link>
        </div>
      </form>
    </div>
  )
}
