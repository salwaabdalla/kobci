import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navItems = [
  { path: '/dashboard', label: 'Guriga' },
  { path: '/coach', label: 'Macallinka AI' },
  { path: '/money', label: 'Lacagta' },
  { path: '/stock', label: 'Kaydka' },
  { path: '/suppliers', label: 'Alaab-siiyayaasha' },
  { path: '/mentors', label: 'Tutorrada' },
  { path: '/forecast', label: 'Saadaalinta' },
  { path: '/business-plan', label: 'Ganacsiga' },
  { path: '/grow', label: 'Kobcinta' },
  { path: '/inspire', label: 'Dhiiri-gelin' },
  { path: '/settings', label: 'Xogta' },
]

const mobileNavItems = navItems.slice(0, 5)

export default function Navigation() {
  const { userProfile, streak, signOut } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeClass = 'bg-terracotta text-white font-bold'
  const inactiveClass = 'text-muted hover:bg-sand hover:text-brown'

  const handleLogout = async () => {
    await signOut()
    setSidebarOpen(false)
    navigate('/login')
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-amber-100 fixed left-0 top-0 z-30" style={{ height: '100vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
        <div className="bg-brown text-white p-5">
          <h1 className="font-heading text-2xl font-bold text-gold">Kobcin</h1>
          {userProfile && (
            <>
              <p className="text-sand text-sm mt-1 font-medium truncate">{userProfile.businessName}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-gold text-xs">🔥</span>
                <span className="text-amber-200 text-xs">{streak.currentStreak} maalmood joogto ah</span>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? activeClass : inactiveClass}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-100 space-y-3">
          <button onClick={() => void handleLogout()} className="btn-secondary w-full py-2">
            Ka Bax
          </button>
          <p className="text-xs text-muted text-center">Kobcin v1.0</p>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-brown text-white flex items-center justify-between px-4 py-3">
        <h1 className="font-heading text-xl font-bold text-gold">Kobcin</h1>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-1" aria-label="Furan menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl">
            <div className="bg-brown text-white p-5">
              <h1 className="font-heading text-2xl font-bold text-gold">Kobcin</h1>
              {userProfile && (
                <>
                  <p className="text-sand text-sm mt-1 font-medium truncate">{userProfile.businessName}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-gold text-xs">🔥</span>
                    <span className="text-amber-200 text-xs">{streak.currentStreak} maalmood joogto ah</span>
                  </div>
                </>
              )}
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? activeClass : inactiveClass}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-amber-100">
              <button onClick={() => void handleLogout()} className="btn-secondary w-full py-2">
                Ka Bax
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-amber-100 flex">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink key={item.path} to={item.path} className="flex-1 flex flex-col items-center py-2 gap-0.5">
              <span className={`text-xs font-medium ${isActive ? 'text-terracotta' : 'text-muted'}`}>
                {item.label.split(' ')[0]}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
