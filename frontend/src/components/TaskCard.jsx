// src/components/TaskCard.jsx
// ---------------------------------------------------------------------------
// Task Card Component
// A card showing task summary info used in TaskList and AssignedTasks pages.
// ---------------------------------------------------------------------------
import React from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

const TaskCard = ({ task }) => {
  const navigate = useNavigate()

  // Check if deadline is past and task isn't completed
  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.current_status !== 'Completed'

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No deadline'

  return (
    <div
      onClick={() => navigate(`/tasks/${task.task_id}`)}
      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        {isOverdue && (
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
            Overdue
          </span>
        )}
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.current_status} />
      </div>

      {/* Footer: creator and deadline */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>By {task.created_by_name || 'Unknown'}</span>
        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
          📅 {formatDate(task.deadline)}
        </span>
      </div>
    </div>
  )
}

export default TaskCard
