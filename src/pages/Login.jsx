import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { signIn } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn(email, password)

    if (!result.success) {
      setError(result.error?.message || 'Iimaylka ama furaha waa khalad. Isku day mar kale.')
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
          <h2 className="font-heading text-2xl font-semibold text-brown">Soo Gal</h2>
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
          <label className="text-sm font-medium text-brown mb-1 block">Furaha sirta ah</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-field"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading || !email || !password} className="btn-primary w-full py-3">
          {loading ? '...' : 'Gal'}
        </button>

        <div className="text-center">
          <Link to="/signup" className="text-terracotta text-sm">
            Akoon ma lihid? Diiwaangeli
          </Link>
        </div>
      </form>
    </div>
  )
}
