import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Navigation from './components/Navigation'
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
import Signup from './pages/Signup'
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

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center px-4">
      <div
        className="w-10 h-10 rounded-full border-4 border-amber-100 border-t-transparent animate-spin mb-4"
        style={{ borderTopColor: '#C2185B' }}
      />
      <p className="font-heading text-xl text-brown">Xogta la soo rarayo...</p>
    </div>
  )
}

function NetworkBanner() {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] bg-amber-50 border border-amber-200 text-brown text-sm px-4 py-2 rounded-full shadow-sm">
      Xiriirka internetka hubi
    </div>
  )
}

function ProtectedLayout({ children }) {
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

function PublicRoute({ children }) {
  const { user, userProfile, authLoading, dataLoading } = useApp()

  if (authLoading || (user && dataLoading)) {
    return <FullScreenLoader />
  }

  if (user) {
    return <Navigate to={userProfile ? '/dashboard' : '/onboarding'} replace />
  }

  return children
}

function OnboardingRoute({ children }) {
  const { user, userProfile, authLoading, dataLoading } = useApp()

  if (authLoading || (user && dataLoading)) {
    return <FullScreenLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (userProfile) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function ProtectedRoute({ children }) {
  const { user, userProfile, authLoading, dataLoading } = useApp()

  if (authLoading || (user && dataLoading)) {
    return <FullScreenLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!userProfile) {
    return <Navigate to="/onboarding" replace />
  }

  return <ProtectedLayout>{children}</ProtectedLayout>
}

export default function App() {
  const { networkWarning } = useApp()

  return (
    <>
      {networkWarning && <NetworkBanner />}
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route
          path="/login"
          element={(
            <PublicRoute>
              <Login />
            </PublicRoute>
          )}
        />
        <Route
          path="/signup"
          element={(
            <PublicRoute>
              <Signup />
            </PublicRoute>
          )}
        />
        <Route
          path="/onboarding"
          element={(
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          )}
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
        <Route path="/money" element={<ProtectedRoute><MoneyHub /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><StockSales /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SupplierDirectory /></ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><MentorMatching /></ProtectedRoute>} />
        <Route path="/forecast" element={<ProtectedRoute><SeasonalForecast /></ProtectedRoute>} />
        <Route path="/business-plan" element={<ProtectedRoute><BusinessPlan /></ProtectedRoute>} />
        <Route path="/grow" element={<ProtectedRoute><Grow /></ProtectedRoute>} />
        <Route path="/inspire" element={<ProtectedRoute><Inspire /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
