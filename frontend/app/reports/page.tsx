'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'
import ProtectedRoute from '../components/protected-route'

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export default function ReportsPage() {
  const [machines, setMachines] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/machines/', { headers: authHeaders() }).then(res => res.json()),
      fetch('http://127.0.0.1:8000/work-orders/', { headers: authHeaders() }).then(res => res.json()),
    ]).then(([machinesData, workOrdersData]) => {
      setMachines(machinesData)
      setWorkOrders(workOrdersData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function getTotalOrders(machineId: number) {
    return workOrders.filter((wo: any) => wo.machine_id === machineId).length
  }

  function getTotalCost(machineId: number) {
    return workOrders
      .filter((wo: any) => wo.machine_id === machineId && wo.status === 'completed')
      .reduce((acc: number, wo: any) => acc + (wo.total_cost || 0), 0)
      .toFixed(2)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">

        <Sidebar />

        <main className="flex-1 px-8 py-8">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-gray-500">Custo e desempenho por máquina</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Total de Máquinas</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{machines.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Total de OS</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{workOrders.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Custo Total Geral</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                R$ {workOrders.reduce((acc: number, wo: any) => acc + (wo.total_cost || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Custo por Máquina</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Carregando relatório...</p>
            ) : machines.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma máquina cadastrada ainda.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Máquina</th>
                    <th className="pb-3">Setor</th>
                    <th className="pb-3">Total de OS</th>
                    <th className="pb-3">Custo Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine: any) => (
                    <tr key={machine.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{machine.name}</td>
                      <td className="py-3 text-gray-600">{machine.sector || '—'}</td>
                      <td className="py-3 text-gray-600">{getTotalOrders(machine.id)}</td>
                      <td className="py-3 font-medium text-gray-800">R$ {getTotalCost(machine.id)}</td>
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
      </div>
    </ProtectedRoute>
  )
}