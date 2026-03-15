// src/pages/CreateTask.jsx
// Admin-only page to create a new task
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const CreateTask = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', deadline: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/tasks', form)
      navigate(`/tasks/${res.data.task.task_id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Tasks
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Design Database Schema" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the task in detail..." className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button type="button" onClick={() => navigate('/tasks')} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTask
