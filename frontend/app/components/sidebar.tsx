'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Máquinas', href: '/machines', icon: '⚙️' },
  { label: 'Ordens de Serviço', href: '/work-orders', icon: '🔧' },
  { label: 'Planos de Manutenção', href: '/maintenance-plans', icon: '📋' },
  { label: 'Relatórios', href: '/reports', icon: '📈' },
  { label: 'Configurações', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-white shadow-sm flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <img src="/logo.png" alt="Operx" className="h-16 w-auto object-contain" />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium">Vinícius</p>
        <p className="text-xs text-gray-400 mb-2">Admin</p>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition"
        >
          → Sair
        </button>
      </div>

    </aside>
  )
}