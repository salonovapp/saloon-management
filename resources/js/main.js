import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './stores/auth'
import '../css/app.css'

createRoot(document.getElementById('app')).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        BrowserRouter,
        null,
        React.createElement(App, null)
      )
    )
  )
)
