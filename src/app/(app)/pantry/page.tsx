import { createClient } from '@/lib/supabase/server'
import PantryClient from '@/components/pantry/PantryClient'
import type { PantryItem } from '@/types'

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pantry</h1>
          <p className="text-gray-500 mt-1 text-sm">{data?.length ?? 0} items in stock</p>
        </div>
      </div>
      <PantryClient initialItems={(data ?? []) as PantryItem[]} userId={user.id} />
    </div>
  )
}
