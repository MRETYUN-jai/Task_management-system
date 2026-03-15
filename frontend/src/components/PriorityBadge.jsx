// src/components/PriorityBadge.jsx
// Displays task priority as a colored indicator
import React from 'react'

const PriorityBadge = ({ priority }) => {
  const styles = {
    'High':   'bg-red-100 text-red-800 border border-red-200',
    'Medium': 'bg-orange-100 text-orange-800 border border-orange-200',
    'Low':    'bg-gray-100 text-gray-700 border border-gray-200',
  }

  const dots = {
    'High':   'bg-red-500',
    'Medium': 'bg-orange-500',
    'Low':    'bg-gray-500',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || styles['Low']}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[priority] || dots['Low']}`}></span>
      {priority || 'Low'}
    </span>
  )
}

export default PriorityBadge
