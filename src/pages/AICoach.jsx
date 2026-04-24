import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { askCoach } from '../services/aiService'

const QUICK_PROMPTS = [
  'Alaabta sideen u qiimeeyo?',
  'Lacagta sideen u maareeyo?',
  'Macaamiisha sideen u helo?',
]

function buildWelcome(userProfile) {
  const name = userProfile?.name || 'Ganacsade'
  const businessName = userProfile?.businessName || 'ganacsigaaga'
  return `Subax wanaagsan ${name}! Ganacsigaaga ${businessName} maanta sidee u socday? Wax kasta oo aad dooneyso weydii — lacagta, qiimaha, ama macaamiisha.`
}

function formatAIMessage(text) {
  return (text || '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .split('\n')
    .filter((line) => line.trim())
}

export default function AICoach() {
  const { userProfile, chatMessages, saveChatMessage, clearChatMessages } = useApp()
  const location = useLocation()
  const inputRef = useRef(null)
  const bottomRef = useRef(null)
  const sentPromptRef = useRef(false)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const welcomeMsg = {
    id: 'welcome',
    role: 'assistant',
    content: buildWelcome(userProfile),
  }

  const messages = chatMessages.length > 0 ? chatMessages : [welcomeMsg]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const routePrompt = location.state?.prompt
    if (!routePrompt || sentPromptRef.current) return
    sentPromptRef.current = true
    void send(routePrompt)
    window.history.replaceState({}, '')
  }, [location.state])

  const send = async (overrideText) => {
    const userText = overrideText || input.trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)

    try {
      await saveChatMessage({ role: 'user', content: userText })
      const reply = await askCoach(userText, userProfile)
      await saveChatMessage({ role: 'assistant', content: reply.content })
    } catch {
      await saveChatMessage({ role: 'assistant', content: 'Wax khalad ah ayaa dhacay. Dib u isku day.' })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleClear = async () => {
    await clearChatMessages()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)]">
      <div className="card mb-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-brown flex items-center justify-center text-gold font-heading font-bold text-lg flex-shrink-0">
          K
        </div>
        <div className="flex-1">
          <h1 className="font-heading font-semibold text-brown">Kobcin - AI Coach</h1>
          <p className="text-teal text-xs">● Diyaar u talin</p>
        </div>
        <button onClick={() => void handleClear()} className="text-xs text-muted hover:text-red-500 transition-colors flex-shrink-0 border border-amber-200 rounded-lg px-2 py-1">
          Tirtir
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-brown flex items-center justify-center text-gold text-xs font-bold mr-2 mt-1 flex-shrink-0">
                K
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-body ${
                message.role === 'user'
                  ? 'bg-terracotta text-white rounded-tr-sm'
                  : 'bg-white text-brown border border-amber-100 rounded-tl-sm shadow-sm'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="space-y-2">
                  {formatAIMessage(message.content || message.text).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                message.content || message.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brown flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
              K
            </div>
            <div className="bg-white border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 flex-shrink-0">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => void send(prompt)}
            disabled={loading}
            className="flex-shrink-0 bg-white border border-amber-200 text-muted text-xs px-3 py-2 rounded-full hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void send()
            }
          }}
          placeholder="Su'aashaada qor..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button onClick={() => void send()} disabled={!input.trim() || loading} className="btn-primary px-4 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
