'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'
import ProtectedRoute from '../components/protected-route'

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export default function FailureLogsPage() {
  const [logs, setLogs] = useState([])
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    machine_id: '',
    description: '',
    downtime_hours: '',
    estimated_cost: ''
  })

  function loadData() {
    Promise.all([
      fetch('http://127.0.0.1:8000/failure-logs/', { headers: authHeaders() }).then(res => res.json()),
      fetch('http://127.0.0.1:8000/machines/', { headers: authHeaders() }).then(res => res.json()),
    ]).then(([logsData, machinesData]) => {
      setLogs(logsData)
      setMachines(machinesData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSave() {
    if (!form.machine_id) return alert('Selecione uma máquina!')
    setSaving(true)

    try {
      const params = new URLSearchParams({
        machine_id: form.machine_id,
        description: form.description,
        ...(form.downtime_hours && { downtime_hours: form.downtime_hours }),
        ...(form.estimated_cost && { estimated_cost: form.estimated_cost }),
      })

      const response = await fetch(`http://127.0.0.1:8000/failure-logs/?${params}`, {
        method: 'POST',
        headers: authHeaders()
      })

      if (response.ok) {
        setShowModal(false)
        setForm({ machine_id: '', description: '', downtime_hours: '', estimated_cost: '' })
        loadData()
      } else {
        alert('Erro ao registrar falha.')
      }
    } catch {
      alert('Erro ao conectar com o servidor.')
    }

    setSaving(false)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Registro de Falhas</h1>
              <p className="text-gray-500">Histórico de problemas e falhas das máquinas</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
              + Registrar Falha
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {loading ? (
              <p className="text-gray-400 text-sm">Carregando falhas...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma falha registrada ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Máquina</th>
                    <th className="pb-3">Descrição</th>
                    <th className="pb-3">Tempo parado</th>
                    <th className="pb-3">Custo estimado</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => {
                    const machine = machines.find((m: any) => m.id === log.machine_id)
                    return (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{machine ? (machine as any).name : `#${log.machine_id}`}</td>
                        <td className="py-3 text-gray-600">{log.description || '—'}</td>
                        <td className="py-3 text-gray-600">{log.downtime_hours ? `${log.downtime_hours}h` : '—'}</td>
                        <td className="py-3 text-gray-600">{log.estimated_cost ? `R$ ${log.estimated_cost.toFixed(2)}` : '—'}</td>
                        <td className="py-3 text-gray-500">
                          {new Date(log.occurred_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Registrar Falha</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Máquina *</label>
                  <select value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">Selecione uma máquina</option>
                    {machines.map((machine: any) => (
                      <option key={machine.id} value={machine.id}>{machine.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição</label>
                  <textarea placeholder="Descreva o problema..." value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tempo parado (horas)</label>
                  <input type="number" placeholder="Ex: 2.5" value={form.downtime_hours}
                    onChange={(e) => setForm({ ...form, downtime_hours: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Custo estimado (R$)</label>
                  <input type="number" placeholder="Ex: 500.00" value={form.estimated_cost}
                    onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}