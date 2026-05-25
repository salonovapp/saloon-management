import React from 'react'
import { useLocation } from 'react-router-dom'
import { AppRoutes, isAuthLayoutPath } from './router/index.jsx'
import AppLayout from './layouts/AppLayout.jsx'

export default function App() {
  const location = useLocation()
  const isAuthLayout = isAuthLayoutPath(location.pathname)

  if (isAuthLayout) {
    return (
      <div className="app-shell min-h-screen">
        <main>
          <AppRoutes />
        </main>
      </div>
    )
  }

  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  )
}
