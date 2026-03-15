// src/pages/Dashboard.jsx
// ---------------------------------------------------------------------------
// Dashboard Page
// Shows total, pending, completed, and overdue task stats as stat cards.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

// Stat Card sub-component
const StatCard = ({ label, value, color, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0, pending: 0, overdue: 0 })
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/tasks'),
        ])
        setStats(statsRes.data)
        setRecentTasks(tasksRes.data.slice(0, 5)) // Show only recent 5
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}! 👋</p>
        </div>
        {isAdmin && (
          <button onClick={() => navigate('/tasks/create')} className="btn-primary flex items-center gap-2">
            <span>+</span> New Task
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"     value={stats.total}      color="bg-blue-500"   icon="📋" onClick={() => navigate('/tasks')} />
        <StatCard label="Pending"         value={stats.pending}    color="bg-yellow-500" icon="⏳" onClick={() => navigate('/tasks?status=Pending')} />
        <StatCard label="In Progress"     value={stats.in_progress} color="bg-indigo-500" icon="🔄" onClick={() => navigate('/tasks?status=In Progress')} />
        <StatCard label="Completed"       value={stats.completed}  color="bg-green-500"  icon="✅" onClick={() => navigate('/tasks?status=Completed')} />
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">{stats.overdue} task{stats.overdue > 1 ? 's are' : ' is'} overdue!</p>
            <p className="text-sm text-red-600">These tasks have passed their deadline.</p>
          </div>
          <button onClick={() => navigate('/tasks')} className="ml-auto text-red-600 text-sm hover:underline">View →</button>
        </div>
      )}

      {/* Recent Tasks Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
          <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Title</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Priority</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTasks.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-400">No tasks yet</td></tr>
              ) : recentTasks.map(t => (
                <tr
                  key={t.task_id}
                  onClick={() => navigate(`/tasks/${t.task_id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.priority === 'High' ? 'bg-red-100 text-red-700' :
                      t.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.current_status === 'Completed' ? 'bg-green-100 text-green-700' :
                      t.current_status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{t.current_status || 'Pending'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
