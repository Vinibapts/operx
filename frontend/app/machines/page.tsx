'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'
import ProtectedRoute from '../components/protected-route'

export default function MachinesPage() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sector: '',
    brand: '',
    model: '',
    status: 'active'
  })

  function loadMachines() {
    fetch('http://127.0.0.1:8000/machines/')
      .then(res => res.json())
      .then(data => {
        setMachines(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadMachines()
  }, [])

  async function handleSave() {
    if (!form.name) return alert('Nome da máquina é obrigatório!')
    setSaving(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/machines/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: 1,
          name: form.name,
          sector: form.sector,
          brand: form.brand,
          model: form.model,
          status: form.status
        })
      })

      if (response.ok) {
        setShowModal(false)
        setForm({ name: '', sector: '', brand: '', model: '', status: 'active' })
        loadMachines()
      } else {
        alert('Erro ao salvar máquina.')
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
              <h1 className="text-2xl font-bold text-gray-800">Máquinas</h1>
              <p className="text-gray-500">Gerencie os equipamentos da sua empresa</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              + Nova Máquina
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            {loading ? (
              <p className="text-gray-400 text-sm">Carregando máquinas...</p>
            ) : machines.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma máquina cadastrada ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Nome</th>
                    <th className="pb-3">Setor</th>
                    <th className="pb-3">Marca</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine: any) => (
                    <tr key={machine.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{machine.name}</td>
                      <td className="py-3 text-gray-600">{machine.sector || '—'}</td>
                      <td className="py-3 text-gray-600">{machine.brand || '—'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          machine.status === 'active' ? 'bg-green-100 text-green-700' :
                          machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {machine.status === 'active' ? 'Ativa' :
                           machine.status === 'maintenance' ? 'Em Manutenção' : 'Inativa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Nova Máquina</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome *</label>
                  <input type="text" placeholder="Ex: Torno CNC" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Setor</label>
                  <input type="text" placeholder="Ex: Produção" value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Marca</label>
                  <input type="text" placeholder="Ex: Romi" value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Modelo</label>
                  <input type="text" placeholder="Ex: G-200" value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Ativa</option>
                    <option value="maintenance">Em Manutenção</option>
                    <option value="inactive">Inativa</option>
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