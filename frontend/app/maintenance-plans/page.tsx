'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'
import ProtectedRoute from '../components/protected-route'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { 'Authorization': `Bearer ${token}` }
}

export default function MaintenancePlansPage() {
  const [plans, setPlans] = useState([])
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    machine_id: '',
    type: 'preventive',
    description: '',
    frequency_days: '30'
  })

  function loadData() {
    Promise.all([
      fetch('http://127.0.0.1:8000/maintenance-plans/', { headers: authHeaders() }).then(res => res.json()),
      fetch('http://127.0.0.1:8000/machines/', { headers: authHeaders() }).then(res => res.json()),
    ]).then(([plansData, machinesData]) => {
      setPlans(plansData)
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
      const response = await fetch('http://127.0.0.1:8000/maintenance-plans/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          machine_id: parseInt(form.machine_id),
          type: form.type,
          description: form.description,
          frequency_days: parseInt(form.frequency_days)
        })
      })

      if (response.ok) {
        setShowModal(false)
        setForm({ machine_id: '', type: 'preventive', description: '', frequency_days: '30' })
        loadData()
      } else {
        alert('Erro ao salvar plano.')
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
              <h1 className="text-2xl font-bold text-gray-800">Planos de Manutenção</h1>
              <p className="text-gray-500">Configure as manutenções periódicas das máquinas</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              + Novo Plano
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            {loading ? (
              <p className="text-gray-400 text-sm">Carregando planos...</p>
            ) : plans.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum plano cadastrado ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Máquina</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Descrição</th>
                    <th className="pb-3">Frequência</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan: any) => {
                    const machine = machines.find((m: any) => m.id === plan.machine_id)
                    return (
                      <tr key={plan.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{machine ? (machine as any).name : `#${plan.machine_id}`}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.type === 'preventive' ? 'bg-blue-100 text-blue-700' :
                            plan.type === 'predictive' ? 'bg-purple-100 text-purple-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {plan.type === 'preventive' ? 'Preventiva' :
                             plan.type === 'predictive' ? 'Preditiva' : 'Corretiva'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{plan.description || '—'}</td>
                        <td className="py-3 text-gray-600">A cada {plan.frequency_days} dias</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {plan.active ? 'Ativo' : 'Inativo'}
                          </span>
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">Novo Plano de Manutenção</h2>
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
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="preventive">Preventiva</option>
                    <option value="predictive">Preditiva</option>
                    <option value="corrective">Corretiva</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Descrição</label>
                  <textarea placeholder="Ex: Troca de óleo e filtros" value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Frequência</label>
                  <select value={form.frequency_days} onChange={(e) => setForm({ ...form, frequency_days: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="7">A cada 7 dias</option>
                    <option value="15">A cada 15 dias</option>
                    <option value="30">A cada 30 dias</option>
                    <option value="60">A cada 60 dias</option>
                    <option value="90">A cada 90 dias</option>
                  </select>
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
    </ProtectedRoute>
  )
}