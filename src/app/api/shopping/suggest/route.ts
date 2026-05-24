import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateShoppingSuggestions } from '@/lib/shoppingRules'
import { sumIntake, computeGaps } from '@/lib/nutrition'
import type { IntakeLog, NutritionGoals, FoodPreferences } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dismissed = searchParams.get('dismissed')?.split(',').filter(Boolean) ?? []

  const today = new Date().toISOString().split('T')[0]

  const [goalsRes, logsRes, pantryRes, prefsRes] = await Promise.all([
    supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    supabase.from('intake_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
    supabase.from('pantry_items').select('name').eq('user_id', user.id),
    supabase.from('food_preferences').select('*').eq('user_id', user.id).single(),
  ])

  const goals = goalsRes.data as NutritionGoals | null
  const logs = (logsRes.data ?? []) as IntakeLog[]
  const pantryNames = (pantryRes.data ?? []).map((p: { name: string }) => p.name)
  const prefs = prefsRes.data as FoodPreferences | null

  const actual = sumIntake(logs)
  const gaps = goals ? computeGaps(goals, actual) : []
  const lowNutrients = gaps.filter(g => g.status === 'low').map(g => g.label)

  // Rule-based engine — no AI call needed
  const suggestions = generateShoppingSuggestions({
    pantryItems: pantryNames,
    lowNutrients,
    diet: prefs?.dietary_flags?.find(f => ['vegetarian', 'vegan'].includes(f)),
    allergens: (prefs as any)?.allergens ?? [],
    dismissed,
  })

  // Cache in DB so the page loads instantly next visit
  await supabase.from('food_preferences').upsert(
    { user_id: user.id, shopping_suggestions: suggestions },
    { onConflict: 'user_id' }
  )

  return NextResponse.json(suggestions)
}
