import React, { useEffect, useState } from 'react'
import api from '../api/axios'

const TabBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
      {children}
    </button>button>
  )

const Reports = () => {
    const [tab, setTab] = useState('completed')
    const [data, setData] = useState([])

    const fetchReport = async (t) => {
          try {
                  const res = await api.get(`/reports/${t}`)
                  setData(t === 'user-performance' ? res.data : res.data.tasks)
          } catch (e) { console.error(e) }
    }

    useEffect(() => { fetchReport(tab) }, [tab])

    const exportToCsv = () => {
          let csv = "ID,Title,Priority\n" + data.map(r => `${r.task_id},"${r.title}",${r.priority}`).join("\n")
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'report.csv'; a.click()
    }

    return (
          <div className="p-6">
                <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-bold">Reports</h1>h1>
                        <button onClick={exportToCsv} className="bg-green-600 text-white px-4 py-2 rounded">Export CSV</button>button>
                </div>div>
                <div className="flex gap-2 mb-4">
                        <TabBtn active={tab==='completed'} onClick={()=>setTab('completed')}>Done</TabBtn>TabBtn>
                        <TabBtn active={tab==='pending'} onClick={()=>setTab('pending')}>Todo</TabBtn>TabBtn>
                </div>div>
                <table className="w-full border">
                        <thead><tr><th>Title</th>th><th>Priority</th>th></tr>tr></thead>thead>
                        <tbody>{data.map(t => <tr key={t.task_id}><td>{t.title}</td>td><td>{t.priority}</td>td></tr>tr>)}</tbody>tbody>
                </table>table>
          </div>div>
        )
}
  export default Reports
    </div>
