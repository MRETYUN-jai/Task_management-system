// src/pages/AssignedTasks.jsx
// Shows all tasks assigned to the currently logged-in user
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import TaskCard from '../components/TaskCard'

const AssignedTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await api.get(`/assigned/${user.user_id}`)
        setTasks(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchMyTasks()
  }, [user])

  // Count by status
  const counts = tasks.reduce((acc, t) => {
    const s = t.current_status || 'Pending'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Assigned Tasks</h1>

      {/* Quick Summary Badges */}
      {!loading && tasks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {[['Pending','bg-yellow-100 text-yellow-800'], ['In Progress','bg-blue-100 text-blue-800'], ['Completed','bg-green-100 text-green-800']].map(([s, cls]) => (
            <span key={s} className={`px-3 py-1.5 rounded-full text-sm font-medium ${cls}`}>
              {counts[s] || 0} {s}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">👋</p>
          <p className="text-gray-500">No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map(task => <TaskCard key={task.task_id} task={task} />)}
        </div>
      )}
    </div>
  )
}

export default AssignedTasks
