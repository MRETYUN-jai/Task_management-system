// src/pages/Reports.jsx
// ---------------------------------------------------------------------------
// Reports Page
// Shows completed tasks, pending tasks, and user performance stats tables.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
)

const Reports = () => {
  const [tab, setTab] = useState('completed')
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchReport = async (type) => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/${type}`)
      if (type === 'user-performance') {
        setData(res.data); setCount(res.data.length)
      } else {
        setData(res.data.tasks); setCount(res.data.count)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport(tab) }, [tab])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Tab Switcher */}
      <div className="flex gap-2 flex-wrap">
        <TabBtn active={tab === 'completed'} onClick={() => setTab('completed')}>✅ Completed Tasks</TabBtn>
        <TabBtn active={tab === 'pending'} onClick={() => setTab('pending')}>⏳ Pending Tasks</TabBtn>
        <TabBtn active={tab === 'user-performance'} onClick={() => setTab('user-performance')}>👥 User Performance</TabBtn>
      </div>

      {/* Summary count */}
      <p className="text-sm text-gray-500">{count} record{count !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* Completed / Pending Tasks Table */}
            {(tab === 'completed' || tab === 'pending') && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">#</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Title</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Priority</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Created By</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Deadline</th>
                    {tab === 'pending' && <th className="px-4 py-3 font-medium text-gray-600">Overdue?</th>}
                    {tab === 'completed' && <th className="px-4 py-3 font-medium text-gray-600">Completed At</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">No records found.</td></tr>
                  ) : data.map((t, i) => (
                    <tr key={t.task_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.priority === 'High' ? 'bg-red-100 text-red-700' :
                          t.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                        }`}>{t.priority}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.created_by}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(t.deadline)}</td>
                      {tab === 'pending' && (
                        <td className="px-4 py-3">
                          {t.is_overdue ? <span className="text-red-600 font-medium">Yes ⚠️</span> : <span className="text-green-600">No</span>}
                        </td>
                      )}
                      {tab === 'completed' && <td className="px-4 py-3 text-gray-600">{formatDate(t.completed_at)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* User Performance Table */}
            {tab === 'user-performance' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">#</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Completed</th>
                    <th className="px-4 py-3 font-medium text-gray-600">In Progress</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Pending</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-10 text-gray-400">No data.</td></tr>
                  ) : data.map((u, i) => {
                    const pct = u.total_assigned > 0 ? Math.round((u.completed / u.total_assigned) * 100) : 0
                    return (
                      <tr key={u.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                        <td className="px-4 py-3 font-bold">{u.total_assigned}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{u.completed}</td>
                        <td className="px-4 py-3 text-blue-600">{u.in_progress}</td>
                        <td className="px-4 py-3 text-yellow-600">{u.pending}</td>
                        <td className="px-4 py-3 w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
