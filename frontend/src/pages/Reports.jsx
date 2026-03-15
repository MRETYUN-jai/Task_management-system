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

  const exportToCsv = () => {
    if (data.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = [];
    
    // Determine headers based on current tab
    if (tab === 'completed' || tab === 'pending') {
      headers = ['ID', 'Title', 'Priority', 'Created By', 'Deadline'];
      if (tab === 'pending') headers.push('Overdue');
      if (tab === 'completed') headers.push('Completed At');
    } else if (tab === 'user-performance') {
      headers = ['ID', 'Name', 'Role', 'Total Assigned', 'Completed', 'In Progress', 'Pending', 'Completion %'];
    }
    
    csvContent += headers.join(",") + "\r\n";
    
    // Add data rows
    data.forEach(row => {
      let rowArray = [];
      if (tab === 'completed' || tab === 'pending') {
        rowArray = [
          row.task_id,
          `"${row.title.replace(/"/g, '""')}"`, // Escape quotes in title
          row.priority,
          row.created_by,
          formatDate(row.deadline)
        ];
        if (tab === 'pending') rowArray.push(row.is_overdue ? 'Yes' : 'No');
        if (tab === 'completed') rowArray.push(formatDate(row.completed_at));
      } else if (tab === 'user-performance') {
        const pct = row.total_assigned > 0 ? Math.round((row.completed / row.total_assigned) * 100) : 0;
        rowArray = [
          row.user_id,
          `"${row.name}"`,
          row.role,
          row.total_assigned,
          row.completed,
          row.in_progress,
          row.pending,
          `${pct}%`
        ];
      }
      csvContent += rowArray.join(",") + "\r\n";
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `task_report_${tab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button 
          onClick={exportToCsv}
          disabled={data.length === 0 || loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

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
