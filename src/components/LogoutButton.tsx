'use client'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
    >
      <LogOut size={16} className="text-gray-400" />
      Log out
    </button>
  )
}
