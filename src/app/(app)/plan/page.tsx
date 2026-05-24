import { createClient } from '@/lib/supabase/server'
import MealPlanClient from '@/components/plan/MealPlanClient'
import type { SavedAIRecipe } from '@/types'

export default async function MealPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch current week's plan + saved recipes
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const startDate = monday.toISOString().split('T')[0]
  const endDate = sunday.toISOString().split('T')[0]

  const [planRes, savedRes] = await Promise.all([
    supabase.from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .gte('plan_date', startDate)
      .lte('plan_date', endDate),
    supabase.from('saved_ai_recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meal Plan</h1>
        <p className="text-gray-500 mt-1 text-sm">Plan your week — tap any slot to assign a saved recipe.</p>
      </div>
      <MealPlanClient
        userId={user.id}
        weekStart={startDate}
        initialPlan={planRes.data ?? []}
        savedRecipes={(savedRes.data ?? []) as SavedAIRecipe[]}
      />
    </div>
  )
}
