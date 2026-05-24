import Link from 'next/link'
import { ShoppingBasket, BarChart2, UtensilsCrossed, Home, Settings, BookOpen, ShoppingCart } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

const nav = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/pantry', label: 'Pantry', icon: ShoppingBasket },
  { href: '/log', label: "Today's Log", icon: BarChart2 },
  { href: '/meals', label: 'Meal Ideas', icon: UtensilsCrossed },
  { href: '/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/shopping', label: 'Shopping List', icon: ShoppingCart },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-lg font-bold tracking-tight text-emerald-600">PantryIQ</span>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Icon size={16} className="text-gray-400" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-2 pb-4 space-y-0.5">
          <Link href="/goals" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <Settings size={16} className="text-gray-400" />
            Goals & Preferences
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
