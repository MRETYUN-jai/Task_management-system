// src/pages/TaskList.jsx
// ---------------------------------------------------------------------------
// Task List Page
// Shows all tasks with search, filter by status/priority, and sort by deadline.
// ---------------------------------------------------------------------------
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import TaskCard from '../components/TaskCard'

const TaskList = () => {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState(searchParams.get('status') || '')
  const [priority, setPriority] = useState('')

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)   params.search   = search
      if (status)   params.status   = status
      if (priority) params.priority = priority
      const res = await api.get('/tasks', { params })
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [status, priority]) // Re-fetch when filters change

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTasks()
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(tasks.filter(t => t.task_id !== taskId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        {isAdmin && (
          <button onClick={() => navigate('/tasks/create')} className="btn-primary">
            + Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 min-w-[200px]"
          />
          <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-40">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field w-36">
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" onClick={() => { setSearch(''); setStatus(''); setPriority(''); setTimeout(fetchTasks, 0) }} className="btn-secondary">
            Clear
          </button>
        </form>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>

      {/* Task Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">No tasks found. Adjust your filters or create a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div key={task.task_id} className="relative group">
              <TaskCard task={task} />
              {/* Admin Delete Button */}
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(task.task_id) }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 rounded-lg p-1.5 hover:bg-red-200 text-xs"
                  title="Delete task"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList
