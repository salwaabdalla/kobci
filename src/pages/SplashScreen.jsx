import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { userProfile } = useApp()
  const profileRef = useRef(userProfile)
  const [barFull, setBarFull] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => { profileRef.current = userProfile }, [userProfile])

  useEffect(() => {
    const barTimer = requestAnimationFrame(() => requestAnimationFrame(() => setBarFull(true)))
    const fadeTimer = setTimeout(() => setFading(true), 2000)
    const navTimer = setTimeout(() => {
      navigate(profileRef.current ? '/dashboard' : '/landing', { replace: true })
    }, 2500)
    return () => {
      cancelAnimationFrame(barTimer)
      clearTimeout(fadeTimer)
      clearTimeout(navTimer)
    }
  }, [navigate])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, #C2185B, #4A0028)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '48px', color: 'white', lineHeight: 1 }}>
            K
          </span>
        </div>

        <h1
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '64px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '4px',
            margin: 0,
            lineHeight: 1,
          }}
        >
          Kobcin
        </h1>

        <div style={{ width: '60px', height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }} />

        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '16px',
            fontWeight: 300,
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
          }}
        >
          Ganacsigaaga kor u qaad
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(255,255,255,0.2)',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: 'white',
            width: barFull ? '100%' : '0%',
            transition: 'width 2.5s linear',
          }}
        />
      </div>
    </div>
  )
}
