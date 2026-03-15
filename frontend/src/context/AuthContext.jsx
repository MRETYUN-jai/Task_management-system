// src/context/AuthContext.jsx
// ---------------------------------------------------------------------------
// Authentication Context
// Provides login, logout, and user state to all components in the app.
// Persists user info and token to localStorage so login survives page refresh.
// ---------------------------------------------------------------------------

import React, { createContext, useContext, useState } from 'react'

// 1. Create the context
const AuthContext = createContext()

// 2. Provider component - wraps the whole app in App.jsx
export const AuthProvider = ({ children }) => {
  // Initialize from localStorage (persisted login)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  // Called after successful login or register API response
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
  }

  // Clears all auth data and redirects to login
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Convenience: check if the logged-in user is an admin
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook - use this in any component: const { user, login, logout } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
