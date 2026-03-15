// src/components/StatusBadge.jsx
// Displays task status as a colored pill badge
import React from 'react'

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending':     'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed':   'bg-green-100 text-green-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status || 'Pending'}
    </span>
  )
}

export default StatusBadge
