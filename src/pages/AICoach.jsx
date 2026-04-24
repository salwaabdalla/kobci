import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { askCoach } from '../services/aiService'
import { useLocation } from 'react-router-dom'

const QUICK_PROMPTS = [
  'Sideen u qiimeeyo alaabta?',
  'Lacagta sideen u maareeyo?',
  'Maxaan samayn karaa ganacsi inuu kobco?',
]

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  text: 'Assalamu Calaykum! Waxaan ahay Kobcin, macallinkaa ganacsi. Maxaan kugu caawin karaa maanta?',
}

export default function AICoach() {
  const { userProfile } = useApp()
  const location = useLocation()
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const routePrompt = location.state?.prompt
    if (routePrompt) {
      send(routePrompt)
      window.history.replaceState({}, '')
    }
  }, [])

  const send = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }])
    setLoading(true)

    try {
      const reply = await askCoach(userText, userProfile)
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + 'err',
          role: 'error',
          text: 'Waxaa jiray khalad. Isku day mar kale.',
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="card mb-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-gold font-heading font-bold text-lg flex-shrink-0">
          K
        </div>
        <div className="flex-1">
          <h1 className="font-heading font-semibold text-brown">Kobcin — Macallinka AI</h1>
          <p className="text-teal text-xs">● Diyaar u yahay inuu kaa caawiyo</p>
        </div>
        <button
          onClick={() => setMessages([WELCOME_MSG])}
          className="text-xs text-muted hover:text-red-500 transition-colors flex-shrink-0 border border-amber-200 rounded-lg px-2 py-1"
        >
          🗑️ Nadiifi
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-brown flex items-center justify-center text-gold text-xs font-bold mr-2 mt-1 flex-shrink-0">
                K
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-body ${
                msg.role === 'user'
                  ? 'bg-terracotta text-white rounded-tr-sm'
                  : msg.role === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                  : 'bg-white text-brown border border-amber-100 rounded-tl-sm shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brown flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
              K
            </div>
            <div className="bg-white border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 flex-shrink-0">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={loading}
            className="flex-shrink-0 bg-white border border-amber-200 text-muted text-xs px-3 py-2 rounded-full hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Su'aashaada geli..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="btn-primary px-4 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
