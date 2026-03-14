'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'

export default function SettingsPage() {
  const [settingId, setSettingId] = useState<number | null>(null)
  const [channel, setChannel] = useState('email')
  const [alertDays, setAlertDays] = useState('3')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/alert-settings/')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const s = data[0]
          setSettingId(s.id)
          setChannel(s.channel)
          setAlertDays(String(s.advance_days))
        }
      })
  }, [])

  async function handleSave() {
    setSaving(true)

    try {
      let response

      if (settingId) {
        response = await fetch(`http://127.0.0.1:8000/alert-settings/${settingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            channel,
            advance_days: parseInt(alertDays),
            active: true
          })
        })
      } else {
        response = await fetch('http://127.0.0.1:8000/alert-settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: 1,
            channel,
            advance_days: parseInt(alertDays),
            active: true
          })
        })

        if (response.ok) {
          const data = await response.json()
          setSettingId(data.id)
        }
      }

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Erro ao salvar configurações.')
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

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-gray-500">Gerencie as configurações de alertas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Alertas</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Canal de alerta</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="both">Email + WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Alertar com quantos dias de antecedência?</label>
              <select
                value={alertDays}
                onChange={(e) => setAlertDays(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 dia antes</option>
                <option value="3">3 dias antes</option>
                <option value="7">7 dias antes</option>
                <option value="15">15 dias antes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">✓ Configurações salvas!</span>
          )}
        </div>

      </main>
    </div>
  )
}