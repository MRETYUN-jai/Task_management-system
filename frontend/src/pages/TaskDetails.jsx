// src/pages/TaskDetails.jsx
// ---------------------------------------------------------------------------
// Task Details Page
// Shows full task info, assignees, status history. Allows status updates.
// Admin can also assign tasks to users from here.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

const TaskDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  // For admin assignment
  const [users, setUsers] = useState([])
  const [assignUserId, setAssignUserId] = useState('')
  const [assignMsg, setAssignMsg] = useState('')

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`)
      setTask(res.data)
      setNewStatus(res.data.statusHistory?.[0]?.status || 'Pending')
    } catch { navigate('/tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchTask()
    if (isAdmin) {
      api.get('/users').then(r => setUsers(r.data)).catch(() => {})
    }
  }, [id])

  const handleStatusUpdate = async () => {
    try {
      await api.put('/status/update', { task_id: Number(id), status: newStatus })
      setStatusMsg('Status updated successfully!')
      fetchTask() // Refresh
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to update status.')
    }
  }

  const handleAssign = async () => {
    if (!assignUserId) return
    try {
      await api.post('/assign', { task_id: Number(id), user_id: Number(assignUserId) })
      setAssignMsg('User assigned successfully!')
      setAssignUserId('')
      fetchTask()
    } catch (err) {
      setAssignMsg(err.response?.data?.message || 'Failed to assign.')
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No deadline'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!task) return null

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.statusHistory?.[0]?.status !== 'Completed'

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Back to Tasks
      </button>

      {/* Task Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.statusHistory?.[0]?.status} />
            {isOverdue && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Overdue</span>}
          </div>
        </div>

        {task.description && <p className="text-gray-600 mb-4">{task.description}</p>}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Created by:</span> <span className="font-medium">{task.created_by_name}</span></div>
          <div><span className="text-gray-500">Deadline:</span> <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>{formatDate(task.deadline)}</span></div>
          <div><span className="text-gray-500">Created:</span> <span className="font-medium">{formatDate(task.created_at)}</span></div>
          <div><span className="text-gray-500">Task ID:</span> <span className="font-medium">#{task.task_id}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Update Status</h2>
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field mb-3">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button onClick={handleStatusUpdate} className="btn-primary w-full">Update Status</button>
          {statusMsg && <p className="text-sm text-green-600 mt-2">{statusMsg}</p>}
        </div>

        {/* Assignees */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Assignees ({task.assignees?.length || 0})</h2>
          {task.assignees?.length === 0 ? (
            <p className="text-gray-400 text-sm">No one assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {task.assignees?.map(a => (
                <li key={a.user_id} className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 text-xs font-bold">{a.name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-gray-800">{a.name}</span>
                  <span className="text-gray-400">{a.email}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Admin: Assign User */}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Assign new user:</p>
              <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)} className="input-field mb-2">
                <option value="">Select a user...</option>
                {users.filter(u => !task.assignees?.find(a => a.user_id === u.user_id)).map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <button onClick={handleAssign} disabled={!assignUserId} className="btn-primary w-full disabled:opacity-50">Assign</button>
              {assignMsg && <p className={`text-xs mt-1 ${assignMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{assignMsg}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      {task.statusHistory?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Status History</h2>
          <div className="space-y-2">
            {task.statusHistory.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <StatusBadge status={s.status} />
                <span className="text-gray-500">by <span className="font-medium text-gray-700">{s.updated_by}</span></span>
                <span className="text-gray-400 ml-auto">{new Date(s.updated_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskDetails
