import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestMealsWithGemini } from '@/lib/gemini'
import { sumIntake, remainingNutrients } from '@/lib/nutrition'
import type { IntakeLog, NutritionGoals, FoodPreferences, AIRecipe } from '@/types'

type MealType = 'breakfast' | 'lunch' | 'dinner'
const VALID_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

/** Keys for per-type columns */
function typeKeys(t: MealType) {
  return {
    suggestions: `${t}_suggestions` as keyof FoodPreferences,
    generatedAt: `${t}_generated_at` as keyof FoodPreferences,
  }
}

/** Has the user already generated this meal type today (UTC date)? */
function usedToday(generatedAt: string | null | undefined): boolean {
  if (!generatedAt) return false
  const today = new Date().toISOString().split('T')[0]
  return generatedAt.split('T')[0] === today
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const rawType = searchParams.get('mealType') ?? 'breakfast'
  const mealType: MealType = VALID_TYPES.includes(rawType as MealType)
    ? (rawType as MealType)
    : 'breakfast'
  const maxTime = searchParams.get('maxTime')
  const dismissed = searchParams.get('dismissed')?.split(',').filter(Boolean) ?? []

  const today = new Date().toISOString().split('T')[0]
  const { suggestions: sugKey, generatedAt: genAtKey } = typeKeys(mealType)

  const [goalsRes, logsRes, pantryRes, prefsRes] = await Promise.all([
    supabase.from('nutrition_goals').select('*').eq('user_id', user.id).single(),
    supabase.from('intake_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
    supabase.from('pantry_items').select('name, expiry_date').eq('user_id', user.id),
    supabase.from('food_preferences').select('*').eq('user_id', user.id).single(),
  ])

  const goals = goalsRes.data as NutritionGoals | null
  const logs = (logsRes.data ?? []) as IntakeLog[]
  const pantryData = pantryRes.data ?? []
  const pantryNames = pantryData.map((p: { name: string }) => p.name)
  const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const expiringItems = pantryData
    .filter((p: { expiry_date?: string | null }) => p.expiry_date && p.expiry_date <= in7days)
    .map((p: { name: string }) => p.name)
  const prefs = prefsRes.data as FoodPreferences | null

  const cached = prefs?.[sugKey] as AIRecipe[] | null | undefined
  const cachedAt = prefs?.[genAtKey] as string | null | undefined
  const alreadyUsedToday = usedToday(cachedAt)

  // If already generated today, return cached results (rate limit enforced)
  if (alreadyUsedToday && Array.isArray(cached) && cached.length > 0) {
    const visible = cached.filter(r => !dismissed.includes(r.id))
    return NextResponse.json({ recipes: visible, usedToday: true, generatedAt: cachedAt })
  }

  const actual = sumIntake(logs)
  const remaining = goals
    ? remainingNutrients(goals, actual)
    : { minCalories: 0, minProtein: 0, minCarbs: 0, maxFat: undefined as number | undefined }

  try {
    const recipes = await suggestMealsWithGemini({
      pantryItems: pantryNames.slice(0, 15),
      mealType,
      maxTime: maxTime ? Number(maxTime) : prefs?.max_cook_time_mins,
      cuisine: prefs?.cuisine_types?.[0],
      diet: prefs?.dietary_flags?.find(f => ['vegetarian', 'vegan', 'ketogenic', 'gluten free'].includes(f)),
      allergens: (prefs as any)?.allergens ?? [],
      expiringItems,
      caloriesNeeded: remaining.minCalories ? Math.round(remaining.minCalories * 0.3) : undefined,
      proteinNeeded: remaining.minProtein ? Math.round(remaining.minProtein * 0.3) : undefined,
      count: 6,
      dismissed,
    })

    const nowIso = new Date().toISOString()

    const { error: saveError } = await supabase.from('food_preferences').upsert(
      { user_id: user.id, [sugKey]: recipes, [genAtKey]: nowIso },
      { onConflict: 'user_id' }
    )
    if (saveError) console.error(`[meals/suggest] Failed to cache ${mealType}:`, saveError.message)

    return NextResponse.json({ recipes, usedToday: false, generatedAt: nowIso })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
