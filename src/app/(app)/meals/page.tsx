import { createClient } from '@/lib/supabase/server'
import MealsClient from '@/components/meals/MealsClient'
import type { AIRecipe, ScheduleBlock } from '@/types'

export default async function MealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date().toISOString()
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59)
  const today = now.split('T')[0]

  const [blocksRes, prefsRes, savedRes] = await Promise.all([
    supabase
      .from('schedule_blocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_cooking_window', true)
      .gte('start_time', now)
      .lte('start_time', endOfDay.toISOString())
      .order('start_time'),
    supabase
      .from('food_preferences')
      .select(`
        breakfast_suggestions, breakfast_generated_at,
        lunch_suggestions, lunch_generated_at,
        dinner_suggestions, dinner_generated_at,
        dismissed_meal_ids
      `)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('saved_ai_recipes')
      .select('recipe_id')
      .eq('user_id', user.id),
  ])

  const prefs = prefsRes.data

  function typeData(type: 'breakfast' | 'lunch' | 'dinner') {
    const recipes = (prefs?.[`${type}_suggestions`] ?? []) as AIRecipe[]
    const generatedAt = (prefs?.[`${type}_generated_at`] ?? null) as string | null
    const usedToday = generatedAt ? generatedAt.split('T')[0] === today : false
    return { recipes, generatedAt, usedToday }
  }

  const dismissedIds = (prefs?.dismissed_meal_ids ?? []) as string[]
  const savedIds = (savedRes.data ?? []).map((r: { recipe_id: string }) => r.recipe_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meal Ideas</h1>
        <p className="text-gray-500 mt-1 text-sm">AI-suggested meals based on your pantry and nutrition goals.</p>
      </div>
      <MealsClient
        cookingWindows={(blocksRes.data ?? []) as ScheduleBlock[]}
        userId={user.id}
        initialBreakfast={typeData('breakfast')}
        initialLunch={typeData('lunch')}
        initialDinner={typeData('dinner')}
        initialDismissed={dismissedIds}
        initialSavedIds={savedIds}
      />
    </div>
  )
}
