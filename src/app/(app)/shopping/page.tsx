import { createClient } from '@/lib/supabase/server'
import ShoppingClient from '@/components/shopping/ShoppingClient'
import type { ShoppingItem, ShoppingSuggestion } from '@/types'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [itemsRes, prefsRes] = await Promise.all([
    supabase.from('shopping_items').select('*').eq('user_id', user.id).order('added_at', { ascending: false }),
    supabase.from('food_preferences')
      .select('shopping_budget, shopping_suggestions, dismissed_shopping_names')
      .eq('user_id', user.id)
      .single(),
  ])

  const allSuggestions = (prefsRes.data?.shopping_suggestions ?? []) as ShoppingSuggestion[]
  const dismissedNames = (prefsRes.data?.dismissed_shopping_names ?? []) as string[]

  // Filter out dismissed suggestions server-side (same pattern as meals)
  const visibleSuggestions = allSuggestions.filter(s => !dismissedNames.includes(s.name))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
        <p className="text-gray-500 mt-1 text-sm">AI-suggested groceries based on your pantry and nutrition gaps, with budget tracking.</p>
      </div>
      <ShoppingClient
        initialItems={(itemsRes.data ?? []) as ShoppingItem[]}
        userId={user.id}
        initialBudget={prefsRes.data?.shopping_budget ?? 50}
        initialSuggestions={visibleSuggestions}
        initialDismissed={dismissedNames}
      />
    </div>
  )
}
