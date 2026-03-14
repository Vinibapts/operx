'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([])
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    machine_id: '',
    description: ''
  })

  function loadData() {
    Promise.all([
      fetch('http://127.0.0.1:8000/work-orders/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/machines/').then(res => res.json()),
    ]).then(([ordersData, machinesData]) => {
      setWorkOrders(ordersData)
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
      const response = await fetch('http://127.0.0.1:8000/work-orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: parseInt(form.machine_id),
          description: form.description
        })
      })

      if (response.ok) {
        setShowModal(false)
        setForm({ machine_id: '', description: '' })
        loadData()
      } else {
        alert('Erro ao salvar OS.')
      }
    } catch {
      alert('Erro ao conectar com o servidor.')
    }

    setSaving(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <main className="flex-1 px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h1>
            <p className="text-gray-500">Gerencie as manutenções da sua operação</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Nova OS
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {['Todas', 'Pendentes', 'Em Andamento', 'Concluídas'].map((filter) => (
            <button key={filter} className="px-4 py-1.5 rounded-full text-sm border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition">
              {filter}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {loading ? (
            <p className="text-gray-400 text-sm">Carregando ordens de serviço...</p>
          ) : workOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma ordem de serviço encontrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Máquina</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Aberta em</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo: any) => {
                  const machine = machines.find((m: any) => m.id === wo.machine_id)
                  return (
                    <tr key={wo.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-gray-500">#{wo.id}</td>
                      <td className="py-3 font-medium text-gray-800">{machine ? (machine as any).name : `#${wo.machine_id}`}</td>
                      <td className="py-3 text-gray-600">{wo.description || '—'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          wo.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          wo.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          wo.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {wo.status === 'pending' ? 'Pendente' :
                           wo.status === 'in_progress' ? 'Em Andamento' :
                           wo.status === 'completed' ? 'Concluída' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(wo.opened_at).toLocaleDateString('pt-BR')}
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Nova Ordem de Serviço</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Máquina *</label>
                <select value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione uma máquina</option>
                  {machines.map((machine: any) => (
                    <option key={machine.id} value={machine.id}>{machine.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea placeholder="Descreva o problema ou serviço..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}