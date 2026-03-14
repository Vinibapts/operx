'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'

export default function DashboardPage() {
  const [machines, setMachines] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/machines/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/work-orders/').then(res => res.json()),
    ]).then(([machinesData, workOrdersData]) => {
      setMachines(machinesData)
      setWorkOrders(workOrdersData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalMachines = machines.length
  const activeMachines = machines.filter((m: any) => m.status === 'active').length
  const pendingOrders = workOrders.filter((wo: any) => wo.status === 'pending').length
  const criticalMachines = machines.filter((m: any) => m.status === 'maintenance').length

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <main className="flex-1 px-8 py-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Visão geral da sua operação</p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total de Máquinas</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : totalMachines}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Máquinas Ativas</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : activeMachines}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">OS Pendentes</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : pendingOrders}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Em Manutenção</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '...' : criticalMachines}</p>
          </div>
        </div>

        {/* Tabela OS recentes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ordens de Serviço Recentes</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Carregando...</p>
          ) : workOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma ordem de serviço encontrada</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Máquina</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.slice(0, 5).map((wo: any) => {
                  const machine = machines.find((m: any) => m.id === wo.machine_id)
                  return (
                    <tr key={wo.id} className="border-b last:border-0 hover:bg-gray-50">
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
    </div>
  )
}