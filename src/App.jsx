import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Navigation from './components/Navigation'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import AICoach from './pages/AICoach'
import MoneyHub from './pages/MoneyHub'
import StockSales from './pages/StockSales'
import SupplierDirectory from './pages/SupplierDirectory'
import MentorMatching from './pages/MentorMatching'
import SeasonalForecast from './pages/SeasonalForecast'
import BusinessPlan from './pages/BusinessPlan'
import Grow from './pages/Grow'
import Inspire from './pages/Inspire'
import Settings from './pages/Settings'

function ProtectedLayout({ children }) {
  const { userProfile } = useApp()
  if (!userProfile) return <Navigate to="/" replace />
  return (
    <div className="flex min-h-screen bg-sand">
      <Navigation />
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const { userProfile } = useApp()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/dashboard"
        element={<ProtectedLayout><Dashboard /></ProtectedLayout>}
      />
      <Route
        path="/coach"
        element={<ProtectedLayout><AICoach /></ProtectedLayout>}
      />
      <Route
        path="/money"
        element={<ProtectedLayout><MoneyHub /></ProtectedLayout>}
      />
      <Route
        path="/stock"
        element={<ProtectedLayout><StockSales /></ProtectedLayout>}
      />
      <Route
        path="/suppliers"
        element={<ProtectedLayout><SupplierDirectory /></ProtectedLayout>}
      />
      <Route
        path="/mentors"
        element={<ProtectedLayout><MentorMatching /></ProtectedLayout>}
      />
      <Route
        path="/forecast"
        element={<ProtectedLayout><SeasonalForecast /></ProtectedLayout>}
      />
      <Route
        path="/business-plan"
        element={<ProtectedLayout><BusinessPlan /></ProtectedLayout>}
      />
      <Route
        path="/grow"
        element={<ProtectedLayout><Grow /></ProtectedLayout>}
      />
      <Route
        path="/inspire"
        element={<ProtectedLayout><Inspire /></ProtectedLayout>}
      />
      <Route
        path="/settings"
        element={<ProtectedLayout><Settings /></ProtectedLayout>}
      />
      <Route path="*" element={<Navigate to={userProfile ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}
