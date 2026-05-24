import { createClient } from '@/lib/supabase/server'
import GoalsClient from '@/components/nutrition/GoalsClient'
import type { NutritionGoals, FoodPreferences } from '@/types'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [goalsRes, prefsRes] = await Promise.all([
    supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    supabase.from('food_preferences').select('*').eq('user_id', user.id).single(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nutrition Goals & Preferences</h1>
      <GoalsClient
        initialGoals={goalsRes.data as NutritionGoals | null}
        initialPrefs={prefsRes.data as FoodPreferences | null}
        userId={user.id}
      />
    </div>
  )
}
