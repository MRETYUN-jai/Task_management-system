// src/App.jsx
// ---------------------------------------------------------------------------
// Main Application Component
// Sets up React Router with protected and public routes.
// Wraps everything in AuthProvider for global auth state.
// ---------------------------------------------------------------------------

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Page imports
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateTask from './pages/CreateTask'
import TaskList from './pages/TaskList'
import AssignedTasks from './pages/AssignedTasks'
import TaskDetails from './pages/TaskDetails'
import Reports from './pages/Reports'
import UserProfile from './pages/UserProfile'

// Layout with Sidebar
import Layout from './components/Layout'

// ── Protected Route Component ──────────────────────────────────────────────
// Redirects to /login if the user is not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// ── Admin Only Route ───────────────────────────────────────────────────────
// Redirects to /dashboard if the user is not an admin
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

// ── App with Router ────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

      {/* Protected Routes - wrapped in Layout (Sidebar + Navbar) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="tasks"         element={<TaskList />} />
        <Route path="tasks/:id"     element={<TaskDetails />} />
        <Route path="assigned"      element={<AssignedTasks />} />
        <Route path="reports"       element={<Reports />} />
        <Route path="profile"       element={<UserProfile />} />

        {/* Admin Only */}
        <Route path="tasks/create"  element={<AdminRoute><CreateTask /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── Root App Component ─────────────────────────────────────────────────────
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
