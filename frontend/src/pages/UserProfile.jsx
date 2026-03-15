// src/pages/UserProfile.jsx
// View and edit current user's profile (name and password)
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const UserProfile = () => {
  const { user, login, token } = useAuth()

  const [form, setForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(''); setError('')

    if (form.password && form.password !== form.confirmPassword) {
      return setError('Passwords do not match.')
    }

    setLoading(true)
    try {
      const payload = { name: form.name }
      if (form.password) payload.password = form.password

      const res = await api.put(`/users/${user.user_id}`, payload)

      // Update auth context with new name
      login(res.data.user, token)
      setMsg('Profile updated successfully!')
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{user?.name}</p>
          <p className="text-gray-500">{user?.email}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Edit Profile</h2>

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{msg}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-gray-400">(leave blank to keep current)</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="New password" className="input-field" />
          </div>
          {form.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat new password" className="input-field" />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UserProfile
